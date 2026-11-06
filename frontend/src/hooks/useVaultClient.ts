import { useState, useEffect, useCallback, useRef } from 'react'
import { parseEther } from 'viem'
import { CONTRACT_ADDRESSES, publicClient } from '../config/monad'
import { useWallet } from '../components/WalletProvider'
import { fetchDemoModeEnabled, fetchLiveVaults } from '../services/indexer'
import type { VaultData } from '../components/VaultDetailsModal'
import type { TxToastState } from '../components/TransactionToast'

const VAULT_ABI = [
  {
    type: 'function',
    name: 'createVault',
    inputs: [
      { name: '_recipient', type: 'address' },
      { name: '_recipientName', type: 'string' },
      { name: '_durationInDays', type: 'uint256' },
      { name: '_targetAmount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'contribute',
    inputs: [
      { name: '_vaultId', type: 'uint256' },
      { name: '_message', type: 'string' },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'releaseBirthdayGift',
    inputs: [
      { name: '_vaultId', type: 'uint256' },
      { name: '_isDemoMode', type: 'bool' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

const POLL_MS = 20_000

type VaultCall =
  | { functionName: 'createVault'; args: readonly [`0x${string}`, string, bigint, bigint]; value?: undefined }
  | { functionName: 'contribute'; args: readonly [bigint, string]; value: bigint }
  | { functionName: 'releaseBirthdayGift'; args: readonly [bigint, boolean]; value?: undefined }

// Upper bound and fallback. An estimate can come back absurdly high, and the RPC rejects those outright.
const MAX_GAS: Record<VaultCall['functionName'], bigint> = {
  createVault: 850_000n,
  contribute: 850_000n,
  releaseBirthdayGift: 1_200_000n,
}

export function useVaultClient() {
  const { address: walletAddress, authenticated, login, getWalletClient } = useWallet()

  const [vaults, setVaults] = useState<VaultData[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [demoModeEnabled, setDemoModeEnabled] = useState(false)
  const lastSnapshot = useRef('')

  const [toast, setToast] = useState<TxToastState>({
    isOpen: false,
    status: 'idle',
  })

  const closeToast = () => setToast((prev) => ({ ...prev, isOpen: false }))

  const refetch = useCallback(async () => {
    try {
      const { vaults: liveVaults } = await fetchLiveVaults()
      const snapshot = JSON.stringify(liveVaults)
      if (snapshot !== lastSnapshot.current) {
        lastSnapshot.current = snapshot
        setVaults(liveVaults)
      }
      setStatus('ready')
    } catch (err) {
      console.warn('Failed to load vaults:', err)
      // Keep showing the last good list; only an empty page needs the error state.
      setStatus((current) => (current === 'loading' || !lastSnapshot.current ? 'error' : current))
    }
  }, [])

  useEffect(() => {
    refetch()
    fetchDemoModeEnabled().then(setDemoModeEnabled)

    const poll = setInterval(() => {
      if (!document.hidden) refetch()
    }, POLL_MS)
    const onVisible = () => {
      if (!document.hidden) refetch()
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      clearInterval(poll)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [refetch])

  const sendVaultTx = async (
    call: VaultCall,
    messages: { submitting: string; mining: string; success: string; failure: string },
  ) => {
    if (!authenticated) {
      login()
      return false
    }

    let hash: `0x${string}` | undefined
    try {
      setToast({ isOpen: true, status: 'submitting', message: messages.submitting })

      const walletClient = await getWalletClient()
      const contract = { address: CONTRACT_ADDRESSES.vault, abi: VAULT_ABI, account: walletClient.account, ...call }

      // Surfaces the contract's revert reason before the wallet asks for a signature.
      await publicClient.simulateContract(contract as any)

      // Monad charges for the gas limit rather than the gas used, so keep the limit close to the real cost.
      const maxGas = MAX_GAS[call.functionName]
      const gas = await publicClient
        .estimateContractGas(contract as any)
        .then((estimate) => {
          const padded = (estimate * 12n) / 10n
          return padded < maxGas ? padded : maxGas
        })
        .catch(() => maxGas)

      hash = await walletClient.writeContract({ ...contract, gas } as any)
      setToast({ isOpen: true, status: 'mining', txHash: hash, message: messages.mining })

      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      if (receipt.status !== 'success') {
        throw new Error('The transaction reverted on-chain.')
      }

      await refetch()
      setToast({ isOpen: true, status: 'success', txHash: hash, message: messages.success })
      return true
    } catch (err: any) {
      console.error(`${call.functionName} failed:`, err)
      setToast({
        isOpen: true,
        status: 'error',
        txHash: hash,
        errorMessage: err?.shortMessage || err?.message || messages.failure,
      })
      return false
    }
  }

  const createVault = (data: {
    recipientAddress: string
    recipientName: string
    durationDays: number
    targetAmountMon: string
  }) =>
    sendVaultTx(
      {
        functionName: 'createVault',
        args: [
          data.recipientAddress as `0x${string}`,
          data.recipientName,
          BigInt(data.durationDays),
          parseEther(data.targetAmountMon),
        ],
      },
      {
        submitting: `Creating Birthday Vault for ${data.recipientName} on Monad Testnet...`,
        mining: 'Waiting for confirmation on Monad...',
        success: `Birthday Vault for ${data.recipientName} created on Monad!`,
        failure: 'Transaction rejected or failed.',
      },
    )

  const contribute = (vault: VaultData, amountMon: string, message: string) =>
    sendVaultTx(
      { functionName: 'contribute', args: [BigInt(vault.numericId), message], value: parseEther(amountMon) },
      {
        submitting: `Sending ${amountMon} MON contribution & wish on Monad Testnet...`,
        mining: `Transferring ${amountMon} MON to the vault...`,
        success: `Contributed ${amountMon} MON + wish to the vault!`,
        failure: 'Contribution failed.',
      },
    )

  const releaseGift = (vault: VaultData, isDemoMode: boolean) =>
    sendVaultTx(
      { functionName: 'releaseBirthdayGift', args: [BigInt(vault.numericId), isDemoMode] },
      {
        submitting: isDemoMode ? 'Running the demo release on Monad Testnet...' : 'Releasing the gift pool to the recipient...',
        mining: 'Minting the on-chain NFT booklet and transferring MON...',
        success: 'Gift released and NFT booklet minted!',
        failure: 'Release failed.',
      },
    )

  return {
    vaults,
    status,
    demoModeEnabled,
    walletAddress,
    toast,
    closeToast,
    createVault,
    contribute,
    releaseGift,
    refetch,
  }
}

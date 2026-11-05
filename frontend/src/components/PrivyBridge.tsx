import { useEffect, useRef } from 'react'
import { PrivyProvider, usePrivy, useWallets, type ConnectedWallet } from '@privy-io/react-auth'
import { createWalletClient, custom } from 'viem'
import { EXPLORER_URL, MONAD_RPC_URL, monadTestnet } from '../config/monad'
import { shortAddress } from '../lib/vault'
import type { WalletSession } from './WalletProvider'

const MONAD_CHAIN_HEX = `0x${monadTestnet.id.toString(16)}`

interface PrivyBridgeProps {
  onSessionChange: (session: WalletSession) => void
}

// Returns a wallet client only once the wallet is really on Monad Testnet.
async function connectWalletClient(wallets: ConnectedWallet[], preferredAddress?: string) {
  const activeWallet =
    wallets.find((w) => w.address.toLowerCase() === preferredAddress?.toLowerCase()) ??
    wallets.find((w) => w.walletClientType === 'privy') ??
    wallets[0]

  if (!activeWallet) {
    throw new Error('Your wallet is still connecting. Try again in a moment.')
  }

  const provider = await activeWallet.getEthereumProvider()

  try {
    await activeWallet.switchChain(monadTestnet.id)
  } catch (switchErr) {
    console.warn('Network switch failed, trying to add Monad Testnet:', switchErr)
    await provider.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: MONAD_CHAIN_HEX,
          chainName: monadTestnet.name,
          nativeCurrency: monadTestnet.nativeCurrency,
          rpcUrls: [MONAD_RPC_URL],
          blockExplorerUrls: [EXPLORER_URL],
        },
      ],
    })
    await provider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: MONAD_CHAIN_HEX }] })
  }

  // A transaction sent on the wrong network could lose funds, so ask the wallet instead of assuming.
  const walletChainId = Number(await provider.request({ method: 'eth_chainId' }))
  if (walletChainId !== monadTestnet.id) {
    throw new Error('Please switch your wallet to Monad Testnet and try again.')
  }

  return createWalletClient({
    account: activeWallet.address as `0x${string}`,
    chain: monadTestnet,
    transport: custom(provider),
  })
}

function SessionPublisher({ onSessionChange }: PrivyBridgeProps) {
  const { ready, authenticated, user, login, logout } = usePrivy()
  const { wallets } = useWallets()

  const address = user?.wallet?.address
  const label = user?.email?.address || user?.twitter?.username || (address ? shortAddress(address) : 'Connected')

  // Privy returns new function and array identities on every render. Publishing those would
  // re-render this component forever, so the session reads them through a ref instead.
  const latest = useRef({ login, logout, wallets, address })
  latest.current = { login, logout, wallets, address }

  useEffect(() => {
    onSessionChange({
      ready,
      authenticated,
      address,
      label,
      login: () => latest.current.login(),
      logout: () => latest.current.logout(),
      getWalletClient: () => connectWalletClient(latest.current.wallets, latest.current.address),
    })
  }, [ready, authenticated, address, label, onSessionChange])

  return null
}

export default function PrivyBridge({ onSessionChange }: PrivyBridgeProps) {
  return (
    <PrivyProvider
      appId={import.meta.env.VITE_PRIVY_APP_ID || 'cmsjzas9f00hp0dkyqchbro5k'}
      config={{
        loginMethods: ['google', 'twitter', 'email', 'wallet'],
        appearance: {
          theme: 'dark',
          accentColor: '#836EF9',
          logo: 'https://monad.xyz/favicon.ico',
        },
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'users-without-wallets',
          },
        },
        defaultChain: monadTestnet,
        supportedChains: [monadTestnet],
      }}
    >
      <SessionPublisher onSessionChange={onSessionChange} />
    </PrivyProvider>
  )
}

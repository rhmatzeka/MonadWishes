import { formatEther } from 'viem'
import { CONTRACT_ADDRESSES, publicClient } from '../config/monad'
import { decodeTokenUriImage, shortAddress } from '../lib/vault'
import type { VaultData, GreetingItem } from '../components/VaultDetailsModal'

// Optional: without a URL the app reads straight from the chain.
const INDEXER_GRAPHQL_URL: string | undefined = import.meta.env.VITE_INDEXER_GRAPHQL_URL
const INDEXER_TIMEOUT_MS = 3_000
const INDEXER_RETRY_MS = 5 * 60_000
const INDEXER_FIRST_TRY_DELAY_MS = 15_000

// The first load always uses RPC, so a dead indexer can never hold up the vault list.
let indexerRetryAt = Date.now() + INDEXER_FIRST_TRY_DELAY_MS

const READ_VAULT_ABI = [
  {
    type: 'function',
    name: 'vaultCounter',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'vaults',
    inputs: [{ name: '', type: 'uint256' }],
    outputs: [
      { name: 'id', type: 'uint256' },
      { name: 'creator', type: 'address' },
      { name: 'recipient', type: 'address' },
      { name: 'recipientName', type: 'string' },
      { name: 'targetAmount', type: 'uint256' },
      { name: 'birthdayTimestamp', type: 'uint256' },
      { name: 'totalCollected', type: 'uint256' },
      { name: 'isClaimed', type: 'bool' },
      { name: 'isYieldActive', type: 'bool' },
      { name: 'nftTokenId', type: 'uint256' },
      { name: 'createdAt', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'demoModeEnabled',
    inputs: [],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getGreetings',
    inputs: [{ name: '_vaultId', type: 'uint256' }],
    outputs: [
      {
        type: 'tuple[]',
        components: [
          { name: 'sender', type: 'address' },
          { name: 'amount', type: 'uint256' },
          { name: 'message', type: 'string' },
          { name: 'timestamp', type: 'uint256' },
        ],
      },
    ],
    stateMutability: 'view',
  },
] as const

const NFT_ABI = [
  {
    type: 'function',
    name: 'tokenURI',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
  },
] as const

const VAULT_GRAPHQL_QUERY = `
  query GetVaults {
    VaultEntity(order_by: { vaultId: desc }) {
      id
      vaultId
      creator
      recipient
      recipientName
      targetAmount
      birthdayTimestamp
      totalCollected
      isClaimed
      createdAt
    }
    ContributionEntity(order_by: { id: desc }) {
      id
      vaultId
      contributor
      amount
      message
      timestamp
      txHash
    }
    GiftClaimEntity {
      id
      vaultId
      nftTokenId
    }
  }
`

/**
 * Primary: Fetch Vaults & Greetings from Envio HyperIndex GraphQL
 */
async function fetchVaultsFromIndexer(url: string): Promise<VaultData[]> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: VAULT_GRAPHQL_QUERY }),
    signal: AbortSignal.timeout(INDEXER_TIMEOUT_MS),
  })

  if (!response.ok) {
    throw new Error(`Indexer responded with status ${response.status}`)
  }

  const result = await response.json()
  if (result.errors && result.errors.length > 0) {
    throw new Error(result.errors[0].message)
  }

  const { VaultEntity = [], ContributionEntity = [], GiftClaimEntity = [] } = result.data || {}

  return VaultEntity.map((v: any) => {
    const numericId = Number(v.vaultId || v.id)
    const vaultContributions = ContributionEntity.filter((c: any) => Number(c.vaultId) === numericId)
    const claim = GiftClaimEntity.find((gc: any) => Number(gc.vaultId) === numericId)

    const greetings: GreetingItem[] = vaultContributions.map((c: any, index: number) => ({
      id: c.id || `g-${index}`,
      sender: shortAddress(c.contributor),
      amountMon: Number(formatEther(BigInt(c.amount || '0'))),
      message: c.message || '',
      timestamp: Number(c.timestamp) * 1000,
    }))

    return {
      id: String(numericId),
      numericId,
      recipientName: v.recipientName,
      recipientAddress: v.recipient,
      creatorAddress: v.creator,
      targetAmountMon: Number(formatEther(BigInt(v.targetAmount || '0'))),
      totalCollectedMon: Number(formatEther(BigInt(v.totalCollected || '0'))),
      birthdayTimestamp: Number(v.birthdayTimestamp) * 1000,
      createdAt: Number(v.createdAt) * 1000,
      isClaimed: Boolean(v.isClaimed),
      nftTokenId: claim ? Number(claim.nftTokenId) : 0,
      greetings,
    }
  })
}

/**
 * Reads every vault and its greetings straight from the chain in one multicall.
 */
async function fetchVaultsFromRPC(): Promise<VaultData[]> {
  const vaultContract = { address: CONTRACT_ADDRESSES.vault, abi: READ_VAULT_ABI } as const

  const count = Number(await publicClient.readContract({ ...vaultContract, functionName: 'vaultCounter' }))
  if (count === 0) return []

  const ids = Array.from({ length: count }, (_, index) => BigInt(count - index))
  const [vaultResults, greetingResults] = await Promise.all([
    publicClient.multicall({
      contracts: ids.map((id) => ({ ...vaultContract, functionName: 'vaults', args: [id] }) as const),
    }),
    publicClient.multicall({
      contracts: ids.map((id) => ({ ...vaultContract, functionName: 'getGreetings', args: [id] }) as const),
    }),
  ])

  const vaults: VaultData[] = []
  ids.forEach((id, index) => {
    const vaultResult = vaultResults[index]
    const greetingResult = greetingResults[index]
    if (vaultResult.status !== 'success' || greetingResult.status !== 'success') {
      console.warn(`Could not read vault #${id} from RPC`)
      return
    }

    const [, creator, recipient, recipientName, targetAmount, birthdayTimestamp, totalCollected, isClaimed, , nftTokenId, createdAt] =
      vaultResult.result

    const greetings: GreetingItem[] = greetingResult.result.map((g, greetingIndex) => ({
      id: `g-rpc-${id}-${greetingIndex}`,
      sender: shortAddress(g.sender),
      amountMon: Number(formatEther(g.amount)),
      message: g.message,
      timestamp: Number(g.timestamp) * 1000,
    }))

    vaults.push({
      id: String(id),
      numericId: Number(id),
      recipientName,
      recipientAddress: recipient,
      creatorAddress: creator,
      targetAmountMon: Number(formatEther(targetAmount)),
      totalCollectedMon: Number(formatEther(totalCollected)),
      birthdayTimestamp: Number(birthdayTimestamp) * 1000,
      createdAt: Number(createdAt) * 1000,
      isClaimed,
      nftTokenId: Number(nftTokenId),
      greetings,
    })
  })

  return vaults
}

/**
 * Uses the indexer when one is configured and healthy, otherwise the chain.
 * A failing indexer is skipped for a few minutes so it cannot slow down every refresh.
 */
export async function fetchLiveVaults(): Promise<{ vaults: VaultData[]; source: 'indexer' | 'rpc' }> {
  if (INDEXER_GRAPHQL_URL && Date.now() >= indexerRetryAt) {
    try {
      return { vaults: await fetchVaultsFromIndexer(INDEXER_GRAPHQL_URL), source: 'indexer' }
    } catch (err) {
      indexerRetryAt = Date.now() + INDEXER_RETRY_MS
      console.warn('Indexer unavailable, reading from Monad RPC:', err)
    }
  }
  return { vaults: await fetchVaultsFromRPC(), source: 'rpc' }
}

/** Contracts deployed before setDemoMode existed have no flag and always allow demo release. */
export async function fetchDemoModeEnabled(): Promise<boolean> {
  try {
    return await publicClient.readContract({
      address: CONTRACT_ADDRESSES.vault,
      abi: READ_VAULT_ABI,
      functionName: 'demoModeEnabled',
    })
  } catch {
    return true
  }
}

/** Returns the SVG image stored on-chain for a minted booklet. */
export async function fetchBookletImage(tokenId: number): Promise<string | null> {
  const tokenUri = await publicClient.readContract({
    address: CONTRACT_ADDRESSES.nft,
    abi: NFT_ABI,
    functionName: 'tokenURI',
    args: [BigInt(tokenId)],
  })
  return decodeTokenUriImage(tokenUri)
}

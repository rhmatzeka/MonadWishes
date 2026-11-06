import { createPublicClient, defineChain, http } from 'viem'
import { monadTestnet as viemMonadTestnet } from 'viem/chains'

export const MONAD_RPC_URL = 'https://testnet-rpc.monad.xyz'
export const EXPLORER_URL = 'https://testnet.monadexplorer.com'

// viem's definition carries the multicall3 address, which lets the app read every vault in one request.
export const monadTestnet = defineChain({
  ...viemMonadTestnet,
  rpcUrls: { default: { http: [MONAD_RPC_URL] } },
  blockExplorers: { default: { name: 'Monad Explorer', url: EXPLORER_URL } },
})

export const publicClient = createPublicClient({
  chain: monadTestnet,
  transport: http(MONAD_RPC_URL),
})

// Deployed Smart Contract Addresses on Monad Testnet
export const CONTRACT_ADDRESSES = {
  vault: (import.meta.env.VITE_VAULT_ADDRESS || '0x24d1C9A1424CeEF852Dfcb65c59726a870e635B8') as `0x${string}`,
  nft: (import.meta.env.VITE_NFT_ADDRESS || '0xC69aE4138DBc33389B1b25130f68E91b2A0169B8') as `0x${string}`,
  pyth: '0x2880aB155794e7179c9eE2e38200202908C17B43' as `0x${string}`,
}

export const PYTH_MON_USD_FEED = '0x31491744e2dbf6df7fcf4ac0820d18a609b49076d45066d3568424e62f686cd1' as `0x${string}`

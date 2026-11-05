import { useSyncExternalStore } from 'react'
import { CONTRACT_ADDRESSES, PYTH_MON_USD_FEED, publicClient } from '../config/monad'
import { formatCountdown, formatPythPrice } from '../lib/vault'

export interface PythPriceData {
  price: number // USD price of 1 MON, 0 while unknown
  formatted: string
  age: string | null // how old the on-chain price is, when it is more than an hour old
}

const REFRESH_MS = 60_000
const STALE_MS = 3_600_000

const PYTH_ABI = [
  {
    type: 'function',
    name: 'getPriceUnsafe',
    inputs: [{ name: 'id', type: 'bytes32' }],
    outputs: [
      {
        type: 'tuple',
        components: [
          { name: 'price', type: 'int64' },
          { name: 'conf', type: 'uint64' },
          { name: 'expo', type: 'int32' },
          { name: 'publishTime', type: 'uint256' },
        ],
      },
    ],
    stateMutability: 'view',
  },
] as const

const UNKNOWN: PythPriceData = { price: 0, formatted: 'N/A', age: null }

// One shared poller for every component on the page.
let snapshot = UNKNOWN
let timer: ReturnType<typeof setInterval> | undefined
const listeners = new Set<() => void>()

async function refresh() {
  if (document.hidden) return
  try {
    // Hermes now requires an API key, so the price comes from the Pyth contract on Monad instead.
    const feed = await publicClient.readContract({
      address: CONTRACT_ADDRESSES.pyth,
      abi: PYTH_ABI,
      functionName: 'getPriceUnsafe',
      args: [PYTH_MON_USD_FEED],
    })
    const price = formatPythPrice(feed.price, feed.expo)
    if (price <= 0) return
    const ageMs = Date.now() - Number(feed.publishTime) * 1000
    snapshot = {
      price,
      formatted: `$${price < 0.1 ? price.toFixed(4) : price.toFixed(2)}`,
      age: ageMs > STALE_MS ? formatCountdown(ageMs) : null,
    }
    listeners.forEach((notify) => notify())
  } catch (err) {
    console.warn('Could not read MON/USD from Pyth:', err)
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  if (listeners.size === 1) {
    refresh()
    timer = setInterval(refresh, REFRESH_MS)
  }
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) clearInterval(timer)
  }
}

export function usePythPrice() {
  return useSyncExternalStore(subscribe, () => snapshot, () => UNKNOWN)
}

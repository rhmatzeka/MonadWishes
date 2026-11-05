const THIRTY_DAYS_MS = 30 * 86_400_000
const YIELD_PER_30_DAYS = 0.005
const MAX_NAME_BYTES = 48

export const MAX_MESSAGE_LENGTH = 280

/** Same formula as calculateYieldBonus in MonadBirthdayVault.sol, stopping at the birthday. */
export function accruedYieldMon(principalMon: number, createdAtMs: number, birthdayMs: number, nowMs: number) {
  const elapsed = Math.min(nowMs, birthdayMs) - createdAtMs
  if (principalMon <= 0 || elapsed <= 0) return 0
  return (principalMon * YIELD_PER_30_DAYS * elapsed) / THIRTY_DAYS_MS
}

export function progressPercent(collectedMon: number, targetMon: number) {
  if (targetMon <= 0) return collectedMon > 0 ? 100 : 0
  return Math.min(100, Math.round((collectedMon / targetMon) * 100))
}

export function formatCountdown(ms: number) {
  const minutes = Math.floor(ms / 60_000)
  if (minutes < 1) return '<1m'
  const days = Math.floor(minutes / 1440)
  const hours = Math.floor((minutes % 1440) / 60)
  if (days > 0) return `${days}d ${hours}h`
  return `${hours > 0 ? `${hours}h ` : ''}${minutes % 60}m`
}

export function formatUsd(mon: number, price: number) {
  return price > 0 ? `$${(mon * price).toFixed(2)}` : '—'
}

export function formatPythPrice(price: bigint, expo: number) {
  return Number(price) * 10 ** expo
}

export function shortAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

/** Mirrors _isSafeName in the vault contract, so the form fails before a transaction does. */
export function recipientNameError(name: string) {
  if (!name.trim()) return 'Enter the recipient name.'
  if (new TextEncoder().encode(name).length > MAX_NAME_BYTES) return 'Name is too long (48 characters max).'
  if (/["<>&\\]/.test(name)) return 'Name cannot contain " < > & or \\.'
  return null
}

export function decodeTokenUriImage(tokenUri: string) {
  const prefix = 'data:application/json;base64,'
  if (!tokenUri.startsWith(prefix)) return null
  try {
    const bytes = Uint8Array.from(atob(tokenUri.slice(prefix.length)), (c) => c.charCodeAt(0))
    const image = JSON.parse(new TextDecoder().decode(bytes)).image
    return typeof image === 'string' ? image : null
  } catch {
    return null
  }
}

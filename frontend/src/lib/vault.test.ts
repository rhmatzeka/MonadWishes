import { describe, expect, test } from 'bun:test'
import {
  accruedYieldMon,
  decodeTokenUriImage,
  formatCountdown,
  formatPythPrice,
  formatUsd,
  progressPercent,
  recipientNameError,
} from './vault'

const DAY = 86_400_000

describe('accruedYieldMon', () => {
  test('matches the contract: 0.5% per 30 days', () => {
    expect(accruedYieldMon(100, 0, 60 * DAY, 30 * DAY)).toBeCloseTo(0.5)
  })
  test('stops at the birthday', () => {
    expect(accruedYieldMon(100, 0, 30 * DAY, 365 * DAY)).toBeCloseTo(0.5)
  })
  test('is zero before creation or without principal', () => {
    expect(accruedYieldMon(100, 10 * DAY, 30 * DAY, 0)).toBe(0)
    expect(accruedYieldMon(0, 0, 30 * DAY, 10 * DAY)).toBe(0)
  })
})

describe('progressPercent', () => {
  test('caps at 100 and survives a zero target', () => {
    expect(progressPercent(5, 10)).toBe(50)
    expect(progressPercent(50, 10)).toBe(100)
    expect(progressPercent(5, 0)).toBe(100)
    expect(progressPercent(0, 0)).toBe(0)
  })
})

describe('formatCountdown', () => {
  test('shows the two largest units', () => {
    expect(formatCountdown(2 * DAY + 3 * 3_600_000)).toBe('2d 3h')
    expect(formatCountdown(3 * 3_600_000 + 5 * 60_000)).toBe('3h 5m')
    expect(formatCountdown(30_000)).toBe('<1m')
  })
})

describe('formatUsd', () => {
  test('hides the value when the price is unknown', () => {
    expect(formatUsd(10, 0)).toBe('—')
    expect(formatUsd(10, 0.5)).toBe('$5.00')
  })
})

describe('formatPythPrice', () => {
  test('applies the exponent', () => {
    expect(formatPythPrice(2761907n, -8)).toBeCloseTo(0.02761907)
  })
})

describe('recipientNameError', () => {
  test('follows the contract rules', () => {
    expect(recipientNameError('Alice Smith')).toBeNull()
    expect(recipientNameError('')).not.toBeNull()
    expect(recipientNameError('Al"ice')).not.toBeNull()
    expect(recipientNameError('<b>')).not.toBeNull()
    expect(recipientNameError('a'.repeat(49))).not.toBeNull()
    expect(recipientNameError('é'.repeat(25))).not.toBeNull() // 50 bytes
  })
})

describe('decodeTokenUriImage', () => {
  test('pulls the image out of an on-chain data URI', () => {
    const json = JSON.stringify({ name: 'x', image: 'data:image/svg+xml;base64,AAAA' })
    const uri = `data:application/json;base64,${btoa(json)}`
    expect(decodeTokenUriImage(uri)).toBe('data:image/svg+xml;base64,AAAA')
  })
  test('returns null for anything else', () => {
    expect(decodeTokenUriImage('https://example.com/1.json')).toBeNull()
    expect(decodeTokenUriImage('data:application/json;base64,!!!')).toBeNull()
  })
})

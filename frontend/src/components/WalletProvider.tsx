import React, { Suspense, createContext, lazy, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { WalletClient } from 'viem'

export interface WalletSession {
  ready: boolean
  authenticated: boolean
  address?: string
  label?: string
  login: () => void
  logout: () => void
  getWalletClient: () => Promise<WalletClient>
}

interface WalletContextValue {
  authenticated: boolean
  address?: string
  label?: string
  connecting: boolean
  login: () => void
  logout: () => void
  getWalletClient: () => Promise<WalletClient>
}

// Privy is about 3 MB of JavaScript, so it stays out of the first load. It arrives when someone
// logs in, or straight away for a visitor who was logged in last time.
const PrivyBridge = lazy(() => import('./PrivyBridge'))

const SESSION_FLAG = 'monadwishes:wallet-session'

function readSessionFlag() {
  try {
    return window.localStorage.getItem(SESSION_FLAG) === '1'
  } catch {
    return false
  }
}

function writeSessionFlag(active: boolean) {
  try {
    if (active) window.localStorage.setItem(SESSION_FLAG, '1')
    else window.localStorage.removeItem(SESSION_FLAG)
  } catch {
    // Storage can be blocked; the visitor just logs in again next time.
  }
}

const WalletContext = createContext<WalletContextValue | null>(null)

export function useWallet() {
  const value = useContext(WalletContext)
  if (!value) throw new Error('useWallet must be used inside WalletProvider')
  return value
}

export default function WalletProvider({ children }: { children: React.ReactNode }) {
  const [bridgeEnabled, setBridgeEnabled] = useState(false)
  const [session, setSession] = useState<WalletSession | null>(null)
  const [loginRequested, setLoginRequested] = useState(false)
  const wasAuthenticated = useRef(false)

  useEffect(() => {
    if (readSessionFlag()) setBridgeEnabled(true)
  }, [])

  useEffect(() => {
    if (!session?.ready) return
    if (session.authenticated) {
      wasAuthenticated.current = true
      writeSessionFlag(true)
    } else if (wasAuthenticated.current || readSessionFlag()) {
      wasAuthenticated.current = false
      writeSessionFlag(false)
    }
    if (loginRequested) {
      setLoginRequested(false)
      if (!session.authenticated) session.login()
    }
  }, [session, loginRequested])

  const value = useMemo<WalletContextValue>(
    () => ({
      authenticated: Boolean(session?.authenticated),
      address: session?.address,
      label: session?.label,
      connecting: loginRequested || (bridgeEnabled && !session?.ready),
      login: () => {
        setBridgeEnabled(true)
        setLoginRequested(true)
      },
      logout: () => session?.logout(),
      getWalletClient: () => {
        if (!session) throw new Error('Your wallet is still connecting. Try again in a moment.')
        return session.getWalletClient()
      },
    }),
    [session, bridgeEnabled, loginRequested],
  )

  return (
    <WalletContext.Provider value={value}>
      {children}
      {bridgeEnabled && (
        <Suspense fallback={null}>
          <PrivyBridge onSessionChange={setSession} />
        </Suspense>
      )}
    </WalletContext.Provider>
  )
}

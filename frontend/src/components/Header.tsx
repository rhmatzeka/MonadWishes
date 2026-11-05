import React, { useState, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { formatEther } from 'viem'
import { ArrowUpRightIcon, CheckIcon, CoinsIcon, CopyIcon, GiftIcon, ListIcon, SignInIcon, SignOutIcon, SparkleIcon, WalletIcon, XIcon } from '@phosphor-icons/react'

import { useWallet } from './WalletProvider'
import { publicClient } from '../config/monad'

const BALANCE_REFRESH_MS = 15_000

function useMonBalance(address?: string) {
  const [balance, setBalance] = useState<bigint | null>(null)

  useEffect(() => {
    setBalance(null)
    if (!address) return
    let isCurrent = true
    const load = () => {
      if (document.hidden) return
      publicClient
        .getBalance({ address: address as `0x${string}` })
        .then((value) => {
          if (isCurrent) setBalance(value)
        })
        .catch((err) => console.warn('Could not read MON balance:', err))
    }
    load()
    const interval = setInterval(load, BALANCE_REFRESH_MS)
    return () => {
      isCurrent = false
      clearInterval(interval)
    }
  }, [address])

  return balance
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b-4 border-black bg-[#FFFDF5] px-4 shadow-[0_4px_0px_0px_#000]">
      <nav className="max-w-7xl mx-auto flex items-center justify-between py-3">
        {/* Neo-Brutalist Brand Logo */}
        <Link
          to="/"
          className="flex items-center gap-3 no-underline group"
          onClick={() => setIsMenuOpen(false)}
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#CCFF00] border-3 border-black shadow-[3px_3px_0px_0px_#000] group-hover:translate-x-[-2px] group-hover:translate-y-[-2px] transition-all">
            <GiftIcon weight="bold" className="h-6 w-6 text-black" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tight text-black uppercase bg-[#CCFF00] px-2 border-2 border-black shadow-[2px_2px_0px_0px_#000] leading-none py-0.5">
              MonadWishes
            </span>
            <span className="text-[10px] font-black tracking-wider text-black uppercase mt-1">
              Monad Testnet • 0.3s Finality
            </span>
          </div>
        </Link>

        {/* Desktop Navigation & Controls */}
        <div className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-6 text-sm font-black uppercase text-black">
            <Link
              to="/"
              className="hover:bg-[#CCFF00] px-2 py-1 border-2 border-black shadow-[2px_2px_0px_0px_#000] transition-all"
              activeProps={{ className: 'bg-[#CCFF00] font-black border-2 border-black shadow-[2px_2px_0px_0px_#000]' }}
            >
              Explore Vaults
            </Link>
            <a
              href="https://testnet.monadexplorer.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 hover:bg-[#00E5FF] px-2 py-1 border-2 border-black shadow-[2px_2px_0px_0px_#000] transition-all text-black"
            >
              Explorer <ArrowUpRightIcon weight="bold" className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>

          <div className="flex items-center gap-3">
            <WalletControls />
          </div>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden flex h-11 w-11 items-center justify-center rounded-lg bg-[#CCFF00] border-3 border-black shadow-[3px_3px_0px_0px_#000] active:translate-x-[0px] active:translate-y-[0px] active:shadow-none hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all cursor-pointer text-black"
          aria-label="Toggle Menu"
        >
          {isMenuOpen ? <XIcon weight="bold" className="h-6 w-6" /> : <ListIcon weight="bold" className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile Drawer (Sidebar Menu) */}
      {isMenuOpen && (
        <>
          {/* Overlay / Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="fixed top-0 right-0 z-50 h-full w-[280px] border-l-4 border-black bg-[#FFFDF5] p-6 shadow-[-6px_0px_0px_0px_#000] flex flex-col justify-between transition-transform duration-300 transform translate-x-0">
            <div className="space-y-6">
              {/* Header inside drawer */}
              <div className="flex items-center justify-between pb-4 border-b-3 border-black">
                <span className="text-lg font-black uppercase text-black bg-[#CCFF00] px-2 py-0.5 border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                  Menu
                </span>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  aria-label="Close menu"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FF5252] border-3 border-black shadow-[2px_2px_0px_0px_#000] text-black font-black"
                >
                  <XIcon weight="bold" className="h-5 w-5" />
                </button>
              </div>

              {/* Mobile Navigation Links */}
              <div className="flex flex-col gap-4 font-black uppercase text-black text-sm">
                <Link
                  to="/"
                  onClick={() => setIsMenuOpen(false)}
                  className="hover:bg-[#CCFF00] px-4 py-3 border-3 border-black shadow-[3px_3px_0px_0px_#000] transition-all text-center bg-white"
                  activeProps={{ className: 'bg-[#CCFF00] font-black border-3 border-black shadow-[3px_3px_0px_0px_#000] text-center' }}
                >
                  Explore Vaults
                </Link>
                <a
                  href="https://testnet.monadexplorer.com"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setIsMenuOpen(false)}
                  className="inline-flex items-center justify-center gap-1 hover:bg-[#00E5FF] px-4 py-3 border-3 border-black shadow-[3px_3px_0px_0px_#000] transition-all text-center bg-white text-black"
                >
                  Explorer <ArrowUpRightIcon weight="bold" className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
            </div>

            {/* Mobile Auth Controls at bottom of drawer */}
            <div className="pt-6 border-t-3 border-black">
              <WalletControls isMobile={true} onClose={() => setIsMenuOpen(false)} />
            </div>
          </div>
        </>
      )}
    </header>
  )
}

function WalletControls({ isMobile = false, onClose = () => {} }: { isMobile?: boolean; onClose?: () => void }) {
  const { login, logout, authenticated, address: walletAddress, label: userIdentifier, connecting } = useWallet()
  const [copied, setCopied] = useState(false)

  const balance = useMonBalance(walletAddress)
  const formattedBalance = balance === null ? '...' : `${parseFloat(formatEther(balance)).toFixed(3)} MON`

  const handleCopyAddress = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (authenticated) {
    return (
      <div className={`flex ${isMobile ? 'flex-col gap-4' : 'items-center gap-2'}`}>
        {/* Monad Native Token Balance Badge */}
        {walletAddress && (
          <div className={`flex items-center justify-center gap-1.5 rounded-lg border-3 border-black bg-[#00E5FF] px-3 py-1.5 text-xs font-black text-black shadow-[3px_3px_0px_0px_#000] ${isMobile ? 'w-full py-2.5' : ''}`}>
            <CoinsIcon weight="bold" className="h-4 w-4 text-black" />
            <span>{formattedBalance}</span>
          </div>
        )}

        {/* User Identity / Wallet Address Pill */}
        <div className={`flex items-center justify-center gap-2 rounded-lg border-3 border-black bg-[#FFD600] px-3 py-1.5 text-xs font-black text-black shadow-[3px_3px_0px_0px_#000] ${isMobile ? 'w-full py-2.5' : 'max-w-[150px] sm:max-w-none'}`}>
          <WalletIcon weight="bold" className="h-4 w-4 text-black shrink-0" />
          <span className="truncate max-w-[70px] sm:max-w-[120px]">{userIdentifier}</span>

          {walletAddress && (
            <button
              onClick={handleCopyAddress}
              className="ml-1 rounded border-2 border-black bg-white p-1 text-black hover:bg-[#CCFF00] transition-all flex items-center justify-center shadow-[1px_1px_0px_0px_#000] shrink-0 w-6 h-6"
              title="Copy Privy Wallet Address"
              aria-label="Copy wallet address"
            >
              {copied ? (
                <CheckIcon weight="bold" className="h-3.5 w-3.5 text-black" />
              ) : (
                <CopyIcon weight="bold" className="h-3.5 w-3.5 text-black" />
              )}
            </button>
          )}
        </div>

        <button
          onClick={() => {
            logout()
            onClose()
          }}
          className={`flex items-center justify-center gap-2 rounded-lg border-3 border-black bg-[#FF5252] text-black hover:bg-[#FF0000] hover:text-white shadow-[3px_3px_0px_0px_#000] transition-all font-black shrink-0 ${isMobile ? 'w-full py-2.5' : 'p-2'}`}
          title="Disconnect"
          aria-label="Disconnect"
        >
          <SignOutIcon weight="bold" className="h-4 w-4" />
          {isMobile && <span>Disconnect</span>}
        </button>
      </div>
    )
  }

  return (
    <button
      disabled={connecting}
      onClick={() => {
        login()
        onClose()
      }}
      className={`disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center gap-2 rounded-lg border-3 border-black bg-[#CCFF00] px-4 py-2 text-xs sm:text-sm font-black text-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] active:translate-x-[0px] active:translate-y-[0px] active:shadow-none transition-all uppercase tracking-wide ${isMobile ? 'w-full py-3 text-sm' : 'sm:px-5'}`}
    >
      <SignInIcon weight="bold" className="h-4 w-4" />
      <span>{connecting ? 'Connecting...' : 'Login Wallet'}</span>
      <SparkleIcon weight="bold" className="h-4 w-4 text-black animate-spin" style={{ animationDuration: '3s' }} />
    </button>
  )
}

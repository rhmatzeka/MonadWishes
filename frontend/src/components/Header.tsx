import React, { useState, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { usePrivy } from '@privy-io/react-auth'
import { useBalance } from 'wagmi'
import { formatEther } from 'viem'
import { Wallet, LogIn, LogOut, Gift, Sparkles, Copy, Check, Coins, Menu, X } from 'lucide-react'

import { monadTestnet } from '../config/monad'

export default function Header() {
  const [mounted, setMounted] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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
            <Gift className="h-6 w-6 text-black" />
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
              className="hover:bg-[#00E5FF] px-2 py-1 border-2 border-black shadow-[2px_2px_0px_0px_#000] transition-all text-black"
            >
              Explorer ↗
            </a>
          </div>

          <div className="flex items-center gap-3">
            {mounted ? <PrivyHeaderControls /> : (
              <div className="h-10 w-32 rounded-lg border-3 border-black bg-slate-200 animate-pulse shadow-[3px_3px_0px_0px_#000]" />
            )}
          </div>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden flex h-11 w-11 items-center justify-center rounded-lg bg-[#CCFF00] border-3 border-black shadow-[3px_3px_0px_0px_#000] active:translate-x-[0px] active:translate-y-[0px] active:shadow-none hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all cursor-pointer text-black"
          aria-label="Toggle Menu"
        >
          {isMenuOpen ? <X className="h-6 w-6 stroke-[3]" /> : <Menu className="h-6 w-6 stroke-[3]" />}
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
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FF5252] border-3 border-black shadow-[2px_2px_0px_0px_#000] text-black font-black"
                >
                  <X className="h-5 w-5 stroke-[3]" />
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
                  className="hover:bg-[#00E5FF] px-4 py-3 border-3 border-black shadow-[3px_3px_0px_0px_#000] transition-all text-center bg-white text-black"
                >
                  Explorer ↗
                </a>
              </div>
            </div>

            {/* Mobile Auth Controls at bottom of drawer */}
            <div className="pt-6 border-t-3 border-black">
              {mounted ? (
                <PrivyHeaderControls isMobile={true} onClose={() => setIsMenuOpen(false)} />
              ) : (
                <div className="h-12 w-full rounded-lg border-3 border-black bg-slate-200 animate-pulse shadow-[3px_3px_0px_0px_#000]" />
              )}
            </div>
          </div>
        </>
      )}
    </header>
  )
}

function PrivyHeaderControls({ isMobile = false, onClose = () => {} }: { isMobile?: boolean; onClose?: () => void }) {
  const { login, logout, authenticated, user } = usePrivy()
  const [copied, setCopied] = useState(false)

  const walletAddress = user?.wallet?.address
  const truncatedAddress = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : null

  const userIdentifier = user?.email?.address || user?.twitter?.username || truncatedAddress || 'Connected'

  // Fetch live MON balance for the Privy wallet on Monad Testnet
  const { data: balanceData, isLoading: isBalanceLoading } = useBalance({
    address: walletAddress as `0x${string}` | undefined,
    chainId: monadTestnet.id,
  })

  const formattedBalance = balanceData
    ? `${parseFloat(formatEther(balanceData.value)).toFixed(3)} MON`
    : '0.000 MON'

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
            <Coins className="h-4 w-4 text-black" />
            <span>{isBalanceLoading ? '...' : formattedBalance}</span>
          </div>
        )}

        {/* User Identity / Wallet Address Pill */}
        <div className={`flex items-center justify-center gap-2 rounded-lg border-3 border-black bg-[#FFD600] px-3 py-1.5 text-xs font-black text-black shadow-[3px_3px_0px_0px_#000] ${isMobile ? 'w-full py-2.5' : 'max-w-[150px] sm:max-w-none'}`}>
          <Wallet className="h-4 w-4 text-black shrink-0" />
          <span className="truncate max-w-[70px] sm:max-w-[120px]">{userIdentifier}</span>

          {walletAddress && (
            <button
              onClick={handleCopyAddress}
              className="ml-1 rounded border-2 border-black bg-white p-1 text-black hover:bg-[#CCFF00] transition-all flex items-center justify-center shadow-[1px_1px_0px_0px_#000] shrink-0 w-6 h-6"
              title="Copy Privy Wallet Address"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-black" />
              ) : (
                <Copy className="h-3.5 w-3.5 text-black" />
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
        >
          <LogOut className="h-4 w-4" />
          {isMobile && <span>Disconnect</span>}
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => {
        login()
        onClose()
      }}
      className={`flex items-center justify-center gap-2 rounded-lg border-3 border-black bg-[#CCFF00] px-4 py-2 text-xs sm:text-sm font-black text-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] active:translate-x-[0px] active:translate-y-[0px] active:shadow-none transition-all uppercase tracking-wide ${isMobile ? 'w-full py-3 text-sm' : 'sm:px-5'}`}
    >
      <LogIn className="h-4 w-4" />
      <span>Login Wallet</span>
      <Sparkles className="h-4 w-4 text-black animate-spin" style={{ animationDuration: '3s' }} />
    </button>
  )
}

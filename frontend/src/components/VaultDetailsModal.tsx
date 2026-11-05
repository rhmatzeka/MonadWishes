import React, { useState, useEffect } from 'react'
import { X, Gift, Sparkles, Clock, Send, Trophy, CheckCircle2, PlayCircle, Heart } from 'lucide-react'
import { usePythPrice } from '../hooks/usePythPrice'
import { fetchBookletImage } from '../services/indexer'
import { MAX_MESSAGE_LENGTH, accruedYieldMon, formatCountdown, formatUsd, progressPercent } from '../lib/vault'

export interface GreetingItem {
  id: string
  sender: string
  amountMon: number
  message: string
  timestamp: number
}

export interface VaultData {
  id: string
  numericId: number
  recipientName: string
  recipientAddress: string
  creatorAddress: string
  targetAmountMon: number
  totalCollectedMon: number
  birthdayTimestamp: number
  createdAt: number
  isClaimed: boolean
  nftTokenId: number
  greetings: GreetingItem[]
}

interface VaultDetailsModalProps {
  vault: VaultData
  demoModeEnabled: boolean
  walletAddress?: string
  onClose: () => void
  onContribute: (vault: VaultData, amountMon: string, message: string) => Promise<boolean>
  onReleaseGift: (vault: VaultData, isDemoMode: boolean) => Promise<boolean>
}

export default function VaultDetailsModal({
  vault,
  demoModeEnabled,
  walletAddress,
  onClose,
  onContribute,
  onReleaseGift,
}: VaultDetailsModalProps) {
  const { price: monPrice } = usePythPrice()

  const [contributeAmount, setContributeAmount] = useState('1.0')
  const [greetingMsg, setGreetingMsg] = useState('')
  const [showNftModal, setShowNftModal] = useState(false)
  const [bookletImage, setBookletImage] = useState<string | null>(null)
  const [bookletFailed, setBookletFailed] = useState(false)
  const [isBusy, setIsBusy] = useState(false)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (vault.isClaimed) return
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [vault.isClaimed])

  useEffect(() => {
    if (!showNftModal || !vault.nftTokenId) return
    let isCurrent = true
    setBookletFailed(false)
    fetchBookletImage(vault.nftTokenId)
      .then((image) => {
        if (!isCurrent) return
        setBookletImage(image)
        setBookletFailed(!image)
      })
      .catch(() => {
        if (isCurrent) setBookletFailed(true)
      })
    return () => {
      isCurrent = false
    }
  }, [showNftModal, vault.nftTokenId])

  const isUnlocked = now >= vault.birthdayTimestamp
  const yieldMon = accruedYieldMon(vault.totalCollectedMon, vault.createdAt, vault.birthdayTimestamp, now)
  const totalPayoutMon = vault.totalCollectedMon + yieldMon
  const percent = progressPercent(vault.totalCollectedMon, vault.targetAmountMon)

  const wallet = walletAddress?.toLowerCase()
  const canDemoRelease =
    demoModeEnabled &&
    !isUnlocked &&
    !vault.isClaimed &&
    (wallet === vault.creatorAddress.toLowerCase() || wallet === vault.recipientAddress.toLowerCase())

  const handleContributeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!greetingMsg.trim() || isBusy) return

    setIsBusy(true)
    const sent = await onContribute(vault, contributeAmount, greetingMsg.trim())
    setIsBusy(false)
    if (sent) setGreetingMsg('')
  }

  const handleClaim = async (isDemoMode: boolean) => {
    setIsBusy(true)
    const released = await onReleaseGift(vault, isDemoMode)
    setIsBusy(false)
    if (released) setShowNftModal(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border-4 border-black bg-[#FFFDF5] p-5 sm:p-8 shadow-[6px_6px_0px_0px_#000] sm:shadow-[8px_8px_0px_0px_#000] text-black rise-in my-auto max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-6 top-6 rounded-lg border-2 border-black bg-[#FF5252] p-2 text-black hover:bg-[#FF0000] hover:text-white shadow-[2px_2px_0px_0px_#000] transition-colors"
        >
          <X className="h-5 w-5 stroke-[3]" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 sm:gap-4 mb-5 pr-8">
          <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-lg bg-[#CCFF00] border-3 border-black shadow-[2px_2px_0px_0px_#000] sm:shadow-[3px_3px_0px_0px_#000] shrink-0">
            <Gift className="h-6 w-6 sm:h-7 sm:w-7 text-black" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-col gap-1.5">
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black leading-tight truncate">
                {vault.recipientName}'s Vault
              </h2>
              {vault.isClaimed && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md border-2 border-black bg-emerald-300 px-2 py-0.5 text-[9px] sm:text-xs font-black uppercase text-black shadow-[1.5px_1.5px_0px_0px_#000] flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Claimed
                  </span>
                  <button
                    onClick={() => setShowNftModal(true)}
                    className="rounded-md border-2 border-black bg-[#00E5FF] px-2 py-0.5 text-[9px] sm:text-xs font-black uppercase text-black hover:bg-[#CCFF00] shadow-[1.5px_1.5px_0px_0px_#000] transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Trophy className="h-3 w-3" /> NFT Booklet
                  </button>
                </div>
              )}
            </div>
            <p className="text-[10px] sm:text-xs text-black font-mono font-bold mt-1 truncate">
              Recipient: {vault.recipientAddress}
            </p>
          </div>
        </div>

        {/* Progress & Staking Yield Card */}
        <div className="mb-6 rounded-xl border-3 border-black bg-white p-5 shadow-[4px_4px_0px_0px_#000]">
          <div className="flex items-center justify-between text-sm font-black uppercase mb-2">
            <span>Target Gift Pool Progress</span>
            <span className="bg-[#CCFF00] px-2 border border-black shadow-[1px_1px_0px_0px_#000]">{percent}%</span>
          </div>
          
          {/* Progress Bar */}
          <div className="h-4 w-full rounded-md border-3 border-black bg-slate-100 p-0.5 shadow-[2px_2px_0px_0px_#000]">
            <div
              className="h-full rounded bg-[#CCFF00] border-r-2 border-black transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>

        {/* Amount Breakdown Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-4 pt-4 border-t-3 border-black text-center">
          <div className="bg-[#FFFDF5] p-2.5 border-2 border-black shadow-[2px_2px_0px_0px_#000] rounded-lg">
            <span className="block text-[10px] font-black uppercase text-slate-700">Collected Principal</span>
            <span className="text-base font-black text-black">{vault.totalCollectedMon.toFixed(2)} MON</span>
            <span className="block text-[10px] font-bold text-slate-600 mt-0.5">≈ {formatUsd(vault.totalCollectedMon, monPrice)}</span>
          </div>
          <div className="bg-[#FFD600] p-2.5 border-2 border-black shadow-[2px_2px_0px_0px_#000] rounded-lg">
            <span className="block text-[10px] font-black uppercase text-black flex items-center justify-center gap-1">
              <Sparkles className="h-3 w-3" /> Est. Yield Bonus
            </span>
            <span className="text-base font-black text-black">+{yieldMon.toFixed(8)} MON</span>
            <span className="block text-[10px] font-black text-black mt-0.5">0.5% / 30 days</span>
          </div>
          <div className="bg-[#00E5FF] p-2.5 border-2 border-black shadow-[2px_2px_0px_0px_#000] rounded-lg">
            <span className="block text-[10px] font-black uppercase text-black">Est. Total Payout</span>
            <span className="text-base font-black text-black">{totalPayoutMon.toFixed(4)} MON</span>
            <span className="block text-[10px] font-black text-black mt-0.5">≈ {formatUsd(totalPayoutMon, monPrice)}</span>
          </div>
        </div>
        </div>

        {/* Time-lock status and normal release */}
        {!vault.isClaimed && (
          <div className="mb-6 rounded-xl border-3 border-black bg-white p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-[4px_4px_0px_0px_#000]">
            <div className="text-left w-full md:w-auto">
              <span className="text-xs font-black uppercase text-black flex items-center gap-1.5">
                <Clock className="h-4 w-4 shrink-0" />
                {isUnlocked ? 'Birthday Reached' : `Unlocks in ${formatCountdown(vault.birthdayTimestamp - now)}`}
              </span>
              <p className="text-[11px] font-bold text-black mt-0.5 leading-snug">
                {isUnlocked
                  ? vault.totalCollectedMon > 0
                    ? 'Anyone can release the pool. The MON always goes to the recipient.'
                    : 'This vault closed without any contributions.'
                  : `Unlock date: ${new Date(vault.birthdayTimestamp).toLocaleDateString()}`}
              </p>
            </div>
            {isUnlocked && vault.totalCollectedMon > 0 && (
              <button
                onClick={() => handleClaim(false)}
                disabled={isBusy}
                className="shrink-0 flex items-center justify-center gap-1.5 rounded-lg border-3 border-black bg-[#CCFF00] px-4 py-2 text-xs font-black uppercase text-black shadow-[3px_3px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] active:translate-x-[0px] active:translate-y-[0px] active:shadow-none transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer w-full md:w-auto"
              >
                <Gift className="h-4 w-4" />
                <span>Release Gift</span>
              </button>
            )}
          </div>
        )}

        {/* Hackathon Demo Release: only the creator or recipient passes the contract check */}
        {canDemoRelease && (
          <div className="mb-6 rounded-xl border-3 border-black bg-[#FFD600] p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-[4px_4px_0px_0px_#000]">
            <div className="text-left w-full md:w-auto">
              <span className="text-xs font-black uppercase text-black flex items-center gap-1.5">
                <PlayCircle className="h-4 w-4 shrink-0" /> Hackathon Demo Mode
              </span>
              <p className="text-[11px] font-bold text-black mt-0.5 leading-snug">
                Skip the time-lock and pay out now, with the on-chain SVG NFT.
              </p>
            </div>
            <button
              onClick={() => handleClaim(true)}
              disabled={isBusy || vault.totalCollectedMon === 0}
              className="shrink-0 flex items-center justify-center gap-1.5 rounded-lg border-3 border-black bg-[#CCFF00] px-4 py-2 text-xs font-black uppercase text-black shadow-[3px_3px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] active:translate-x-[0px] active:translate-y-[0px] active:shadow-none transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer w-full md:w-auto"
            >
              <Sparkles className="h-4 w-4 fill-black" />
              <span>Time Travel Release</span>
            </button>
          </div>
        )}

        {/* Contribution Form */}
        {!vault.isClaimed && !isUnlocked && (
          <form onSubmit={handleContributeSubmit} className="mb-6 rounded-xl border-3 border-black bg-white p-4 shadow-[4px_4px_0px_0px_#000]">
            <h3 className="text-sm font-black uppercase text-black mb-3 flex items-center gap-2">
              <Heart className="h-4 w-4 text-pink-500 fill-pink-500" />
              Send Micro-Contribution & Birthday Wish
            </h3>
            
            <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 mb-3">
              <div className="flex items-center gap-2 overflow-x-auto py-1">
                {['0.5', '1.0', '2.5', '5.0'].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setContributeAmount(val)}
                    className={`rounded-md border-2 border-black px-2.5 py-1 text-xs font-black shrink-0 transition-all ${
                      contributeAmount === val
                        ? 'bg-[#CCFF00] text-black shadow-[2px_2px_0px_0px_#000]'
                        : 'bg-white text-black hover:bg-[#FFD600]'
                    }`}
                  >
                    {val} MON
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2">
              <input
                type="text"
                required
                maxLength={MAX_MESSAGE_LENGTH}
                placeholder="Write a sweet birthday greeting message..."
                value={greetingMsg}
                onChange={(e) => setGreetingMsg(e.target.value)}
                className="flex-1 rounded-lg border-3 border-black bg-white px-4 py-2.5 text-xs text-black font-bold placeholder-slate-400 focus:bg-[#FFFDF5] focus:outline-none shadow-[2px_2px_0px_0px_#000] w-full"
              />
              <button
                type="submit"
                disabled={isBusy}
                className="flex items-center justify-center gap-1.5 rounded-lg border-3 border-black bg-[#CCFF00] px-4 py-2.5 text-xs font-black uppercase text-black shadow-[3px_3px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer w-full xs:w-auto"
              >
                <Send className="h-4 w-4 stroke-[3]" />
                <span>Send Wish</span>
              </button>
            </div>
          </form>
        )}

        {/* Live On-Chain Greetings Feed */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-black mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4 text-black" />
            On-Chain Greetings Feed ({vault.greetings.length})
          </h3>
          <div className="max-h-44 space-y-2 overflow-y-auto pr-1">
            {vault.greetings.length === 0 ? (
              <p className="text-xs font-bold text-slate-500 italic text-center py-4 bg-white border-2 border-black rounded-lg">
                No greetings yet. Be the first friend to contribute!
              </p>
            ) : (
              vault.greetings.map((g) => (
                <div
                  key={g.id}
                  className="flex items-start justify-between rounded-lg border-2 border-black bg-white p-3 text-xs shadow-[2px_2px_0px_0px_#000]"
                >
                  <div>
                    <div className="flex items-center gap-2 font-black uppercase text-black">
                      <span>{g.sender}</span>
                      <span className="rounded border border-black bg-[#CCFF00] px-2 py-0.5 text-[10px] font-black text-black">
                        +{g.amountMon} MON
                      </span>
                    </div>
                    <p className="text-black font-bold mt-1">{g.message}</p>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-1.5 border border-black">
                    {new Date(g.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Dynamic SVG NFT Modal Overlay */}
      {showNftModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/90 p-4">
          <div className="relative max-w-sm max-h-[90vh] overflow-y-auto rounded-2xl border-4 border-black bg-[#FFFDF5] p-6 text-center shadow-[10px_10px_0px_0px_#000] text-black">
            <button
              onClick={() => setShowNftModal(false)}
              aria-label="Close"
              className="absolute right-4 top-4 rounded-lg border-2 border-black bg-[#FF5252] p-1.5 text-black hover:bg-[#FF0000] hover:text-white transition-colors"
            >
              <X className="h-5 w-5 stroke-[3]" />
            </button>

            <Trophy className="h-10 w-10 text-black mx-auto mb-2" />
            <h3 className="text-2xl font-black uppercase text-black mb-1">Gift Vault Unlocked!</h3>
            <p className="text-xs font-bold text-black mb-4">
              On-chain SVG NFT Booklet #{vault.nftTokenId} minted to {vault.recipientName}
            </p>

            {/* The image comes from tokenURI, so this is exactly what is stored on-chain */}
            <div className="mx-auto my-3 flex min-h-[260px] items-center justify-center overflow-hidden rounded-xl border-3 border-black bg-white shadow-[4px_4px_0px_0px_#000]">
              {bookletImage ? (
                <img src={bookletImage} alt={`NFT booklet for ${vault.recipientName}`} className="h-[260px] w-full object-contain" />
              ) : (
                <span className="p-4 text-xs font-black uppercase text-black">
                  {bookletFailed ? 'Could not load the booklet from the chain.' : 'Loading booklet from the chain...'}
                </span>
              )}
            </div>

            <button
              onClick={() => setShowNftModal(false)}
              className="w-full rounded-lg border-3 border-black bg-[#00E5FF] py-2.5 text-xs font-black uppercase text-black shadow-[3px_3px_0px_0px_#000] hover:bg-[#CCFF00] transition-colors"
            >
              Close & Return
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

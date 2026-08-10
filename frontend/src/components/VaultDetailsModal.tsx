import React, { useState, useEffect } from 'react'
import { X, Gift, Sparkles, Clock, Send, Trophy, CheckCircle2, PlayCircle, Heart } from 'lucide-react'
import { usePythPrice } from '../hooks/usePythPrice'

export interface GreetingItem {
  id: string
  sender: string
  amountMon: number
  message: string
  timestamp: Date
}

export interface VaultData {
  id: string
  numericId?: number
  recipientName: string
  recipientAddress: string
  creatorAddress: string
  targetAmountMon: number
  totalCollectedMon: number
  birthdayTimestamp: number
  isClaimed: boolean
  greetings: GreetingItem[]
}

interface VaultDetailsModalProps {
  isOpen: boolean
  vault: VaultData | null
  onClose: () => void
  onContribute: (vaultId: string, amountMon: number, message: string) => void
  onReleaseGift: (vaultId: string, isDemoMode: boolean) => void
}

export default function VaultDetailsModal({
  isOpen,
  vault,
  onClose,
  onContribute,
  onReleaseGift,
}: VaultDetailsModalProps) {
  const { price: monPrice } = usePythPrice()

  const [contributeAmount, setContributeAmount] = useState('1.0')
  const [greetingMsg, setGreetingMsg] = useState('')
  const [showNftModal, setShowNftModal] = useState(false)
  const [simulatedYieldMon, setSimulatedYieldMon] = useState(0)

  useEffect(() => {
    if (!vault) return
    // Base yield calculation (0.5% monthly prorated) + greetings bonus
    const baseYield = (vault.totalCollectedMon * 0.005) + (vault.greetings.length * 0.02)
    setSimulatedYieldMon(baseYield)

    // Sub-second live yield ticker animation (increments slightly every second)
    const interval = setInterval(() => {
      setSimulatedYieldMon((prev) => prev + 0.0000012)
    }, 1000)

    return () => clearInterval(interval)
  }, [vault])

  if (!isOpen || !vault) return null

  const collectedUsd = (vault.totalCollectedMon * monPrice).toFixed(2)
  const totalPayoutMon = vault.totalCollectedMon + simulatedYieldMon
  const totalPayoutUsd = (totalPayoutMon * monPrice).toFixed(2)
  const progressPercent = Math.min(100, Math.round((vault.totalCollectedMon / vault.targetAmountMon) * 100))

  const handleContributeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const amt = parseFloat(contributeAmount) || 0
    if (amt <= 0 || !greetingMsg) return

    onContribute(vault.id, amt, greetingMsg)
    setGreetingMsg('')
  }

  const handleClaim = (isDemoMode: boolean) => {
    onReleaseGift(vault.id, isDemoMode)
    setShowNftModal(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border-4 border-black bg-[#FFFDF5] p-5 sm:p-8 shadow-[6px_6px_0px_0px_#000] sm:shadow-[8px_8px_0px_0px_#000] text-black rise-in my-auto max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
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
            <span className="bg-[#CCFF00] px-2 border border-black shadow-[1px_1px_0px_0px_#000]">{progressPercent}%</span>
          </div>
          
          {/* Progress Bar */}
          <div className="h-4 w-full rounded-md border-3 border-black bg-slate-100 p-0.5 shadow-[2px_2px_0px_0px_#000]">
            <div
              className="h-full rounded bg-[#CCFF00] border-r-2 border-black transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

        {/* Amount Breakdown Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-4 pt-4 border-t-3 border-black text-center">
          <div className="bg-[#FFFDF5] p-2.5 border-2 border-black shadow-[2px_2px_0px_0px_#000] rounded-lg">
            <span className="block text-[10px] font-black uppercase text-slate-700">Collected Principal</span>
            <span className="text-base font-black text-black">{vault.totalCollectedMon.toFixed(2)} MON</span>
            <span className="block text-[10px] font-bold text-slate-600 mt-0.5">≈ ${collectedUsd}</span>
          </div>
          <div className="bg-[#FFD600] p-2.5 border-2 border-black shadow-[2px_2px_0px_0px_#000] rounded-lg">
            <span className="block text-[10px] font-black uppercase text-black flex items-center justify-center gap-1">
              <Sparkles className="h-3 w-3" /> Monad Yield
            </span>
            <span className="text-base font-black text-black">+{simulatedYieldMon.toFixed(4)} MON</span>
            <span className="block text-[10px] font-black text-black mt-0.5">0.5% APY Staked</span>
          </div>
          <div className="bg-[#00E5FF] p-2.5 border-2 border-black shadow-[2px_2px_0px_0px_#000] rounded-lg">
            <span className="block text-[10px] font-black uppercase text-black">Total Payout</span>
            <span className="text-base font-black text-black">{totalPayoutMon.toFixed(2)} MON</span>
            <span className="block text-[10px] font-black text-black mt-0.5">≈ ${totalPayoutUsd}</span>
          </div>
        </div>
        </div>

        {/* Hackathon Demo Time-Travel Banner */}
        <div className="mb-6 rounded-xl border-3 border-black bg-[#FFD600] p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-[4px_4px_0px_0px_#000]">
          <div className="text-left w-full md:w-auto">
            <span className="text-xs font-black uppercase text-black flex items-center gap-1.5">
              <PlayCircle className="h-4 w-4 shrink-0" /> Hackathon Demo Mode
            </span>
            <p className="text-[11px] font-bold text-black mt-0.5 leading-snug">
              Bypass 30-day time-lock to simulate 00:00 instant payout & on-chain SVG NFT.
            </p>
          </div>
          <button
            onClick={() => handleClaim(true)}
            disabled={vault.isClaimed || vault.totalCollectedMon === 0}
            className="shrink-0 flex items-center justify-center gap-1.5 rounded-lg border-3 border-black bg-[#CCFF00] px-4 py-2 text-xs font-black uppercase text-black shadow-[3px_3px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] active:translate-x-[0px] active:translate-y-[0px] active:shadow-none transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer w-full md:w-auto"
          >
            <Sparkles className="h-4 w-4 fill-black" />
            <span>Time Travel Release</span>
          </button>
        </div>

        {/* Contribution Form */}
        {!vault.isClaimed && (
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
              <span className="text-[10px] font-black uppercase text-black ml-0 xs:ml-auto bg-[#00E5FF] px-2 py-0.5 border border-black self-start xs:self-auto shrink-0">
                Gasless EIP-7702
              </span>
            </div>

            <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2">
              <input
                type="text"
                required
                placeholder="Write a sweet birthday greeting message..."
                value={greetingMsg}
                onChange={(e) => setGreetingMsg(e.target.value)}
                className="flex-1 rounded-lg border-3 border-black bg-white px-4 py-2.5 text-xs text-black font-bold placeholder-slate-400 focus:bg-[#FFFDF5] focus:outline-none shadow-[2px_2px_0px_0px_#000] w-full"
              />
              <button
                type="submit"
                className="flex items-center justify-center gap-1.5 rounded-lg border-3 border-black bg-[#CCFF00] px-4 py-2.5 text-xs font-black uppercase text-black shadow-[3px_3px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all cursor-pointer w-full xs:w-auto"
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

        {/* Dynamic SVG NFT Modal Overlay */}
        {showNftModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/90 p-4">
            <div className="relative max-w-sm rounded-2xl border-4 border-black bg-[#FFFDF5] p-6 text-center shadow-[10px_10px_0px_0px_#000] text-black">
              <button
                onClick={() => setShowNftModal(false)}
                className="absolute right-4 top-4 rounded-lg border-2 border-black bg-[#FF5252] p-1.5 text-black hover:bg-[#FF0000] hover:text-white transition-colors"
              >
                <X className="h-5 w-5 stroke-[3]" />
              </button>

              <Trophy className="h-10 w-10 text-black mx-auto mb-2 animate-bounce" />
              <h3 className="text-2xl font-black uppercase text-black mb-1">Gift Vault Unlocked!</h3>
              <p className="text-xs font-bold text-black mb-4">
                Dynamic On-Chain SVG NFT Booklet Minted to {vault.recipientName}
              </p>

              {/* Render 100% On-Chain SVG Booklet */}
              <div className="mx-auto my-3 overflow-hidden rounded-xl border-3 border-black shadow-[4px_4px_0px_0px_#000]">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="100%" height="260">
                  <defs>
                    <linearGradient id="monadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#200052"/>
                      <stop offset="50%" stopColor="#836EF9"/>
                      <stop offset="100%" stopColor="#00E5FF"/>
                    </linearGradient>
                  </defs>
                  <rect width="400" height="500" rx="24" fill="url(#monadGrad)"/>
                  <rect x="15" y="15" width="370" height="470" rx="18" fill="none" stroke="#FFFFFF" strokeOpacity="0.2" strokeWidth="2"/>
                  <text x="200" y="70" fontFamily="sans-serif" fontSize="14" fontWeight="bold" fill="#00E5FF" letterSpacing="3" textAnchor="middle">MONAD WISHES</text>
                  <text x="200" y="100" fontFamily="sans-serif" fontSize="22" fontWeight="bold" fill="#FFFFFF" textAnchor="middle">🎂 Happy Birthday!</text>
                  <circle cx="200" cy="180" r="45" fill="#FFFFFF" fillOpacity="0.1" stroke="#00E5FF" strokeWidth="2"/>
                  <text x="200" y="195" fontFamily="sans-serif" fontSize="40" textAnchor="middle">🎁</text>
                  <text x="200" y="260" fontFamily="sans-serif" fontSize="20" fontWeight="bold" fill="#FFFFFF" textAnchor="middle">{vault.recipientName}</text>
                  <rect x="40" y="290" width="320" height="80" rx="12" fill="#000000" fillOpacity="0.3" stroke="#836EF9" strokeWidth="1.5"/>
                  <text x="200" y="320" fontFamily="sans-serif" fontSize="12" fill="#A0A0B0" textAnchor="middle">TOTAL GIFT POOL + YIELD</text>
                  <text x="200" y="352" fontFamily="sans-serif" fontSize="24" fontWeight="bold" fill="#00E5FF" textAnchor="middle">{totalPayoutMon.toFixed(2)} MON</text>
                  <text x="200" y="420" fontFamily="sans-serif" fontSize="13" fill="#FFFFFF" fillOpacity="0.8" textAnchor="middle">👥 Contributed by {vault.greetings.length} Friends</text>
                  <text x="200" y="455" fontFamily="sans-serif" fontSize="10" fill="#A0A0B0" textAnchor="middle">Verified on Monad Blockchain • 0.3s Block Time</text>
                </svg>
              </div>

              <p className="text-xs font-black text-black bg-[#CCFF00] p-2 border-2 border-black mb-4">
                ✓ Transferred {totalPayoutMon.toFixed(2)} MON (${totalPayoutUsd}) to Recipient Wallet
              </p>

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
    </div>
  )
}

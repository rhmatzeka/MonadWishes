import React, { useState } from 'react'
import { X, Gift, Sparkles, Calendar, DollarSign, User, ShieldCheck } from 'lucide-react'
import { usePythPrice } from '../hooks/usePythPrice'

interface CreateVaultModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (vault: {
    recipientName: string
    recipientAddress: string
    targetAmountMon: number
    durationDays: number
  }) => void
}

export default function CreateVaultModal({ isOpen, onClose, onCreate }: CreateVaultModalProps) {
  const { price: monPrice, formatted: monPriceFormatted } = usePythPrice()

  const [recipientName, setRecipientName] = useState('')
  const [recipientAddress, setRecipientAddress] = useState('')
  const [targetAmountMon, setTargetAmountMon] = useState('10')
  const [durationDays, setDurationDays] = useState('30')

  if (!isOpen) return null

  const monNum = parseFloat(targetAmountMon) || 0
  const usdValue = (monNum * monPrice).toFixed(2)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!recipientName || !recipientAddress || monNum <= 0) return

    onCreate({
      recipientName,
      recipientAddress,
      targetAmountMon: monNum,
      durationDays: parseInt(durationDays) || 30,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl border-4 border-black bg-[#FFFDF5] p-5 sm:p-8 shadow-[6px_6px_0px_0px_#000] sm:shadow-[8px_8px_0px_0px_#000] text-black rise-in my-auto max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b-4 border-black pb-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-lg bg-[#CCFF00] border-3 border-black shadow-[2px_2px_0px_0px_#000] sm:shadow-[3px_3px_0px_0px_#000]">
              <Gift className="h-5 w-5 sm:h-6 sm:w-6 text-black" />
            </div>
            <div>
              <span className="bg-[#FFD600] px-1.5 py-0.5 border border-black font-black uppercase text-[9px] sm:text-[10px] shadow-[1px_1px_0px_0px_#000]">
                New Pool
              </span>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black leading-tight">
                Create Birthday Vault
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border-2 border-black bg-[#FF5252] p-1.5 sm:p-2 text-black hover:bg-[#FF0000] hover:text-white shadow-[2px_2px_0px_0px_#000] transition-colors"
          >
            <X className="h-4.5 w-4.5 sm:h-5 sm:w-5 stroke-[3]" />
          </button>
        </div>

        {/* Live Pyth Ticker Badge */}
        <div className="mb-4 flex items-center justify-between rounded-lg border-3 border-black bg-[#00E5FF] px-3 py-2 text-[10px] sm:text-xs text-black font-black uppercase shadow-[2px_2px_0px_0px_#000] sm:shadow-[3px_3px_0px_0px_#000]">
          <div className="flex items-center gap-1.5 min-w-0">
            <Sparkles className="h-3.5 w-3.5 shrink-0 animate-spin text-black" style={{ animationDuration: '4s' }} />
            <span className="truncate">Pyth Oracle Live Pricing</span>
          </div>
          <span className="bg-white px-1.5 py-0.5 border border-black shrink-0">1 MON = {monPriceFormatted}</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Recipient Name */}
          <div>
            <label className="block text-[10px] sm:text-xs font-black uppercase text-black mb-1 flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-black" />
              Recipient Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Alice Smith"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              className="w-full rounded-lg border-3 border-black bg-white px-3.5 py-2.5 text-xs sm:text-sm text-black font-bold placeholder-slate-400 focus:bg-[#FFFDF5] focus:outline-none shadow-[2px_2px_0px_0px_#000]"
            />
          </div>

          {/* Recipient Wallet Address */}
          <div>
            <label className="block text-[10px] sm:text-xs font-black uppercase text-black mb-1 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-black" />
              Recipient Wallet or Monad Address
            </label>
            <input
              type="text"
              required
              placeholder="0x..."
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              className="w-full rounded-lg border-3 border-black bg-white px-3.5 py-2.5 text-xs sm:text-sm text-black font-mono font-bold placeholder-slate-400 focus:bg-[#FFFDF5] focus:outline-none shadow-[2px_2px_0px_0px_#000]"
            />
          </div>

          {/* Goal Amount MON */}
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[10px] sm:text-xs font-black uppercase text-black mb-1 flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5 text-black" />
                Target Pool (MON)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                required
                value={targetAmountMon}
                onChange={(e) => setTargetAmountMon(e.target.value)}
                className="w-full rounded-lg border-3 border-black bg-white px-3.5 py-2.5 text-xs sm:text-sm text-black font-bold focus:bg-[#FFFDF5] focus:outline-none shadow-[2px_2px_0px_0px_#000]"
              />
              <span className="mt-1 block text-[10px] font-black uppercase text-slate-700">
                ≈ ${usdValue} USD
              </span>
            </div>

            {/* Duration Days */}
            <div>
              <label className="block text-[10px] sm:text-xs font-black uppercase text-black mb-1 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-black" />
                Lock Duration
              </label>
              <select
                value={durationDays}
                onChange={(e) => setTargetAmountMon && setDurationDays(e.target.value)}
                className="w-full rounded-lg border-3 border-black bg-white px-3.5 py-2.5 text-xs sm:text-sm text-black font-bold focus:bg-[#FFFDF5] focus:outline-none shadow-[2px_2px_0px_0px_#000]"
              >
                <option value="7">7 Days</option>
                <option value="14">14 Days</option>
                <option value="30">30 Days</option>
                <option value="60">60 Days</option>
              </select>
              <span className="mt-1 block text-[10px] font-black uppercase text-slate-700">
                Auto-unlock 00:00
              </span>
            </div>
          </div>

          {/* Staking Yield Info Banner */}
          <div className="rounded-lg bg-[#CCFF00] p-2.5 text-[10px] sm:text-xs text-black border-3 border-black shadow-[2px_2px_0px_0px_#000] sm:shadow-[3px_3px_0px_0px_#000]">
            <p className="font-black uppercase">✨ Monad Social Yield Active</p>
            <p className="text-[10px] sm:text-[11px] font-bold text-black mt-0.5 leading-snug">
              Contributions are delegated to Monad Native Staking precompile (<code>0x1000</code>) earning yield.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="mt-5 flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border-2 border-black bg-white px-4 py-2 text-xs sm:text-sm font-black uppercase text-black hover:bg-slate-200 transition-colors shadow-[2px_2px_0px_0px_#000]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-lg border-3 border-black bg-[#CCFF00] px-5 py-2 text-xs sm:text-sm font-black uppercase text-black shadow-[3px_3px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] active:translate-x-[0px] active:translate-y-[0px] active:shadow-none transition-all"
            >
              <Gift className="h-4 w-4 stroke-[3]" />
              <span>Create Vault</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

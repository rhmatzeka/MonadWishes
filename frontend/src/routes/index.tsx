import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Gift, Plus, Sparkles, Shield, Clock, Users, Flame, ChevronRight, Zap, RefreshCw, Database, ArrowRight } from 'lucide-react'
import CreateVaultModal from '../components/CreateVaultModal'
import VaultDetailsModal, { type VaultData } from '../components/VaultDetailsModal'
import TransactionToast from '../components/TransactionToast'
import NetworkSwitchBanner from '../components/NetworkSwitchBanner'
import { usePythPrice } from '../hooks/usePythPrice'
import { useVaultClient } from '../hooks/useVaultClient'

export const Route = createFileRoute('/')({ component: App })

function App() {
  const { formatted: monPriceFormatted } = usePythPrice()
  const {
    vaults,
    isLoading,
    dataSource,
    toast,
    closeToast,
    createVault,
    contribute,
    releaseGift,
    refetch,
  } = useVaultClient()

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedVault, setSelectedVault] = useState<VaultData | null>(null)
  
  // Local state to hide specific vaults deleted/removed by user
  const [hiddenVaultIds, setHiddenVaultIds] = useState<string[]>([])

  const handleCreateVault = async (newVaultData: {
    recipientName: string
    recipientAddress: string
    targetAmountMon: number
    durationDays: number
  }) => {
    try {
      await createVault(newVaultData)
    } catch {
      // Handled via toast inside useVaultClient
    }
  }

  const handleContribute = async (vaultId: string, amountMon: number, message: string) => {
    try {
      await contribute(vaultId, amountMon, message)
    } catch {
      // Handled via toast inside useVaultClient
    }
  }

  const handleReleaseGift = async (vaultId: string, isDemoMode: boolean) => {
    try {
      await releaseGift(vaultId, isDemoMode)
    } catch {
      // Handled via toast inside useVaultClient
    }
  }

  return (
    <div className="min-h-screen bg-[#FFFDF5] text-black font-sans selection:bg-[#CCFF00] selection:text-black">
      {/* Neo-Brutalist Hero Header Section with Video Background */}
      <section className="relative overflow-hidden border-b-4 border-black bg-black px-6 py-12 sm:px-12 sm:py-16 shadow-[0_6px_0px_0px_#000] min-h-[50vh] sm:min-h-[70vh] lg:min-h-[80vh] flex items-center justify-start text-left">
        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0 opacity-50 filter saturate-150 contrast-125"
          src="/video/hero-bg.mp4"
        />
        {/* Dark Vignette Overlay for High Legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/40 z-0" />

        <div className="relative z-10 max-w-7xl mx-auto flex flex-col items-start gap-6 w-full text-left">

          {/* Main Neo-Brutalist Heading */}
          <div className="space-y-4 max-w-4xl">
            <h1 className="text-4xl font-black uppercase leading-tight tracking-tight sm:text-7xl text-white">
              MONEY & WISHES,{' '}
              <span className="bg-[#CCFF00] text-black px-3 py-1 border-4 border-black inline-block shadow-[6px_6px_0px_0px_#000] -rotate-1">
                DECODED.
              </span>
            </h1>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-4 w-full">
            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center justify-center gap-2 rounded-lg border-4 border-black bg-[#CCFF00] px-6 py-3.5 text-base font-black uppercase text-black shadow-[5px_5px_0px_0px_#000] hover:bg-[#FFD600] hover:translate-x-[-2px] hover:translate-y-[-2px] active:translate-x-[0px] active:translate-y-[0px] active:shadow-none transition-all cursor-pointer w-full sm:w-auto"
            >
              <Plus className="h-5 w-5 stroke-[3]" />
              <span>Create Birthday Vault</span>
            </button>
            <a
              href="#vaults-section"
              className="flex items-center justify-center gap-2 rounded-lg border-4 border-black bg-white px-6 py-3.5 text-base font-black uppercase text-black shadow-[5px_5px_0px_0px_#000] hover:bg-[#00E5FF] hover:translate-x-[-2px] hover:translate-y-[-2px] active:translate-x-[0px] active:translate-y-[0px] active:shadow-none transition-all w-full sm:w-auto text-center"
            >
              <span>Explore All Vaults</span>
              <ArrowRight className="h-5 w-5 stroke-[3]" />
            </a>
          </div>

        </div>
      </section>

      {/* Neo-Brutalist Infinite Scrolling Marquee Banner (Right below the Hero header section, visible above the fold on desktop/standard screens) */}
      <div className="overflow-hidden border-b-4 border-black bg-[#111111] py-3 text-white shadow-[0_4px_0px_0px_#000]">
        <div className="flex items-center">
          {/* Static Tag Label */}
          <div className="shrink-0 bg-[#CCFF00] text-black font-black uppercase px-4 py-1.5 border-r-4 border-black text-xs sm:text-sm tracking-wider z-10 shadow-[4px_0px_0px_0px_#000]">
            FEATURED ON MONAD
          </div>

          {/* Scrolling Content Track (Duplicated for Seamless Loop) */}
          <div className="animate-marquee whitespace-nowrap flex items-center gap-8 font-black uppercase text-xs sm:text-sm tracking-wider text-slate-200 pl-6">
            <span className="flex items-center gap-2 text-[#CCFF00]">✦ MONAD TESTNET 0.3s BLOCK TIME</span>
            <span className="text-slate-500">•</span>
            <span>PRIVY SOCIAL LOGIN</span>
            <span className="text-slate-500">•</span>
            <span className="text-[#00E5FF]">✦ NATIVE STAKING PRECOMPILE (0x1000)</span>
            <span className="text-slate-500">•</span>
            <span>PYTH LIVE MON/USD PRICING</span>
            <span className="text-slate-500">•</span>
            <span className="text-amber-300">✦ 100% ON-CHAIN SVG NFT BOOKLET</span>
            <span className="text-slate-500">•</span>
            <span>ENVIO GRAPHQL EVENT INDEXER</span>
            <span className="text-slate-500">•</span>

            {/* Duplicate for seamless infinite loop */}
            <span className="flex items-center gap-2 text-[#CCFF00]">✦ MONAD TESTNET 0.3s BLOCK TIME</span>
            <span className="text-slate-500">•</span>
            <span>PRIVY SOCIAL LOGIN</span>
            <span className="text-slate-500">•</span>
            <span className="text-[#00E5FF]">✦ NATIVE STAKING PRECOMPILE (0x1000)</span>
            <span className="text-slate-500">•</span>
            <span>PYTH LIVE MON/USD PRICING</span>
            <span className="text-slate-500">•</span>
            <span className="text-amber-300">✦ 100% ON-CHAIN SVG NFT BOOKLET</span>
            <span className="text-slate-500">•</span>
            <span>ENVIO GRAPHQL EVENT INDEXER</span>
            <span className="text-slate-500">•</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-16 space-y-16" id="vaults-section">
        
        {/* Section Title */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b-4 border-black pb-6">
          <div>
            <span className="bg-[#FFD600] text-black font-black px-2 py-0.5 border-2 border-black uppercase text-xs shadow-[2px_2px_0px_0px_#000]">
              Active Pools
            </span>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-black mt-2">
              ACTIVE BIRTHDAY <span className="bg-[#CCFF00] px-2 border-3 border-black shadow-[3px_3px_0px_0px_#000]">VAULTS.</span>
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {hiddenVaultIds.length > 0 && (
              <button
                onClick={() => setHiddenVaultIds([])}
                className="flex items-center gap-1.5 rounded-md border-3 border-black bg-[#FF5252] px-3.5 py-2 text-xs font-black uppercase text-white shadow-[3px_3px_0px_0px_#000] hover:bg-[#FF0000] transition-all cursor-pointer"
                title="Restore all hidden vault cards"
              >
                Restore Hidden ({hiddenVaultIds.length})
              </button>
            )}
            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center gap-2 rounded-md border-3 border-black bg-[#00E5FF] px-4 py-2 text-sm font-black uppercase text-black shadow-[3px_3px_0px_0px_#000] hover:bg-[#CCFF00] transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              <span>New Pool</span>
            </button>
          </div>
        </div>

        {/* Vault Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {vaults
            .filter((v) => !hiddenVaultIds.includes(v.id))
            .map((vault, idx) => {
              const progressPercent = Math.min(
                100,
                Math.round((vault.totalCollectedMon / vault.targetAmountMon) * 100)
              )
              const isCompleted = vault.totalCollectedMon >= vault.targetAmountMon
              const rotateClass = idx % 2 === 0 ? '-rotate-1' : 'rotate-1'

              return (
                <div
                  key={vault.id}
                  onClick={() => setSelectedVault(vault)}
                  className="group relative rounded-2xl border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_#000] hover:shadow-[10px_10px_0px_0px_#000] hover:translate-x-[-3px] hover:translate-y-[-3px] transition-all cursor-pointer rotate-0 sm:rotate-1"
                >
                  {/* Hide Card Button (Top-right corner, absolutely positioned) */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setHiddenVaultIds((prev) => [...prev, vault.id])
                    }}
                    className="absolute -top-3.5 -right-3.5 h-8 w-8 rounded-full border-3 border-black bg-[#FF5252] text-white hover:bg-black hover:text-[#CCFF00] flex items-center justify-center font-black shadow-[2px_2px_0px_0px_#000] transition-all z-20 cursor-pointer"
                    title="Hide this vault card from list"
                  >
                    ×
                  </button>

                  {/* Header Tag */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="rounded-md border-2 border-black bg-[#CCFF00] px-2.5 py-1 text-xs font-black uppercase text-black shadow-[2px_2px_0px_0px_#000]">
                    Vault #{vault.numericId || vault.id}
                  </span>
                  {vault.isClaimed ? (
                    <span className="rounded-md border-2 border-black bg-emerald-300 px-2.5 py-1 text-xs font-black uppercase text-black shadow-[2px_2px_0px_0px_#000]">
                      Claimed & Minted
                    </span>
                  ) : isCompleted ? (
                    <span className="rounded-md border-2 border-black bg-[#00E5FF] px-2.5 py-1 text-xs font-black uppercase text-black shadow-[2px_2px_0px_0px_#000]">
                      Goal Reached
                    </span>
                  ) : (
                    <span className="rounded-md border-2 border-black bg-[#FFD600] px-2.5 py-1 text-xs font-black uppercase text-black shadow-[2px_2px_0px_0px_#000]">
                      Active Patungan
                    </span>
                  )}
                </div>

                {/* Recipient Title */}
                <h3 className="text-2xl font-black uppercase text-black tracking-wide border-b-3 border-black pb-2 mb-4">
                  {vault.recipientName}'s Vault
                </h3>

                {/* Progress Stats */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm font-black uppercase">
                    <span className="text-slate-700">Collected Pool</span>
                    <span className="text-black bg-[#CCFF00] px-1.5 border border-black shadow-[1px_1px_0px_0px_#000]">
                      {vault.totalCollectedMon} / {vault.targetAmountMon} MON
                    </span>
                  </div>

                  {/* Brutalist Progress Bar */}
                  <div className="h-4 w-full rounded-md border-3 border-black bg-slate-100 p-0.5 shadow-[2px_2px_0px_0px_#000]">
                    <div
                      className="h-full rounded bg-[#CCFF00] border-r-2 border-black transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs font-black uppercase text-black pt-1">
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {vault.greetings.length} Contributors
                    </span>
                    <span className="flex items-center gap-1 bg-[#00E5FF] px-1.5 border border-black">
                      <Flame className="h-3.5 w-3.5 text-black" />
                      +0.5% APY Staked
                    </span>
                  </div>
                </div>

                {/* Action Footer */}
                <div className="pt-2 border-t-3 border-black flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-black flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {vault.isClaimed ? 'Gift Unlocked' : 'Time-Locked'}
                  </span>
                  <button className="flex items-center gap-1 rounded-md border-2 border-black bg-black px-3 py-1.5 text-xs font-black uppercase text-[#CCFF00] shadow-[2px_2px_0px_0px_#000] group-hover:bg-[#CCFF00] group-hover:text-black transition-colors">
                    <span>View Vault</span>
                    <ChevronRight className="h-4 w-4 stroke-[3]" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

      </main>

      {/* Featured Royal Blue Cobalt Banner (Matching Reference Image Section) */}
      <section className="bg-[#0038FF] border-y-4 border-black px-6 py-16 text-center text-white shadow-[0_6px_0px_0px_#000]">
        <div className="max-w-4xl mx-auto space-y-6">
          <span className="bg-[#CCFF00] text-black font-black px-3 py-1 border-3 border-black uppercase text-sm shadow-[3px_3px_0px_0px_#000] inline-block -rotate-1">
            Monad Ecosystem Hackathon Project
          </span>
          <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-white leading-tight">
            READY TO SEE GIFT POOLS <span className="bg-[#CCFF00] text-black px-2 border-4 border-black shadow-[4px_4px_0px_0px_#000] inline-block">DIFFERENTLY?</span>
          </h2>
          <p className="text-lg font-bold text-slate-100 max-w-xl mx-auto">
            Zero gas friction with Privy Social Login, sub-second 0.3s Monad block time, and 100% on-chain SVG booklet NFTs.
          </p>
          <div className="pt-4">
            <button
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-3 rounded-xl border-4 border-black bg-[#CCFF00] px-8 py-4 text-xl font-black uppercase text-black shadow-[6px_6px_0px_0px_#000] hover:translate-x-[-3px] hover:translate-y-[-3px] active:translate-x-[0px] active:translate-y-[0px] active:shadow-none transition-all cursor-pointer"
            >
              <Gift className="h-6 w-6 stroke-[3]" />
              <span>Create Your Vault Now ➔</span>
            </button>
          </div>
        </div>
      </section>

      {/* Modals & Toast */}
      {isCreateOpen && (
        <CreateVaultModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onCreate={handleCreateVault}
        />
      )}

      {selectedVault && (
        <VaultDetailsModal
          vault={selectedVault}
          isOpen={!!selectedVault}
          onClose={() => setSelectedVault(null)}
          onContribute={handleContribute}
          onReleaseGift={handleReleaseGift}
        />
      )}

      <TransactionToast toast={toast} onClose={closeToast} />
    </div>
  )
}

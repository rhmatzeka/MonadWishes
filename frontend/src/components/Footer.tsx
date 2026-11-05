import { GiftIcon, GithubLogoIcon, XLogoIcon } from '@phosphor-icons/react'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-20 border-t-4 border-black bg-[#FFFDF5] px-4 py-8 text-black">
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-between gap-6 sm:flex-row text-center sm:text-left">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-[#CCFF00] border-3 border-black text-black font-black flex items-center justify-center rounded shadow-[2px_2px_0px_0px_#000]">
            <GiftIcon weight="bold" className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <span className="text-lg font-black uppercase text-black bg-[#CCFF00] px-1.5 border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000] inline-block leading-none py-0.5">
              MonadWishes
            </span>
            <p className="text-[10px] text-black font-black uppercase mt-1">
              Built for Monad Blockchain Hackathon 2026
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center sm:items-end gap-2">
          <div className="text-xs text-black font-black uppercase tracking-wider bg-[#00E5FF] px-2 py-1 border-2 border-black shadow-[2px_2px_0px_0px_#000]">
            Smart Contracts Deployed on Monad Testnet (Chain ID 10143)
          </div>
          <p className="m-0 text-xs font-black uppercase tracking-tight text-black mt-1">
            &copy; {year} MonadWishes. All rights reserved.
          </p>
        </div>

        <div className="flex gap-3">
          <a
            href="https://x.com/monad_xyz"
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border-2 border-black bg-white p-2 text-black hover:bg-[#CCFF00] hover:translate-x-[-2px] hover:translate-y-[-2px] shadow-[2px_2px_0px_0px_#000] active:translate-x-[0px] active:translate-y-[0px] active:shadow-none transition-all flex items-center justify-center"
          >
            <span className="sr-only">Follow Monad on X</span>
            <XLogoIcon weight="bold" className="h-5 w-5" aria-hidden="true" />
          </a>
          <a
            href="https://github.com/rhmatzeka/MonadWishes"
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border-2 border-black bg-white p-2 text-black hover:bg-[#00E5FF] hover:translate-x-[-2px] hover:translate-y-[-2px] shadow-[2px_2px_0px_0px_#000] active:translate-x-[0px] active:translate-y-[0px] active:shadow-none transition-all flex items-center justify-center"
          >
            <span className="sr-only">Go to MonadWishes GitHub</span>
            <GithubLogoIcon weight="bold" className="h-5 w-5" aria-hidden="true" />
          </a>
        </div>
      </div>
    </footer>
  )
}

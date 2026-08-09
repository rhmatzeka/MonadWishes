export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-20 border-t-4 border-black bg-[#FFFDF5] px-4 py-8 text-black">
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-between gap-6 sm:flex-row text-center sm:text-left">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-[#CCFF00] border-3 border-black text-black font-black flex items-center justify-center rounded shadow-[2px_2px_0px_0px_#000]">
            🎁
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
            <svg viewBox="0 0 16 16" aria-hidden="true" width="20" height="20">
              <path
                fill="currentColor"
                d="M12.6 1h2.2L10 6.48 15.64 15h-4.41L7.78 9.82 3.23 15H1l5.14-5.84L.72 1h4.52l3.12 4.73L12.6 1zm-.77 12.67h1.22L4.57 2.26H3.26l8.57 11.41z"
              />
            </svg>
          </a>
          <a
            href="https://github.com/rhmatzeka/MonadWhises"
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border-2 border-black bg-white p-2 text-black hover:bg-[#00E5FF] hover:translate-x-[-2px] hover:translate-y-[-2px] shadow-[2px_2px_0px_0px_#000] active:translate-x-[0px] active:translate-y-[0px] active:shadow-none transition-all flex items-center justify-center"
          >
            <span className="sr-only">Go to MonadWishes GitHub</span>
            <svg viewBox="0 0 16 16" aria-hidden="true" width="20" height="20">
              <path
                fill="currentColor"
                d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"
              />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  )
}

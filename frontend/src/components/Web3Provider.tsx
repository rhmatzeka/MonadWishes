import React, { useState, useEffect } from 'react'
import { PrivyProvider } from '@privy-io/react-auth'
import { createConfig, WagmiProvider } from '@privy-io/wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http } from 'wagmi'
import { monadTestnet } from '../config/monad'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: 1000,
    },
  },
})

export const wagmiConfig = createConfig({
  chains: [monadTestnet],
  transports: {
    [monadTestnet.id]: http('https://testnet-rpc.monad.xyz'),
  },
})

interface Web3ProviderProps {
  children: React.ReactNode
}

export default function Web3Provider({ children }: Web3ProviderProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const privyAppId = import.meta.env.VITE_PRIVY_APP_ID || 'cmsjzas9f00hp0dkyqchbro5k'

  return (
    <QueryClientProvider client={queryClient}>
      <PrivyProvider
        appId={privyAppId}
        config={{
          loginMethods: ['google', 'twitter', 'email', 'wallet'],
          appearance: {
            theme: 'dark',
            accentColor: '#836EF9',
            logo: 'https://monad.xyz/favicon.ico',
          },
          embeddedWallets: {
            ethereum: {
              createOnLogin: 'users-without-wallets',
            },
          },
          defaultChain: monadTestnet,
          supportedChains: [monadTestnet],
        }}
      >
        <WagmiProvider config={wagmiConfig}>
          {mounted ? children : (
            <div className="min-h-screen bg-[#0A0518] text-white flex items-center justify-center font-sans">
              <div className="flex flex-col items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#836EF9] to-[#00E5FF] animate-pulse" />
                <span className="text-xs font-semibold tracking-wider text-slate-400">Loading MonadWishes...</span>
              </div>
            </div>
          )}
        </WagmiProvider>
      </PrivyProvider>
    </QueryClientProvider>
  )
}



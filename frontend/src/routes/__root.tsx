import { Suspense, lazy } from 'react'
import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import Footer from '../components/Footer'
import Header from '../components/Header'
import WalletProvider from '../components/WalletProvider'

import appCss from '../styles.css?url'

// import.meta.env.DEV is false in builds, so the devtools never reach the production bundle.
const Devtools = import.meta.env.DEV ? lazy(() => import('../components/Devtools')) : null

const FONT_URL = 'https://fonts.googleapis.com/css2?family=Manrope:wght@400..800&display=swap'

const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'auto';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='auto'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);if(mode==='auto'){root.removeAttribute('data-theme')}else{root.setAttribute('data-theme',mode)}root.style.colorScheme=resolved;}catch(e){}})();`

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'MonadWishes — Social Birthday Gift Vault & Yield Pool on Monad',
      },
      {
        name: 'description',
        content: 'Friends pool MON into a time-locked birthday vault on Monad and leave wishes that become a fully on-chain NFT booklet.',
      },
    ],
    links: [
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      { rel: 'stylesheet', href: FONT_URL },
      { rel: 'preload', href: '/video/hero-poster.jpg', as: 'image' },
      {
        rel: 'shortcut icon',
        href: '/favicon.jpg',
        type: 'image/jpeg',
      },
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <HeadContent />
      </head>
      <body className="font-sans antialiased [overflow-wrap:anywhere] selection:bg-[rgba(131,110,249,0.24)] bg-[#0A0518] text-white">
        <WalletProvider>
          <Header />
          {children}
          <Footer />
        </WalletProvider>
        {Devtools && (
          <Suspense fallback={null}>
            <Devtools />
          </Suspense>
        )}
        <Scripts />
      </body>
    </html>
  )
}

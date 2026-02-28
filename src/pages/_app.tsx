import type { AppProps } from 'next/app'
import { Toaster } from 'react-hot-toast'
import '@/styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0a0f1e',
            color: '#e2e8f0',
            border: '1px solid rgba(0,212,255,0.2)',
          },
        }}
      />
      <Component {...pageProps} />
    </>
  )
}

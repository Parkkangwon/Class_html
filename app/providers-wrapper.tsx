"use client"

import { ReactNode, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

// Simple client-side only component to wrap children
function ClientOnly({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <>{children}</>
  }

  return <>{children}</>
}

export default function ProvidersWrapper({ children }: { children: ReactNode }) {
  // Import Providers with no SSR
  const Providers = dynamic(
    () => import('./providers'),
    { 
      ssr: false,
      loading: () => <ClientOnly>{children}</ClientOnly>
    }
  )

  return (
    <ClientOnly>
      <Providers>
        {children}
      </Providers>
    </ClientOnly>
  )
}

'use client'

import { ReactNode } from 'react'
import dynamic from 'next/dynamic'

const ClientLayout = dynamic(
  () => import('@/app/client-layout'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    )
  }
)

export default function ClientRoot({ children }: { children: ReactNode }) {
  return <ClientLayout>{children}</ClientLayout>
}

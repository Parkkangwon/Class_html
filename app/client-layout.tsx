"use client"

import { ReactNode, useEffect, useState } from 'react'
import { AuthProvider } from "@/contexts/auth-context"

// Error boundary component
function ErrorBoundary({ children }: { children: ReactNode }) {
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Error caught by boundary:', event.error)
      setError(event.error || new Error('알 수 없는 오류가 발생했습니다'))
      event.preventDefault()
      return false
    }

    const handleRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled rejection:', event.reason)
      setError(event.reason || new Error('처리되지 않은 오류가 발생했습니다'))
      event.preventDefault()
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleRejection)
    }
  }, [])

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            ⚠️ 오류가 발생했습니다
          </h2>
          <p className="text-gray-700 mb-4">
            서비스 이용에 불편을 드려 죄송합니다.
          </p>
          <div className="mb-6 p-3 bg-gray-50 rounded border border-gray-200">
            <p className="text-sm text-gray-600 break-words">
              {error.toString()}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              새로고침
            </button>
            <a
              href="/"
              className="flex-1 px-4 py-2 text-center border border-gray-300 rounded hover:bg-gray-50"
            >
              홈으로
            </a>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

interface ClientLayoutProps {
  children: ReactNode
}

const ClientLayout = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    )
  }

  return (
    <AuthProvider>
      <ErrorBoundary>
        <div className="min-h-screen flex flex-col">
          {children}
        </div>
      </ErrorBoundary>
    </AuthProvider>
  )
}

export default ClientLayout;

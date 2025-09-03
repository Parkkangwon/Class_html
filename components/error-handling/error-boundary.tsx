"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>
  onReset?: () => void
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, errorInfo: null }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo })

    // Production error tracking
    if (process.env.NODE_ENV === "production") {
      // Send to error tracking service in production
      // errorTrackingService.captureException(error, { extra: errorInfo })
    } else {
      console.error("Error caught by boundary:", error, errorInfo)
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    if (this.props.onReset) {
      this.props.onReset()
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error!} retry={this.handleRetry} />
      }

      return <DefaultErrorFallback error={this.state.error!} retry={this.handleRetry} />
    }

    return this.props.children
  }
}

function DefaultErrorFallback({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            오류가 발생했습니다
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-red-500 bg-red-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-red-700">
              예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
            </AlertDescription>
          </Alert>

          <div className="bg-gray-100 p-3 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-1">오류 정보:</p>
            <p className="text-xs text-gray-600 font-mono">{error.message}</p>
          </div>

          <div className="flex gap-2">
            <Button onClick={retry} className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2" />
              다시 시도
            </Button>
            <Button variant="outline" onClick={() => (window.location.href = "/")} className="flex-1">
              <Home className="h-4 w-4 mr-2" />
              홈으로
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center">문제가 계속 발생하면 고객센터로 문의해주세요.</p>
        </CardContent>
      </Card>
    </div>
  )
}

// For backward compatibility
export const ErrorBoundaryComponent = ErrorBoundary;

export function NetworkErrorFallback({ retry }: { retry: () => void }) {
  return (
    <Alert className="border-yellow-500 bg-yellow-50">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="text-yellow-700">
        네트워크 연결을 확인해주세요.
        <Button variant="link" className="p-0 ml-2 text-yellow-700 underline" onClick={retry}>
          다시 시도
        </Button>
      </AlertDescription>
    </Alert>
  )
}

export function PaymentErrorFallback({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <Alert className="border-red-500 bg-red-50">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="text-red-700">
        결제 처리 중 오류가 발생했습니다: {error.message}
        <Button variant="link" className="p-0 ml-2 text-red-700 underline" onClick={retry}>
          다시 시도
        </Button>
      </AlertDescription>
    </Alert>
  )
}

"use client"

import type React from "react"
import { PaymentSystem } from "@/components/payment/payment-system"
import { useState, useEffect, useCallback } from "react"
import { Clock, Zap, Shield, AlertTriangle, CheckCircle, X, Info, Leaf, Recycle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"

interface BiddingSystemProps {
  auctionId: string
  currentPrice: number
  minIncrement: number
  instantBuyPrice?: number
  endTime: Date
  isUserVerified: boolean
  hasPaymentMethod: boolean
  onBidPlaced?: (amount: number) => void
  onInstantBuy?: () => void
}

interface Bid {
  id: string
  userId: string
  username: string
  amount: number
  timestamp: Date
  isCurrentUser: boolean
  isAutoBid: boolean
}

interface AutoBidSettings {
  isEnabled: boolean
  maxAmount: number
  currentAmount: number
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("ko-KR").format(price) + "원"
}

export function BiddingSystem({
  auctionId,
  currentPrice,
  minIncrement,
  instantBuyPrice,
  endTime,
  isUserVerified,
  hasPaymentMethod,
  onBidPlaced,
  onInstantBuy,
}: BiddingSystemProps) {
  const safeCurrentPrice = typeof currentPrice === "number" && !isNaN(currentPrice) ? currentPrice : 0
  const safeMinIncrement = typeof minIncrement === "number" && !isNaN(minIncrement) ? minIncrement : 1000
  const minBidAmount = safeCurrentPrice + safeMinIncrement

  const [bidAmount, setBidAmount] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showVerification, setShowVerification] = useState(false)
  const [recentBids, setRecentBids] = useState<Bid[]>([])
  const [autoBidSettings, setAutoBidSettings] = useState<AutoBidSettings>({
    isEnabled: false,
    maxAmount: 0,
    currentAmount: 0,
  })
  const [showAutoBidDialog, setShowAutoBidDialog] = useState(false)
  const [bidHistory, setBidHistory] = useState<Bid[]>([])
  const [timeRemaining, setTimeRemaining] = useState("")
  const [isAuctionEnding, setIsAuctionEnding] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [winningBid, setWinningBid] = useState<number | null>(null)

  // Real-time countdown
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date()
      const diff = endTime.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeRemaining("경매 종료")
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      // Check if auction is ending soon (less than 5 minutes)
      setIsAuctionEnding(diff <= 5 * 60 * 1000)

      if (days > 0) {
        setTimeRemaining(`${days}일 ${hours}시간 ${minutes}분`)
      } else if (hours > 0) {
        setTimeRemaining(`${hours}시간 ${minutes}분 ${seconds}초`)
      } else {
        setTimeRemaining(`${minutes}분 ${seconds}초`)
      }
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [endTime])

  // Simulate real-time bid updates
  useEffect(() => {
    const simulateRealTimeBids = () => {
      // Simulate incoming bids every 30-60 seconds
      const randomDelay = Math.random() * 30000 + 30000
      setTimeout(() => {
        const newBid: Bid = {
          id: Date.now().toString(),
          userId: "user_" + Math.random().toString(36).substr(2, 9),
          username: "bidder***",
          amount: safeCurrentPrice + safeMinIncrement * Math.ceil(Math.random() * 3),
          timestamp: new Date(),
          isCurrentUser: false,
          isAutoBid: Math.random() > 0.7,
        }

        setRecentBids((prev) => [newBid, ...prev.slice(0, 4)])
        setBidHistory((prev) => [newBid, ...prev])
      }, randomDelay)
    }

    const interval = setInterval(simulateRealTimeBids, 45000)
    return () => clearInterval(interval)
  }, [safeCurrentPrice, safeMinIncrement])

  // Simulate auction end and winning
  useEffect(() => {
    if (timeRemaining === "경매 종료" && recentBids.length > 0) {
      const userBid = recentBids.find((bid) => bid.isCurrentUser)
      if (userBid && userBid.amount === Math.max(...recentBids.map((b) => b.amount))) {
        setWinningBid(userBid.amount)
        setShowPayment(true)
      }
    }
  }, [timeRemaining, recentBids])

  const checkBidQualification = useCallback(() => {
    if (!isUserVerified) {
      setShowVerification(true)
      return false
    }
    if (!hasPaymentMethod) {
      alert("결제 수단을 먼저 등록해주세요.")
      return false
    }
    return true
  }, [isUserVerified, hasPaymentMethod])

  const handleManualBid = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!checkBidQualification()) return

    const amount = Number.parseInt(bidAmount)

    if (amount < minBidAmount) {
      alert(`최소 입찰가는 ${formatPrice(minBidAmount)}입니다.`)
      return
    }

    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const newBid: Bid = {
        id: Date.now().toString(),
        userId: "current_user",
        username: "나",
        amount,
        timestamp: new Date(),
        isCurrentUser: true,
        isAutoBid: false,
      }

      setRecentBids((prev) => [newBid, ...prev.slice(0, 4)])
      setBidHistory((prev) => [newBid, ...prev])
      setBidAmount("")
      onBidPlaced?.(amount)

      // Show success notification
      alert("입찰이 완료되었습니다!")
    } catch (error) {
      alert("입찰 중 오류가 발생했습니다. 다시 시도해주세요.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAutoBidSetup = (maxAmount: number) => {
    if (!checkBidQualification()) return

    if (maxAmount <= safeCurrentPrice) {
      alert("자동입찰 최대금액은 현재가보다 높아야 합니다.")
      return
    }

    setAutoBidSettings({
      isEnabled: true,
      maxAmount,
      currentAmount: safeCurrentPrice + safeMinIncrement,
    })

    setShowAutoBidDialog(false)
    alert("자동입찰이 설정되었습니다!")
  }

  const handleInstantBuyClick = () => {
    if (!checkBidQualification()) return

    if (confirm(`즉시구매가 ${formatPrice(instantBuyPrice!)}로 구매하시겠습니까?`)) {
      setWinningBid(instantBuyPrice!)
      setShowPayment(true)
      onInstantBuy?.()
    }
  }

  const getQuickBidAmounts = () => {
    const base = minBidAmount
    return [base, base + safeMinIncrement, base + safeMinIncrement * 2, base + safeMinIncrement * 5]
  }

  if (showPayment && winningBid) {
    return (
      <PaymentSystem
        auctionId={auctionId}
        itemTitle="경매 상품" // This should come from props
        winningBid={winningBid}
        buyerPremium={Math.floor(winningBid * 0.1)}
        shippingFee={30000}
        onPaymentComplete={(orderId) => {
          alert(`주문이 완료되었습니다! 주문번호: ${orderId}`)
          setShowPayment(false)
        }}
        onPaymentFailed={(error) => {
          alert(`결제 실패: ${error}`)
          setShowPayment(false)
        }}
      />
    )
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-500 p-2 rounded-full">
              <Recycle className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-800">지속가능한 선택을 하고 계십니다!</p>
              <p className="text-xs text-green-600">이 입찰로 환경 보호에 기여하고 자원순환을 실천하세요.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Price and Time */}
      <Card className={isAuctionEnding ? "border-red-500 shadow-lg" : ""}>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-lg text-gray-600">현재가</span>
              {/* Changed color from purple to green for sustainability theme */}
              <span className="text-3xl font-bold text-green-600">{formatPrice(safeCurrentPrice)}</span>
            </div>

            {instantBuyPrice && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">즉시구매가</span>
                <span className="text-lg font-semibold text-gray-800">{formatPrice(instantBuyPrice)}</span>
              </div>
            )}

            <Separator />

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">남은 시간</span>
              <span
                className={`text-lg font-bold flex items-center ${
                  isAuctionEnding ? "text-red-600 animate-pulse" : "text-red-600"
                }`}
              >
                <Clock className="h-4 w-4 mr-1" />
                {timeRemaining}
              </span>
            </div>

            {isAuctionEnding && (
              <Alert className="border-red-500 bg-red-50">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-red-700">경매가 곧 종료됩니다! 서둘러 입찰하세요.</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Qualification Check */}
      {(!isUserVerified || !hasPaymentMethod) && (
        <Alert className="border-yellow-500 bg-yellow-50">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            입찰하려면{" "}
            {!isUserVerified && (
              <Button
                variant="link"
                className="p-0 h-auto text-yellow-700 underline"
                onClick={() => setShowVerification(true)}
              >
                본인인증
              </Button>
            )}
            {!isUserVerified && !hasPaymentMethod && " 및 "}
            {!hasPaymentMethod && (
              <Button variant="link" className="p-0 h-auto text-yellow-700 underline">
                결제수단 등록
              </Button>
            )}
            이 필요합니다.
          </AlertDescription>
        </Alert>
      )}

      {/* Auto Bid Status */}
      {autoBidSettings.isEnabled && (
        <Card className="border-green-500 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">자동입찰 활성화</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAutoBidSettings((prev) => ({ ...prev, isEnabled: false }))}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-2 text-sm text-green-600">
              최대금액: {formatPrice(autoBidSettings.maxAmount)} | 현재 자동입찰가:{" "}
              {formatPrice(autoBidSettings.currentAmount)}
            </div>
            <Progress value={(autoBidSettings.currentAmount / autoBidSettings.maxAmount) * 100} className="mt-2" />
          </CardContent>
        </Card>
      )}

      {/* Bidding Actions */}
      <div className="space-y-3">
        {/* Manual Bid Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              {/* Added leaf icon for sustainability theme */}
              <Leaf className="h-5 w-5 text-green-600" />
              수동 입찰
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleManualBid} className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 mb-2 block">입찰가 (최소: {formatPrice(minBidAmount)})</label>
                <Input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  placeholder={String(minBidAmount)}
                  min={minBidAmount}
                  step={safeMinIncrement}
                  disabled={isSubmitting}
                />
              </div>

              {/* Quick Bid Buttons */}
              <div className="grid grid-cols-2 gap-2">
                {getQuickBidAmounts()
                  .slice(0, 4)
                  .map((amount) => (
                    <Button
                      key={amount}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setBidAmount(String(amount))}
                      disabled={isSubmitting}
                    >
                      {formatPrice(amount)}
                    </Button>
                  ))}
              </div>

              {/* Changed button color from purple to green */}
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isSubmitting}>
                {isSubmitting ? "입찰 중..." : "🌱 지속가능한 입찰하기"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Auto Bid and Instant Buy */}
        <div className="grid grid-cols-1 gap-3">
          <Dialog open={showAutoBidDialog} onOpenChange={setShowAutoBidDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full bg-transparent">
                <Zap className="h-4 w-4 mr-2" />
                자동입찰 설정
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>자동입찰 설정</DialogTitle>
              </DialogHeader>
              <AutoBidSetup
                currentPrice={safeCurrentPrice}
                minIncrement={safeMinIncrement}
                onSetup={handleAutoBidSetup}
                onCancel={() => setShowAutoBidDialog(false)}
              />
            </DialogContent>
          </Dialog>

          {instantBuyPrice && (
            <Button onClick={handleInstantBuyClick} variant="outline" className="w-full bg-transparent">
              즉시구매 ({formatPrice(instantBuyPrice)})
            </Button>
          )}
        </div>
      </div>

      {/* Recent Bids */}
      {recentBids.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">최근 입찰</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentBids.map((bid) => (
                <div
                  key={bid.id}
                  className={`flex justify-between items-center p-3 rounded-lg transition-all ${
                    bid.isCurrentUser ? "bg-green-50 border border-green-200" : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className={`font-medium ${bid.isCurrentUser ? "text-green-600" : "text-gray-700"}`}>
                      {bid.username}
                    </span>
                    {bid.isAutoBid && (
                      <Badge variant="secondary" className="text-xs">
                        자동
                      </Badge>
                    )}
                    {bid.isCurrentUser && <CheckCircle className="h-4 w-4 text-green-500" />}
                  </div>
                  <span className="font-bold text-lg">{formatPrice(bid.amount)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Verification Dialog */}
      <Dialog open={showVerification} onOpenChange={setShowVerification}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>본인인증 필요</DialogTitle>
          </DialogHeader>
          <VerificationDialog onComplete={() => setShowVerification(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}

function AutoBidSetup({
  currentPrice,
  minIncrement,
  onSetup,
  onCancel,
}: {
  currentPrice: number
  minIncrement: number
  onSetup: (maxAmount: number) => void
  onCancel: () => void
}) {
  const safeCurrentPrice = typeof currentPrice === "number" && !isNaN(currentPrice) ? currentPrice : 0
  const safeMinIncrement = typeof minIncrement === "number" && !isNaN(minIncrement) ? minIncrement : 1000
  const minBidAmount = safeCurrentPrice + safeMinIncrement

  const [maxAmount, setMaxAmount] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const amount = Number.parseInt(maxAmount)
    if (amount <= safeCurrentPrice) {
      alert("최대 입찰가는 현재가보다 높아야 합니다.")
      return
    }
    onSetup(amount)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">최대 입찰가</label>
        <Input
          type="number"
          value={maxAmount}
          onChange={(e) => setMaxAmount(e.target.value)}
          placeholder={String(safeCurrentPrice + safeMinIncrement * 5)}
          min={minBidAmount}
          step={safeMinIncrement}
        />
        <p className="text-xs text-gray-500 mt-1">시스템이 자동으로 최소 인상폭만큼 입찰하여 최고가를 유지합니다.</p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>다른 입찰자가 귀하의 자동입찰가를 초과하면 알림을 받게 됩니다.</AlertDescription>
      </Alert>

      <div className="flex gap-2">
        <Button type="submit" className="flex-1">
          설정하기
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          취소
        </Button>
      </div>
    </form>
  )
}

function VerificationDialog({ onComplete }: { onComplete: () => void }) {
  const [phone, setPhone] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [step, setStep] = useState<"phone" | "code">("phone")
  const [isLoading, setIsLoading] = useState(false)

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate sending verification code
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setStep("code")
    setIsLoading(false)
    alert("인증번호가 발송되었습니다.")
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate code verification
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsLoading(false)
    alert("본인인증이 완료되었습니다!")
    onComplete()
  }

  return (
    <div className="space-y-4">
      {step === "phone" ? (
        <form onSubmit={handleSendCode} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">휴대폰 번호</label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="010-0000-0000"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "발송 중..." : "인증번호 발송"}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerifyCode} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">인증번호</label>
            <Input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="6자리 인증번호"
              maxLength={6}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "확인 중..." : "인증 완료"}
          </Button>
        </form>
      )}
    </div>
  )
}

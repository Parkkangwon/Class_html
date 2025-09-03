"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Gavel, Clock, ArrowLeft, TrendingUp, TrendingDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"
import { Skeleton } from "@/components/ui/skeleton"
import { PageHeader } from "@/components/common/page-header"

// Mock bid history data
const mockBidHistory = [
  {
    id: "1",
    auction_id: "1",
    title: "북유럽 스타일 원목 다이닝 테이블",
    thumbnail_url: "/vintage-wooden-dining-table.png",
    my_bid_amount: 90000,
    current_price: 95000,
    max_bid: 100000,
    end_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    status: "outbid",
    bid_time: new Date(Date.now() - 3 * 60 * 60 * 1000),
    is_winning: false,
  },
  {
    id: "2",
    auction_id: "4",
    title: "수제 도자기 머그컵 컬렉션",
    thumbnail_url: "/ceramic-mug-collection.png",
    my_bid_amount: 45000,
    current_price: 45000,
    max_bid: 50000,
    end_time: new Date(Date.now() + 0.5 * 24 * 60 * 60 * 1000),
    status: "winning",
    bid_time: new Date(Date.now() - 1 * 60 * 60 * 1000),
    is_winning: true,
  },
  {
    id: "3",
    auction_id: "2",
    title: "빈티지 패브릭 쿠션 세트 (4개)",
    thumbnail_url: "/fabric-cushions.png",
    my_bid_amount: 30000,
    current_price: 30000,
    max_bid: 30000,
    end_time: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    status: "won",
    bid_time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    is_winning: false,
  },
]

function formatPrice(price: number) {
  return new Intl.NumberFormat("ko-KR").format(price) + "원"
}

function formatTimeRemaining(endTime: Date) {
  const now = new Date()
  const diff = endTime.getTime() - now.getTime()

  if (diff <= 0) return "경매 종료"

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (days > 0) return `${days}일 ${hours}시간`
  if (hours > 0) return `${hours}시간 ${minutes}분`
  return `${minutes}분`
}

function getStatusBadge(status: string) {
  switch (status) {
    case "winning":
      return <Badge className="bg-green-500 text-white">최고가</Badge>
    case "outbid":
      return <Badge className="bg-red-500 text-white">경합중</Badge>
    case "won":
      return <Badge className="bg-blue-500 text-white">낙찰</Badge>
    case "lost":
      return <Badge variant="secondary">유찰</Badge>
    default:
      return <Badge variant="outline">진행중</Badge>
  }
}

export default function MyBidsPage() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const router = useRouter()
  const [bidHistory, setBidHistory] = useState(mockBidHistory)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push("/login")
      return
    }

    if (isAuthenticated) {
      // Simulate data loading
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, 500)
      
      return () => clearTimeout(timer)
    }
  }, [user, router])

  if (isAuthLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-6 space-y-4">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex justify-between">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-32" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  const activeBids = bidHistory.filter((bid) => bid.status === "winning" || bid.status === "outbid")
  const completedBids = bidHistory.filter((bid) => bid.status === "won" || bid.status === "lost")

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="내 입찰 내역"
        description="나의 입찰 활동과 낙찰 내역을 확인하세요"
      />
      <div className="max-w-7xl mx-auto px-4 py-8">

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active">진행중 ({activeBids.length})</TabsTrigger>
            <TabsTrigger value="completed">완료됨 ({completedBids.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-6">
            {activeBids.length === 0 ? (
              <div className="text-center py-12">
                <Gavel className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">진행중인 입찰이 없습니다</h3>
                <p className="text-gray-500 mb-4">관심있는 상품에 입찰해보세요</p>
                <Button onClick={() => router.push("/")} className="bg-green-600 hover:bg-green-700">
                  경매 둘러보기
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeBids.map((bid) => (
                  <Card key={bid.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
                    <div className="relative">
                      <div className="relative w-full h-48">
                        <Image
                          src={bid.thumbnail_url || "/placeholder.svg"}
                          alt={bid.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover"
                        />
                      </div>
                      <div className="absolute top-4 left-4">{getStatusBadge(bid.status)}</div>
                      <div className="absolute bottom-4 right-4 bg-black/70 text-white px-2 py-1 rounded text-sm">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {formatTimeRemaining(bid.end_time)}
                      </div>
                    </div>

                    <CardContent className="p-6">
                      <h3 className="font-serif font-bold text-lg text-gray-800 mb-4 line-clamp-2">{bid.title}</h3>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">내 입찰가</span>
                          <span className="text-lg font-bold text-blue-600">{formatPrice(bid.my_bid_amount)}</span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">현재 최고가</span>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-green-600">{formatPrice(bid.current_price)}</span>
                            {bid.current_price > bid.my_bid_amount ? (
                              <TrendingUp className="h-4 w-4 text-red-500" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            onClick={() => router.push(`/auction/${bid.auction_id}`)}
                          >
                            경매 보기
                          </Button>
                          {bid.status === "outbid" && (
                            <Button
                              variant="outline"
                              className="flex-1 bg-transparent"
                              onClick={() => router.push(`/auction/${bid.auction_id}?action=rebid`)}
                            >
                              재입찰
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            {completedBids.length === 0 ? (
              <div className="text-center py-12">
                <Gavel className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">완료된 입찰이 없습니다</h3>
                <p className="text-gray-500">아직 참여한 경매가 완료되지 않았습니다</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedBids.map((bid) => (
                  <Card key={bid.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
                    <div className="relative">
                      <div className="relative w-full h-48">
                        <Image
                          src={bid.thumbnail_url || "/placeholder.svg"}
                          alt={bid.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover"
                        />
                      </div>
                      <div className="absolute top-4 left-4">{getStatusBadge(bid.status)}</div>
                    </div>

                    <CardContent className="p-6">
                      <h3 className="font-serif font-bold text-lg text-gray-800 mb-4 line-clamp-2">{bid.title}</h3>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">내 입찰가</span>
                          <span className="text-lg font-bold text-blue-600">{formatPrice(bid.my_bid_amount)}</span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">최종 낙찰가</span>
                          <span className="text-lg font-bold text-green-600">{formatPrice(bid.current_price)}</span>
                        </div>

                        {bid.status === "won" && (
                          <div className="flex gap-2 pt-2">
                            <Button
                              className="flex-1 bg-green-600 hover:bg-green-700"
                              onClick={() => router.push(`/orders`)}
                            >
                              결제하기
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

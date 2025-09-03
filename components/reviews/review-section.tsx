"use client"

import { useState, useEffect } from "react"
import { Review, ReviewStats } from "@/types/review"
import { ReviewList } from "./review-list"
import { ReviewForm } from "./review-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Star, StarHalf, StarOff } from "lucide-react"
import { getReviewsByAuctionId, getReviewStats, addReview as addReviewToMock } from "@/data/mock-reviews"

export function ReviewSection({ auctionId }: { auctionId: string }) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<ReviewStats | null>(null)
  const [activeTab, setActiveTab] = useState("reviews")
  const [isLoading, setIsLoading] = useState(true)
  const [hasSubmittedReview, setHasSubmittedReview] = useState(false)

  // Load reviews and stats
  useEffect(() => {
    const loadReviews = () => {
      try {
        const reviewsData = getReviewsByAuctionId(auctionId)
        const statsData = getReviewStats(auctionId)
        
        setReviews(reviewsData)
        setStats(statsData)
      } catch (error) {
        console.error("리뷰를 불러오는 중 오류 발생:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadReviews()
  }, [auctionId, hasSubmittedReview])

  // Handle adding a new review
  const handleAddReview = async (reviewData: {
    title: string
    content: string
    rating: number
    images: string[]
    productRating: {
      quality: number
      accuracy: number
      shipping: number
      seller: number
    }
  }): Promise<void> => {
    try {
      // In a real app, you would call your API here
      // For now, we'll use the mock function
      const newReview = {
        ...reviewData,
        auctionId, // Add the auctionId to the review
        userId: 'current_user_id', // In a real app, get this from auth context
        userName: '현재사용자',
        userAvatar: '/avatars/default.jpg',
        createdAt: new Date().toISOString(),
        likes: 0,
        isPurchased: true, // Assuming the user has purchased the item
      }
      
      await addReviewToMock(auctionId, newReview)
      
      // Refresh reviews
      setHasSubmittedReview(prev => !prev)
      setActiveTab("reviews")
    } catch (error) {
      console.error("리뷰 제출 중 오류 발생:", error)
      throw error
    }
  }

  // Handle like action
  const handleLikeReview = (reviewId: string) => {
    // In a real app, you would call your API here
    // For now, we'll just update the local state
    setReviews(prev => 
      prev.map(review => 
        review.id === reviewId 
          ? { ...review, likes: review.likes + 1 } 
          : review
      )
    )
  }

  if (isLoading) {
    return (
      <div className="py-10 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-gray-600">리뷰를 불러오는 중입니다...</p>
      </div>
    )
  }

  return (
    <section className="mt-12" id="reviews">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-md mb-6">
          <TabsTrigger value="reviews">
            상품 리뷰 {stats ? `(${stats.totalReviews})` : ''}
          </TabsTrigger>
          <TabsTrigger value="write">리뷰 작성하기</TabsTrigger>
        </TabsList>

        <TabsContent value="reviews">
          {stats && stats.totalReviews > 0 ? (
            <div className="space-y-8">
              {/* Rating Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    <div className="flex items-center">
                      <div className="text-3xl font-bold mr-2">{stats.averageRating.toFixed(1)}</div>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-5 w-5 ${
                              star <= Math.floor(stats.averageRating)
                                ? 'text-yellow-400 fill-current'
                                : star - 0.5 <= stats.averageRating
                                ? 'text-yellow-400 fill-current opacity-70'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="ml-2 text-sm text-gray-500">
                        {stats.totalReviews}개 리뷰
                      </span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { label: '상품 품질', value: stats.productAverages.quality },
                      { label: '설명 일치도', value: stats.productAverages.accuracy },
                      { label: '배송 만족도', value: stats.productAverages.shipping },
                      { label: '판매자 응대', value: stats.productAverages.seller },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center">
                        <span className="w-24 text-sm text-gray-600">{item.label}</span>
                        <div className="flex-1 flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                            <div 
                              className="bg-blue-600 h-2.5 rounded-full" 
                              style={{ width: `${(item.value / 5) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-8">{item.value.toFixed(1)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Reviews List */}
              <ReviewList 
                reviews={reviews} 
                onLike={handleLikeReview} 
              />
            </div>
          ) : (
            <div className="text-center py-10 border rounded-lg">
              <StarOff className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">아직 등록된 리뷰가 없습니다</h3>
              <p className="text-gray-500 mb-4">이 상품의 첫 리뷰를 작성해보세요!</p>
              <button 
                onClick={() => setActiveTab("write")}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
              >
                리뷰 작성하기
              </button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="write">
          <ReviewForm 
            auctionId={auctionId} 
            onSubmit={handleAddReview}
          />
        </TabsContent>
      </Tabs>
    </section>
  )
}

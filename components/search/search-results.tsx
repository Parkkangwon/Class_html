"use client"

import { useSearchParams } from "next/navigation"
import { useMemo } from "react"
import { Auction } from "@/types/auction"
import { AuctionCard } from "@/components/auction/auction-card"
import { Button } from "@/components/ui/button"
import { mockAuctions } from "@/data/mock-auctions"
import { Loader2 } from "lucide-react"

interface SearchResultsProps {
  onLoadMore: () => void
  isLoading: boolean
  visibleItems: number
}

export function SearchResults({ onLoadMore, isLoading, visibleItems }: SearchResultsProps) {
  const searchParams = useSearchParams()
  
  // 검색 및 필터링 로직
  const filteredAuctions = useMemo(() => {
    let result = [...mockAuctions]
    
    // 검색어 필터링
    const searchQuery = searchParams.get('q')?.toLowerCase()
    if (searchQuery) {
      result = result.filter(auction => 
        auction.title.toLowerCase().includes(searchQuery) ||
        auction.description.toLowerCase().includes(searchQuery) ||
        auction.brand.toLowerCase().includes(searchQuery) ||
        auction.category.toLowerCase().includes(searchQuery)
      )
    }
    
    // 카테고리 필터링
    const categories = searchParams.get('categories')?.split(',').filter(Boolean) || []
    if (categories.length > 0) {
      result = result.filter(auction => 
        categories.some(cat => auction.category.includes(cat))
      )
    }
    
    // 상태 필터링
    const conditions = searchParams.get('conditions')?.split(',').filter(Boolean) || []
    if (conditions.length > 0) {
      result = result.filter(auction => 
        conditions.includes(auction.condition_grade.toLowerCase())
      )
    }
    
    // 가격 범위 필터링
    const priceRange = searchParams.get('price')?.split('-').map(Number)
    if (priceRange?.length === 2) {
      result = result.filter(auction => 
        auction.current_price >= priceRange[0] && 
        auction.current_price <= priceRange[1]
      )
    }
    
    // 정렬
    const sortBy = searchParams.get('sort') || 'recent'
    switch (sortBy) {
      case 'price_asc':
        result.sort((a, b) => a.current_price - b.current_price)
        break
      case 'price_desc':
        result.sort((a, b) => b.current_price - a.current_price)
        break
      case 'popular':
        result.sort((a, b) => b.view_count - a.view_count)
        break
      case 'ending':
        result.sort((a, b) => {
          const dateA = a.end_time ? new Date(a.end_time).getTime() : 0
          const dateB = b.end_time ? new Date(b.end_time).getTime() : 0
          return dateA - dateB
        })
        break
      default: // recent
        result.sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
          return dateB - dateA
        })
    }
    
    return result
  }, [searchParams])

  if (filteredAuctions.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-gray-400 mb-4">
          <svg 
            className="mx-auto h-12 w-12" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900">검색 결과가 없습니다</h3>
        <p className="mt-1 text-gray-500">다른 검색어로 시도해 보세요.</p>
        <div className="mt-6">
          <Button 
            variant="outline"
            onClick={() => window.location.href = '/'}
          >
            필터 초기화
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredAuctions.slice(0, visibleItems).map((auction) => (
          <AuctionCard key={auction.id} auction={auction} />
        ))}
      </div>
      
      {visibleItems < filteredAuctions.length && (
        <div className="mt-8 text-center">
          <Button 
            onClick={onLoadMore}
            disabled={isLoading}
            className="px-6 py-3"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                로드 중...
              </>
            ) : '더보기'}
          </Button>
        </div>
      )}
    </>
  )
}

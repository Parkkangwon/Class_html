"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { SearchBar } from "@/components/search/search-bar"
import { SearchFilters } from "@/components/search/search-filters"
import { SearchResults } from "@/components/search/search-results"
import { SearchResultCount } from "@/components/search/search-result-count"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/common/page-header"

export default function AuctionListingsPage() {
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [visibleItems, setVisibleItems] = useState(12)
  
  // 더보기 버튼 클릭 핸들러
  const handleLoadMore = () => {
    setIsLoading(true)
    // 시뮬레이션을 위한 지연
    setTimeout(() => {
      setVisibleItems(prev => prev + 12)
      setIsLoading(false)
    }, 300)
  }
  
  // 검색 파라미터가 변경되면 스크롤을 맨 위로 이동
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [searchParams])

  return (
    <main className="min-h-screen bg-gray-50">
      <PageHeader 
        title="경매 상품"
        description="다양한 경매 상품을 찾아보세요"
      >
        <div className="w-full md:max-w-xl">
          <SearchBar />
        </div>
      </PageHeader>
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="text-sm text-gray-500">
            총 <span className="font-medium text-gray-900">
              <SearchResultCount />
            </span>개의 상품
          </div>
          <SearchFilters />
        </div>
      </div>
      
      {/* 검색 결과 */}
      <div className="container mx-auto px-4 py-6">
        <SearchResults 
          onLoadMore={handleLoadMore}
          isLoading={isLoading}
          visibleItems={visibleItems}
        />
      </div>
    </main>
  )
}

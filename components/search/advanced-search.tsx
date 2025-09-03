"use client"

import { useState, useEffect } from "react"
import { Search, Filter, Zap, Leaf, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"

interface AdvancedSearchProps {
  onSearchChange: (filters: SearchFilters) => void
}

interface SearchFilters {
  query: string
  category: string
  priceRange: [number, number]
  condition: string
  location: string
  endingSoon: boolean
  sustainabilityScore: number
  hasInstantBuy: boolean
  sortBy: string
}

export default function AdvancedSearch({ onSearchChange }: AdvancedSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    category: "전체",
    priceRange: [0, 500000],
    condition: "전체",
    location: "전체",
    endingSoon: false,
    sustainabilityScore: 0,
    hasInstantBuy: false,
    sortBy: "마감임박",
  })

  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    onSearchChange(filters)
  }, [filters, onSearchChange])

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5 text-green-600" />
          스마트 검색
          <Badge className="bg-green-100 text-green-700">AI 추천</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            placeholder="원하는 상품을 검색하세요... (예: 원목 테이블, 빈티지 소파)"
            value={filters.query}
            {...(typeof window !== 'undefined' ? {
              onChange: (e) => updateFilter("query", e.target.value)
            } : {})}
            className="pl-10 text-lg h-12"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
          >
            <Filter className="h-4 w-4" />
            상세필터
          </Button>
        </div>

        {/* Quick filters */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filters.endingSoon ? "default" : "outline"}
            size="sm"
            onClick={() => updateFilter("endingSoon", !filters.endingSoon)}
            className="flex items-center gap-1"
          >
            <Zap className="h-3 w-3" />
            마감임박
          </Button>
          <Button
            variant={filters.hasInstantBuy ? "default" : "outline"}
            size="sm"
            onClick={() => updateFilter("hasInstantBuy", !filters.hasInstantBuy)}
            className="flex items-center gap-1"
          >
            <Star className="h-3 w-3" />
            즉시구매
          </Button>
          <Button
            variant={filters.sustainabilityScore > 0 ? "default" : "outline"}
            size="sm"
            onClick={() => updateFilter("sustainabilityScore", filters.sustainabilityScore > 0 ? 0 : 80)}
            className="flex items-center gap-1 bg-green-600 hover:bg-green-700"
          >
            <Leaf className="h-3 w-3" />
            친환경 우수
          </Button>
        </div>

        {/* Advanced filters */}
        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 border-t">
            <div className="space-y-2">
              <Label>카테고리</Label>
              <Select value={filters.category} onValueChange={(value) => updateFilter("category", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="전체">전체 카테고리</SelectItem>
                  <SelectItem value="가구">가구</SelectItem>
                  <SelectItem value="소품">소품</SelectItem>
                  <SelectItem value="가전">가전</SelectItem>
                  <SelectItem value="도예">도예/공예</SelectItem>
                  <SelectItem value="회화">회화/예술</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>지역</Label>
              <Select value={filters.location} onValueChange={(value) => updateFilter("location", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="전체">전국</SelectItem>
                  <SelectItem value="서울">서울</SelectItem>
                  <SelectItem value="경기">경기</SelectItem>
                  <SelectItem value="인천">인천</SelectItem>
                  <SelectItem value="부산">부산</SelectItem>
                  <SelectItem value="대구">대구</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>상태등급</Label>
              <Select value={filters.condition} onValueChange={(value) => updateFilter("condition", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="전체">전체</SelectItem>
                  <SelectItem value="S">S급 (최상)</SelectItem>
                  <SelectItem value="A">A급 (우수)</SelectItem>
                  <SelectItem value="B">B급 (양호)</SelectItem>
                  <SelectItem value="C">C급 (보통)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>
                가격 범위: {filters.priceRange[0].toLocaleString()}원 - {filters.priceRange[1].toLocaleString()}원
              </Label>
              <Slider
                value={filters.priceRange}
                onValueChange={(value) => updateFilter("priceRange", value)}
                max={500000}
                min={0}
                step={10000}
                className="w-full"
              />
            </div>

            <div className="space-y-3">
              <Label>지속가능성 점수: {filters.sustainabilityScore}점 이상</Label>
              <Slider
                value={[filters.sustainabilityScore]}
                onValueChange={(value) => updateFilter("sustainabilityScore", value[0])}
                max={100}
                min={0}
                step={10}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label>정렬 기준</Label>
              <Select value={filters.sortBy} onValueChange={(value) => updateFilter("sortBy", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="마감임박">마감임박순</SelectItem>
                  <SelectItem value="신규">신규등록순</SelectItem>
                  <SelectItem value="인기">인기순</SelectItem>
                  <SelectItem value="낮은가격">낮은가격순</SelectItem>
                  <SelectItem value="높은가격">높은가격순</SelectItem>
                  <SelectItem value="지속가능성">지속가능성순</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Search suggestions */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-500">인기 검색어:</span>
          {["원목 가구", "빈티지 소품", "친환경 제품", "핸드메이드", "디자이너 가구"].map((term) => (
            <Button
              key={term}
              variant="ghost"
              size="sm"
              onClick={() => updateFilter("query", term)}
              className="text-xs text-green-600 hover:bg-green-50"
            >
              {term}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}


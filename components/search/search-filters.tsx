"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { SlidersHorizontal, X } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

const CATEGORIES = [
  { id: "furniture", name: "가구" },
  { id: "electronics", name: "전자제품" },
  { id: "clothing", name: "의류" },
  { id: "books", name: "도서" },
  { id: "sports", name: "스포츠" },
  { id: "collectibles", name: "수집품" },
]

const CONDITIONS = [
  { id: "new", name: "새 상품" },
  { id: "like_new", name: "거의 새 것" },
  { id: "good", name: "상태 좋음" },
  { id: "fair", name: "보통" },
  { id: "poor", name: "사용감 있음" },
]

export function SearchFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)
  
  // URL에서 필터 값 가져오기
  const selectedCategories = searchParams.get('categories')?.split(',') || []
  const selectedConditions = searchParams.get('conditions')?.split(',') || []
  const priceRange = searchParams.get('price')
    ? searchParams.get('price')!.split('-').map(Number)
    : [0, 1000000]
  const sortBy = searchParams.get('sort') || 'recent'

  const handleFilterChange = (type: string, value: string, checked: boolean) => {
    const params = new URLSearchParams(searchParams.toString())
    const currentValues = params.get(type)?.split(',').filter(Boolean) || []
    
    if (checked) {
      params.set(type, [...currentValues, value].join(','))
    } else {
      const newValues = currentValues.filter(v => v !== value)
      if (newValues.length > 0) {
        params.set(type, newValues.join(','))
      } else {
        params.delete(type)
      }
    }
    
    router.push(`/?${params.toString()}`, { scroll: false })
  }

  const handlePriceChange = (values: number[]) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('price', values.join('-'))
    router.push(`/?${params.toString()}`, { scroll: false })
  }

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', value)
    router.push(`/?${params.toString()}`, { scroll: false })
  }

  const clearFilters = () => {
    router.push('/', { scroll: false })
  }

  const activeFilterCount = [
    selectedCategories.length,
    selectedConditions.length,
    priceRange[0] !== 0 || priceRange[1] !== 1000000 ? 1 : 0
  ].reduce((a, b) => a + b, 0)

  return (
    <div className="flex items-center space-x-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="relative"
            onClick={() => setIsOpen(!isOpen)}
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            필터
            {activeFilterCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="end">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">검색 필터</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-sm text-gray-500 hover:text-gray-700"
                onClick={clearFilters}
              >
                초기화
              </Button>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">가격 범위</h4>
              <div className="px-2">
                <Slider
                  value={priceRange}
                  onValueChange={handlePriceChange}
                  min={0}
                  max={1000000}
                  step={1000}
                  minStepsBetweenThumbs={1}
                  className="my-4"
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>₩{priceRange[0].toLocaleString()}</span>
                  <span>₩{priceRange[1].toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">카테고리</h4>
              <div className="space-y-2">
                {CATEGORIES.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`category-${category.id}`}
                      checked={selectedCategories.includes(category.id)}
                      onCheckedChange={(checked) => 
                        handleFilterChange('categories', category.id, checked as boolean)
                      }
                    />
                    <Label htmlFor={`category-${category.id}`} className="text-sm">
                      {category.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">상태</h4>
              <div className="space-y-2">
                {CONDITIONS.map((condition) => (
                  <div key={condition.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`condition-${condition.id}`}
                      checked={selectedConditions.includes(condition.id)}
                      onCheckedChange={(checked) => 
                        handleFilterChange('conditions', condition.id, checked as boolean)
                      }
                    />
                    <Label htmlFor={`condition-${condition.id}`} className="text-sm">
                      {condition.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <div className="relative">
        <select
          value={sortBy}
          onChange={(e) => handleSortChange(e.target.value)}
          className="appearance-none bg-white border border-gray-300 rounded-md pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
        >
          <option value="recent">최신순</option>
          <option value="price_asc">낮은 가격순</option>
          <option value="price_desc">높은 가격순</option>
          <option value="popular">인기순</option>
          <option value="ending">마감 임박순</option>
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>

      {activeFilterCount > 0 && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
          onClick={clearFilters}
        >
          <X className="h-4 w-4 mr-1" />
          필터 초기화
        </Button>
      )}
    </div>
  )
}

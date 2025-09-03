"use client"

import { useState, useEffect } from "react"
import { 
  Plus, Edit, Trash2, Eye, Search, Filter, Calendar, Clock, Gavel, Tag, 
  AlertCircle, CheckCircle2, XCircle, MoreVertical, ArrowUpDown, Download,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, SlidersHorizontal
} from "lucide-react"
import { format, addDays, isAfter, isBefore, parseISO } from 'date-fns'
import { ko } from 'date-fns/locale'
import { DateRange } from 'react-day-picker'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow,
  TableCaption
} from "@/components/ui/table"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger, 
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem
} from "@/components/ui/dropdown-menu"
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar as CalendarIcon } from "@/components/ui/calendar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { formatPrice } from "@/lib/utils"

// Types
type AuctionStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'cancelled'

interface Auction {
  id: string
  title: string
  description: string
  category: string
  subCategory?: string
  brand: string
  condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor'
  startPrice: number
  currentPrice: number
  buyNowPrice?: number
  startTime: Date
  endTime: Date
  status: AuctionStatus
  bidCount: number
  viewCount: number
  seller: string
  sellerId: string
  images: string[]
  shippingOptions: {
    localPickup: boolean
    domesticShipping: boolean
    internationalShipping: boolean
    shippingCost: number
  }
  createdAt: Date
  updatedAt: Date
}

const mockAuctions = [
  {
    id: "A001",
    title: "빈티지 원목 다이닝 테이블",
    category: "가구/테이블",
    brand: "핸드메이드",
    currentPrice: 85000,
    startPrice: 50000,
    endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    status: "active",
    bidCount: 12,
    seller: "eco_furniture",
  },
  {
    id: "A002",
    title: "수제 도자기 머그컵 세트",
    category: "도예/공예",
    brand: "로컬아티스트",
    currentPrice: 35000,
    startPrice: 25000,
    endTime: new Date(Date.now() + 1.5 * 24 * 60 * 60 * 1000),
    status: "active",
    bidCount: 8,
    seller: "pottery_master",
  },
  {
    id: "A003",
    title: "친환경 텀블러 컬렉션",
    category: "소품/텀블러",
    brand: "에코브랜드",
    currentPrice: 15000,
    startPrice: 15000,
    endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    status: "scheduled",
    bidCount: 3,
    seller: "green_seller",
  },
]

function formatPrice(price: number) {
  return new Intl.NumberFormat("ko-KR").format(price) + "원"
}

function getStatusBadge(status: string) {
  switch (status) {
    case "active":
      return <Badge className="bg-green-500">진행중</Badge>
    case "scheduled":
      return <Badge variant="secondary">예정</Badge>
    case "ended":
      return <Badge variant="destructive">종료</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export function AuctionManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const filteredAuctions = mockAuctions.filter((auction) => {
    const matchesSearch =
      auction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      auction.brand.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || auction.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">경매 관리</h1>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />새 경매 등록
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>새 경매 등록</DialogTitle>
            </DialogHeader>
            <CreateAuctionForm onClose={() => setShowCreateDialog(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="경매 제목, 브랜드로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="상태 필터" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="active">진행중</SelectItem>
                <SelectItem value="scheduled">예정</SelectItem>
                <SelectItem value="ended">종료</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Auctions Table */}
      <Card>
        <CardHeader>
          <CardTitle>경매 목록 ({filteredAuctions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>경매 ID</TableHead>
                <TableHead>제목</TableHead>
                <TableHead>카테고리</TableHead>
                <TableHead>현재가</TableHead>
                <TableHead>입찰수</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>판매자</TableHead>
                <TableHead>작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAuctions.map((auction) => (
                <TableRow key={auction.id}>
                  <TableCell className="font-medium">{auction.id}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{auction.title}</p>
                      <p className="text-sm text-gray-500">{auction.brand}</p>
                    </div>
                  </TableCell>
                  <TableCell>{auction.category}</TableCell>
                  <TableCell>{formatPrice(auction.currentPrice)}</TableCell>
                  <TableCell>{auction.bidCount}</TableCell>
                  <TableCell>{getStatusBadge(auction.status)}</TableCell>
                  <TableCell>{auction.seller}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function CreateAuctionForm({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    brand: "",
    startPrice: "",
    instantBuyPrice: "",
    duration: "7",
    condition: "",
    materials: "",
    dimensions: "",
    weight: "",
    images: [] as File[],
    shippingOptions: {
      localPickup: true,
      domesticShipping: false,
      internationalShipping: false,
      shippingCost: 0
    }
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.title.trim()) newErrors.title = '제목을 입력해주세요'
    if (!formData.category) newErrors.category = '카테고리를 선택해주세요'
    if (!formData.startPrice) newErrors.startPrice = '시작가를 입력해주세요'
    if (formData.images.length === 0) newErrors.images = '이미지를 최소 1장 이상 등록해주세요'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...files].slice(0, 10) // 최대 10개 파일
      }))
    }
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsSubmitting(true)
    
    try {
      const formDataToSend = new FormData()
      
      // Add all form data
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'images') {
          formData.images.forEach((file, i) => {
            formDataToSend.append('images', file)
          })
        } else if (key === 'shippingOptions') {
          formDataToSend.append('shippingOptions', JSON.stringify(value))
        } else {
          formDataToSend.append(key, value as string)
        }
      })
      
      // Add auction end date
      const endDate = new Date()
      endDate.setDate(endDate.getDate() + parseInt(formData.duration))
      formDataToSend.append('endDate', endDate.toISOString())
      
      // Call API
      const response = await fetch('/api/auctions', {
        method: 'POST',
        body: formDataToSend,
      })
      
      if (!response.ok) {
        throw new Error('경매 등록에 실패했습니다.')
      }
      
      toast.success('경매가 성공적으로 등록되었습니다!')
      onClose()
    } catch (error) {
      console.error('Error creating auction:', error)
      toast.error(error instanceof Error ? error.message : '경매 등록 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto p-2">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">
            제품명 <span className="text-red-500">*</span>
          </label>
          <Input
            value={formData.title}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, title: e.target.value }))
              setErrors(prev => ({ ...prev, title: '' }))
            }}
            placeholder="예: 빈티지 원목 테이블"
            className={errors.title ? 'border-red-500' : ''}
          />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">브랜드/제작자</label>
          <Input
            value={formData.brand}
            onChange={(e) => setFormData((prev) => ({ ...prev, brand: e.target.value }))}
            placeholder="예: 핸드메이드, 로컬아티스트"
            required
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">
          상품 설명 <span className="text-red-500">*</span>
        </label>
        <textarea
          className="w-full p-3 border rounded-md min-h-[120px]"
          value={formData.description}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          placeholder="상품의 히스토리, 특징, 재활용 가치 등을 설명해주세요"
        />
      </div>

      {/* 이미지 업로드 섹션 */}
      <div>
        <label className="text-sm font-medium mb-2 block">
          상품 이미지 <span className="text-red-500">*</span>
          <span className="text-xs text-gray-500 ml-2">(최대 10장, JPG/PNG, 최대 5MB)</span>
        </label>
        <div className="border-2 border-dashed rounded-lg p-6 text-center">
          <input
            type="file"
            id="image-upload"
            className="hidden"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
          />
          <label
            htmlFor="image-upload"
            className="cursor-pointer flex flex-col items-center justify-center py-8"
          >
            <Upload className="w-12 h-12 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">이미지를 드래그하거나 클릭하여 업로드하세요</p>
            <p className="text-xs text-gray-500 mt-1">대표이미지로 사용할 사진을 먼저 업로드하세요</p>
          </label>
        </div>
        
        {errors.images && <p className="text-red-500 text-xs mt-1">{errors.images}</p>}
        
        {/* 이미지 미리보기 */}
        {formData.images.length > 0 && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {formData.images.map((file, index) => (
              <div key={index} className="relative group">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`미리보기 ${index + 1}`}
                  className="w-full h-24 object-cover rounded-md"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">
            카테고리 <span className="text-red-500">*</span>
          </label>
          <Select
            value={formData.category}
            onValueChange={(value) => {
              setFormData((prev) => ({ ...prev, category: value }))
              setErrors(prev => ({ ...prev, category: '' }))
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="카테고리 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="furniture-sofa">가구/쇼파</SelectItem>
              <SelectItem value="furniture-table">가구/테이블</SelectItem>
              <SelectItem value="props-fabric">소품/패브릭</SelectItem>
              <SelectItem value="props-cushion">소품/쿠션</SelectItem>
              <SelectItem value="props-tumbler">소품/텀블러</SelectItem>
              <SelectItem value="props-mug">소품/머그컵</SelectItem>
              <SelectItem value="appliances-coffee">가전/커피머신</SelectItem>
              <SelectItem value="pottery-craft">도예/공예</SelectItem>
              <SelectItem value="art-canvas">회화/캔버스</SelectItem>
              <SelectItem value="fashion-clothing">패션/의류</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">상태등급</label>
          <Select
            value={formData.condition}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, condition: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="상태 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="S">S등급 - 새제품/미사용</SelectItem>
              <SelectItem value="A">A등급 - 사용감 거의 없음</SelectItem>
              <SelectItem value="B">B등급 - 약간의 사용감</SelectItem>
              <SelectItem value="C">C등급 - 사용감 많음</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">
            시작가 (원) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Input
              type="number"
              value={formData.startPrice}
              onChange={(e) => {
                const value = e.target.value
                if (value === '' || (parseInt(value) > 0 && parseInt(value) <= 1000000000)) {
                  setFormData((prev) => ({ ...prev, startPrice: value }))
                  setErrors(prev => ({ ...prev, startPrice: '' }))
                }
              }}
              placeholder="10000"
              className={`pl-8 ${errors.startPrice ? 'border-red-500' : ''}`}
            />
            <span className="absolute left-3 top-2.5 text-gray-500">₩</span>
          </div>
          {errors.startPrice && <p className="text-red-500 text-xs mt-1">{errors.startPrice}</p>}
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">즉시구매가 (원)</label>
          <Input
            type="number"
            value={formData.instantBuyPrice}
            onChange={(e) => setFormData((prev) => ({ ...prev, instantBuyPrice: e.target.value }))}
            placeholder="50000 (선택사항)"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">경매기간 (일)</label>
          <Select
            value={formData.duration}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, duration: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">3일</SelectItem>
              <SelectItem value="5">5일</SelectItem>
              <SelectItem value="7">7일</SelectItem>
              <SelectItem value="10">10일</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">재질/소재</label>
          <Input
            value={formData.materials}
            onChange={(e) => setFormData((prev) => ({ ...prev, materials: e.target.value }))}
            placeholder="예: 원목, 도자기, 면"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">크기 (cm)</label>
          <Input
            value={formData.dimensions}
            onChange={(e) => setFormData((prev) => ({ ...prev, dimensions: e.target.value }))}
            placeholder="예: 120x80x75"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">무게 (kg)</label>
          <Input
            value={formData.weight}
            onChange={(e) => setFormData((prev) => ({ ...prev, weight: e.target.value }))}
            placeholder="예: 15"
          />
        </div>
      </div>

      {/* 배송 옵션 */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium">배송 옵션</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="localPickup" 
              checked={formData.shippingOptions.localPickup}
              onCheckedChange={(checked) => 
                setFormData(prev => ({
                  ...prev,
                  shippingOptions: {
                    ...prev.shippingOptions,
                    localPickup: checked as boolean
                  }
                }))
              }
            />
            <label htmlFor="localPickup" className="text-sm">
              직거래 가능
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="domesticShipping" 
              checked={formData.shippingOptions.domesticShipping}
              onCheckedChange={(checked) => 
                setFormData(prev => ({
                  ...prev,
                  shippingOptions: {
                    ...prev.shippingOptions,
                    domesticShipping: checked as boolean
                  }
                }))
              }
            />
            <label htmlFor="domesticShipping" className="text-sm">
              국내 배송
            </label>
            
            {formData.shippingOptions.domesticShipping && (
              <div className="flex items-center ml-4">
                <span className="text-sm text-gray-500 mr-2">배송비:</span>
                <Input 
                  type="number" 
                  value={formData.shippingOptions.shippingCost || ''}
                  onChange={(e) => 
                    setFormData(prev => ({
                      ...prev,
                      shippingOptions: {
                        ...prev.shippingOptions,
                        shippingCost: parseInt(e.target.value) || 0
                      }
                    }))
                  }
                  className="w-24 h-8"
                  min="0"
                />
                <span className="text-sm text-gray-500 ml-1">원</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="internationalShipping" 
              checked={formData.shippingOptions.internationalShipping}
              onCheckedChange={(checked) => 
                setFormData(prev => ({
                  ...prev,
                  shippingOptions: {
                    ...prev.shippingOptions,
                    internationalShipping: checked as boolean
                  }
                }))
              }
            />
            <label htmlFor="internationalShipping" className="text-sm">
              해외 배송 (문의 요망)
            </label>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between pt-4 border-t">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onClose}
          disabled={isSubmitting}
        >
          취소
        </Button>
        <div className="space-x-2">
          <Button 
            type="button" 
            variant="outline"
            disabled={isSubmitting}
          >
            임시 저장
          </Button>
          <Button 
            type="submit" 
            className="bg-green-600 hover:bg-green-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? '등록 중...' : '경매 등록하기'}
          </Button>
        </div>
      </div>
    </form>
  )
}

"use client"

import type React from "react"
import { FormValidationDisplay, auctionValidators } from "@/components/validation/form-validator"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Upload, X, Recycle, Leaf } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { PageLoadingState } from "@/components/ui/loading-states"

export default function ProductRegisterPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [images, setImages] = useState<string[]>([])
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    brand: "",
    condition: "",
    materials: "",
    dimensions: "",
    weight: "",
    startPrice: "",
    instantBuyPrice: "",
    duration: "7",
    shippingIncluded: false,
    returnPolicy: false,
    sustainabilityFeatures: {
      isUpcycled: false,
      isEcoFriendly: false,
      isVintage: false,
      carbonFootprintReduced: false,
    },
    story: "",
    previousOwners: "",
  })
  const [validation, setValidation] = useState({ isValid: true, errors: {}, warnings: {} })

  useEffect(() => {
    if (!user) {
      router.push("/login")
    } else {
      setIsLoading(false)
    }
  }, [user, router])

  useEffect(() => {
    const validationResult = auctionValidators.product.validate(formData)
    setValidation(validationResult)
  }, [formData])

  if (isLoading) {
    return <PageLoadingState message="상품 등록 페이지를 준비하는 중..." />
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      // Mock image upload - in real app would upload to server
      const newImages = Array.from(files).map((file) => URL.createObjectURL(file))
      setImages((prev) => [...prev, ...newImages].slice(0, 10)) // Max 10 images
    }
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const validationResult = auctionValidators.product.validate(formData)
    setValidation(validationResult)

    if (!validationResult.isValid) {
      alert("입력 정보를 확인해주세요.")
      return
    }

    if (images.length === 0) {
      alert("최소 1장의 상품 이미지를 업로드해주세요.")
      return
    }

    alert("자원순환 상품이 성공적으로 등록되었습니다! 지구를 위한 선택에 감사드립니다.")
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            돌아가기
          </Button>
          <div className="flex items-center gap-3">
            <Recycle className="h-8 w-8 text-green-600" />
            <h1 className="text-3xl font-serif font-bold text-gray-800">자원순환 상품 등록</h1>
            <Leaf className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Leaf className="h-5 w-5 text-green-600" />
            <h3 className="font-semibold text-green-800">지속가능한 자원순환에 참여해주세요!</h3>
          </div>
          <p className="text-green-700 text-sm">
            버려질 뻔한 물건에 새로운 생명을 불어넣어 주세요. 당신의 참여가 지구 환경 보호에 큰 도움이 됩니다.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                상품 이미지
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-green-300 rounded-lg p-6 text-center bg-green-50">
                  <Upload className="h-12 w-12 mx-auto text-green-500 mb-4" />
                  <p className="text-gray-600 mb-4">이미지를 드래그하거나 클릭하여 업로드하세요</p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload">
                    <Button
                      type="button"
                      variant="outline"
                      className="cursor-pointer bg-white hover:bg-green-50 border-green-300"
                    >
                      이미지 선택
                    </Button>
                  </label>
                  <p className="text-sm text-gray-500 mt-2">최대 10장까지 업로드 가능 (필수)</p>
                </div>

                {images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image || "/placeholder.svg"}
                          alt={`상품 이미지 ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border-2 border-green-200"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 h-6 w-6 p-0"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        {index === 0 && (
                          <Badge className="absolute bottom-2 left-2 bg-green-600 text-white text-xs">대표이미지</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>기본 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">상품명 *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="예: 빈티지 원목 다이닝 테이블"
                    required
                    className="border-green-200 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">브랜드/제작자</label>
                  <Input
                    value={formData.brand}
                    onChange={(e) => setFormData((prev) => ({ ...prev, brand: e.target.value }))}
                    placeholder="예: 핸드메이드, 로컬아티스트"
                    className="border-green-200 focus:border-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">상품 설명 *</label>
                <textarea
                  className="w-full p-3 border border-green-200 rounded-md min-h-32 focus:border-green-500 focus:outline-none"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="상품의 히스토리, 특징, 재활용 가치, 사용 흔적 등을 자세히 설명해주세요"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">카테고리 *</label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger className="border-green-200 focus:border-green-500">
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
                  <label className="text-sm font-medium mb-2 block">상태등급 *</label>
                  <Select
                    value={formData.condition}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, condition: value }))}
                  >
                    <SelectTrigger className="border-green-200 focus:border-green-500">
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
            </CardContent>
          </Card>

          {/* Sustainability Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-green-600" />
                지속가능성 특징
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="upcycled"
                    checked={formData.sustainabilityFeatures.isUpcycled}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        sustainabilityFeatures: { ...prev.sustainabilityFeatures, isUpcycled: checked as boolean },
                      }))
                    }
                  />
                  <label htmlFor="upcycled" className="text-sm">
                    업사이클링 제품
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="eco-friendly"
                    checked={formData.sustainabilityFeatures.isEcoFriendly}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        sustainabilityFeatures: { ...prev.sustainabilityFeatures, isEcoFriendly: checked as boolean },
                      }))
                    }
                  />
                  <label htmlFor="eco-friendly" className="text-sm">
                    친환경 소재
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="vintage"
                    checked={formData.sustainabilityFeatures.isVintage}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        sustainabilityFeatures: { ...prev.sustainabilityFeatures, isVintage: checked as boolean },
                      }))
                    }
                  />
                  <label htmlFor="vintage" className="text-sm">
                    빈티지/앤틱
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="carbon-reduced"
                    checked={formData.sustainabilityFeatures.carbonFootprintReduced}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        sustainabilityFeatures: {
                          ...prev.sustainabilityFeatures,
                          carbonFootprintReduced: checked as boolean,
                        },
                      }))
                    }
                  />
                  <label htmlFor="carbon-reduced" className="text-sm">
                    탄소발자국 감소
                  </label>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">상품 스토리</label>
                <textarea
                  className="w-full p-3 border border-green-200 rounded-md min-h-24 focus:border-green-500 focus:outline-none"
                  value={formData.story}
                  onChange={(e) => setFormData((prev) => ({ ...prev, story: e.target.value }))}
                  placeholder="이 상품의 특별한 이야기나 의미를 들려주세요"
                />
              </div>
            </CardContent>
          </Card>

          {/* Product Details */}
          <Card>
            <CardHeader>
              <CardTitle>상품 세부정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">재질/소재</label>
                  <Input
                    value={formData.materials}
                    onChange={(e) => setFormData((prev) => ({ ...prev, materials: e.target.value }))}
                    placeholder="예: 원목, 도자기, 면"
                    className="border-green-200 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">크기 (cm)</label>
                  <Input
                    value={formData.dimensions}
                    onChange={(e) => setFormData((prev) => ({ ...prev, dimensions: e.target.value }))}
                    placeholder="예: 120x80x75"
                    className="border-green-200 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">무게 (kg)</label>
                  <Input
                    value={formData.weight}
                    onChange={(e) => setFormData((prev) => ({ ...prev, weight: e.target.value }))}
                    placeholder="예: 15"
                    className="border-green-200 focus:border-green-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Auction */}
          <Card>
            <CardHeader>
              <CardTitle>가격 및 경매 설정</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">시작가 (원) *</label>
                  <Input
                    type="number"
                    value={formData.startPrice}
                    onChange={(e) => setFormData((prev) => ({ ...prev, startPrice: e.target.value }))}
                    placeholder="10000"
                    required
                    className="border-green-200 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">즉시구매가 (원)</label>
                  <Input
                    type="number"
                    value={formData.instantBuyPrice}
                    onChange={(e) => setFormData((prev) => ({ ...prev, instantBuyPrice: e.target.value }))}
                    placeholder="50000 (선택사항)"
                    className="border-green-200 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">경매기간</label>
                  <Select
                    value={formData.duration}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, duration: value }))}
                  >
                    <SelectTrigger className="border-green-200 focus:border-green-500">
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

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="shipping"
                    checked={formData.shippingIncluded}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, shippingIncluded: checked as boolean }))
                    }
                  />
                  <label htmlFor="shipping" className="text-sm">
                    배송비 포함 가격
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="return"
                    checked={formData.returnPolicy}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, returnPolicy: checked as boolean }))
                    }
                  />
                  <label htmlFor="return" className="text-sm">
                    반품/교환 가능
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Validation Display */}
          <FormValidationDisplay validation={validation} className="mb-6" />

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              취소
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={!validation.isValid}>
              <Recycle className="h-4 w-4 mr-2" />
              상품 등록
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

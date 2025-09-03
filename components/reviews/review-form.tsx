"use client"

import { useState, useRef, ChangeEvent } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star, X, Image as ImageIcon, CheckCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface ReviewFormProps {
  auctionId: string
  onSubmit: (review: {
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
  }) => Promise<void>
  isSubmitting?: boolean
  className?: string
}

export function ReviewForm({ 
  auctionId, 
  onSubmit, 
  isSubmitting = false,
  className = "" 
}: ReviewFormProps) {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [rating, setRating] = useState(5)
  const [images, setImages] = useState<string[]>([])
  const [productRating, setProductRating] = useState({
    quality: 5,
    accuracy: 5,
    shipping: 5,
    seller: 5
  })
  const [isPurchased, setIsPurchased] = useState(true)
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    // Limit to 5 images
    if (files.length + images.length > 5) {
      toast({
        title: "이미지 업로드 제한",
        description: "최대 5장까지 업로드 가능합니다.",
        variant: "destructive"
      })
      return
    }

    const newImages: string[] = []
    
    // In a real app, you would upload the images to a storage service
    // and get back URLs. For now, we'll create object URLs.
    Array.from(files).forEach(file => {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "파일 크기 초과",
          description: "파일 하나당 최대 5MB까지 업로드 가능합니다.",
          variant: "destructive"
        })
        return
      }
      
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        newImages.push(result)
        
        if (newImages.length === Math.min(files.length, 5 - images.length)) {
          setImages(prev => [...prev, ...newImages])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim() || !content.trim()) {
      toast({
        title: "입력 오류",
        description: "제목과 내용을 모두 작성해주세요.",
        variant: "destructive"
      })
      return
    }

    try {
      setIsSubmittingReview(true)
      await onSubmit({
        title,
        content,
        rating,
        images,
        productRating
      })
      
      // Reset form
      setTitle("")
      setContent("")
      setRating(5)
      setImages([])
      setProductRating({
        quality: 5,
        accuracy: 5,
        shipping: 5,
        seller: 5
      })
      
      toast({
        title: "리뷰가 등록되었습니다.",
        description: "소중한 후기 감사합니다.",
      })
    } catch (error) {
      console.error("리뷰 제출 중 오류 발생:", error)
      toast({
        title: "오류 발생",
        description: "리뷰를 제출하는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        variant: "destructive"
      })
    } finally {
      setIsSubmittingReview(false)
    }
  }

  return (
    <div className={`bg-white rounded-lg p-6 ${className}`}>
      <h3 className="text-xl font-semibold mb-6">리뷰 작성하기</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Overall Rating */}
          <div>
            <label className="block text-sm font-medium mb-2">
              전체 평점 <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-600">
                {rating}점
              </span>
            </div>
          </div>

          {/* Product Ratings */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">상품 평가</h4>
            
            {[
              { id: 'quality', label: '상품 품질' },
              { id: 'accuracy', label: '상품 설명 일치도' },
              { id: 'shipping', label: '배송 만족도' },
              { id: 'seller', label: '판매자 응대' },
            ].map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 w-24">{item.label}</span>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() =>
                        setProductRating(prev => ({
                          ...prev,
                          [item.id]: star
                        }))
                      }
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-5 w-5 ${
                          star <= (productRating as any)[item.id] 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Purchase Verification */}
          <div className="flex items-center">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isPurchased}
                onChange={(e) => setIsPurchased(e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                구매확정 제품입니다.
              </span>
            </label>
            <span className="ml-2 text-xs text-gray-500 flex items-center">
              <CheckCircle className="h-3 w-3 mr-1" />
              구매확정 시 인증마크가 표시됩니다.
            </span>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              제목 <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 입력해주세요"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              maxLength={50}
              disabled={isSubmitting || isSubmittingReview}
            />
            <div className="text-right text-xs text-gray-500 mt-1">
              {title.length}/50자
            </div>
          </div>

          {/* Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium mb-2">
              리뷰 내용 <span className="text-red-500">*</span>
            </label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="자세한 후기는 다른 고객에게 큰 도움이 됩니다. (최소 10자 이상)"
              className="min-h-[120px]"
              disabled={isSubmitting || isSubmittingReview}
            />
            <div className="text-right text-xs text-gray-500 mt-1">
              {content.length}/1000자
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium">
                사진 첨부 (선택)
              </label>
              <span className="text-xs text-gray-500">
                {images.length}/5장 (최대 5MB/장)
              </span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {/* Image Preview */}
              {images.map((img, index) => (
                <div key={index} className="relative group">
                  <div className="w-20 h-20 rounded-md overflow-hidden">
                    <img
                      src={img}
                      alt={`미리보기 ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-gray-800 bg-opacity-70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    disabled={isSubmitting || isSubmittingReview}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              
              {/* Upload Button */}
              {images.length < 5 && (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={isSubmitting || isSubmittingReview}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-colors"
                    disabled={isSubmitting || isSubmittingReview}
                  >
                    <ImageIcon className="h-6 w-6 mb-1" />
                    <span className="text-xs">추가</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <Button 
              type="submit" 
              className="w-full py-3 text-base font-medium"
              disabled={isSubmitting || isSubmittingReview || !title.trim() || content.trim().length < 10}
            >
              {isSubmittingReview ? "등록 중..." : "리뷰 등록하기"}
            </Button>
            
            <p className="mt-2 text-xs text-gray-500 text-center">
              작성하신 리뷰는 수정이 불가능하니 신중하게 작성해주세요.
            </p>
          </div>
        </div>
      </form>
    </div>
  )
}

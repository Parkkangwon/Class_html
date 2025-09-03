import Image from "next/image"
import Link from "next/link"
import { Auction } from "@/types/auction"
import { formatPrice } from "@/lib/utils"
import { Badge } from "../ui/badge"
import { Clock, Heart, Eye } from "lucide-react"
import { Button } from "../ui/button"

export function AuctionCard({ auction }: { auction: Auction }) {
  const endTime = new Date(auction.end_time)
  const now = new Date()
  const timeLeft = endTime.getTime() - now.getTime()
  const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60))
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <Link href={`/auction/${auction.id}`} className="block">
        <div className="relative aspect-square">
          <Image
            src={auction.thumbnail_url}
            alt={auction.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <Badge 
            variant="secondary" 
            className="absolute top-2 left-2 bg-white/90 text-gray-800 border-gray-200"
          >
            {auction.condition_grade}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-white/90 rounded-full w-8 h-8 p-0 hover:bg-white"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              // TODO: Add to wishlist
            }}
          >
            <Heart className="h-4 w-4 text-gray-500" fill="none" />
          </Button>
        </div>
        
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium text-gray-900 line-clamp-2 h-12">
              {auction.title}
            </h3>
          </div>
          
          <div className="mb-3">
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(auction.current_price)}원
            </span>
            {auction.instant_buy_price > 0 && (
              <span className="ml-2 text-sm text-gray-500 line-through">
                즉시 구매가 {formatPrice(auction.instant_buy_price)}원
              </span>
            )}
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>{hoursLeft > 0 ? `${hoursLeft}시간 남음` : '마감 임박'}</span>
            </div>
            <div className="flex items-center">
              <Eye className="h-4 w-4 mr-1" />
              <span>{auction.view_count}</span>
            </div>
          </div>
          
          {auction.bid_count > 0 && (
            <div className="mt-2 text-xs text-gray-500">
              입찰 {auction.bid_count}회
            </div>
          )}
        </div>
      </Link>
      
      <div className="px-4 pb-4">
        <Button className="w-full" size="sm">
          입찰하기
        </Button>
      </div>
    </div>
  )
}

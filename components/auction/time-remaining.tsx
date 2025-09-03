"use client"

import { Clock } from "lucide-react"
import { useEffect, useState } from "react"

interface TimeRemainingProps {
  endTime: Date
}

export function TimeRemaining({ endTime }: TimeRemainingProps) {
  const [timeLeft, setTimeLeft] = useState<string>("로딩 중...")

  useEffect(() => {
    // 클라이언트에서만 시간 계산을 수행
    const calculateTimeLeft = () => {
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

    // 초기 설정
    setTimeLeft(calculateTimeLeft())
    
    // 1분마다 업데이트
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 60000)

    return () => clearInterval(timer)
  }, [endTime])

  return (
    <div className="inline-flex items-center">
      <Clock className="h-3 w-3 inline mr-1" />
      <span>{timeLeft}</span>
    </div>
  )
}

export default TimeRemaining

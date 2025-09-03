"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Leaf, Recycle, Droplets, Zap, TreePine, Award, Target, TrendingUp } from "lucide-react"

interface SustainabilityMetrics {
  carbonSaved: number
  waterSaved: number
  energySaved: number
  wasteReduced: number
  treesEquivalent: number
  monthlyGoal: number
  currentProgress: number
  streak: number
  level: number
  nextLevelPoints: number
  currentPoints: number
}

export function SustainabilityDashboard() {
  const [metrics, setMetrics] = useState<SustainabilityMetrics>({
    carbonSaved: 127.5,
    waterSaved: 2847,
    energySaved: 89.3,
    wasteReduced: 45.2,
    treesEquivalent: 8.5,
    monthlyGoal: 200,
    currentProgress: 127.5,
    streak: 12,
    level: 7,
    nextLevelPoints: 1000,
    currentPoints: 750,
  })

  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) => ({
        ...prev,
        carbonSaved: prev.carbonSaved + Math.random() * 2,
        waterSaved: prev.waterSaved + Math.floor(Math.random() * 10),
        energySaved: prev.energySaved + Math.random() * 1,
        wasteReduced: prev.wasteReduced + Math.random() * 0.5,
        currentProgress: Math.min(prev.currentProgress + Math.random() * 2, prev.monthlyGoal),
      }))
      setIsAnimating(true)
      setTimeout(() => setIsAnimating(false), 1000)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const progressPercentage = (metrics.currentProgress / metrics.monthlyGoal) * 100
  const levelProgress = (metrics.currentPoints / metrics.nextLevelPoints) * 100

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-serif font-black text-green-700 mb-2">나의 지속가능성 대시보드</h2>
        <p className="text-gray-600">당신의 환경 기여도를 실시간으로 확인하세요</p>
      </div>

      {/* Level and Progress */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-green-600" />
            에코 레벨 {metrics.level}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>다음 레벨까지</span>
                <span>
                  {metrics.currentPoints}/{metrics.nextLevelPoints} 포인트
                </span>
              </div>
              <Progress value={levelProgress} className="h-3" />
            </div>
            <div className="flex items-center gap-4">
              <Badge className="bg-green-500 text-white">
                <Leaf className="h-3 w-3 mr-1" />
                {metrics.streak}일 연속 참여
              </Badge>
              <Badge variant="outline">
                <TrendingUp className="h-3 w-3 mr-1" />
                이번 달 목표 {Math.round(progressPercentage)}% 달성
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Environmental Impact Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className={`transition-all duration-500 ${isAnimating ? "scale-105 shadow-lg" : ""}`}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-green-600">
              <Leaf className="h-5 w-5" />
              탄소 절약
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700 mb-1">{metrics.carbonSaved.toFixed(1)} kg</div>
            <p className="text-sm text-gray-600">CO₂ 배출량 감소</p>
            <div className="mt-2 text-xs text-green-600">
              🌱 나무 {metrics.treesEquivalent.toFixed(1)}그루 심기 효과
            </div>
          </CardContent>
        </Card>

        <Card className={`transition-all duration-500 ${isAnimating ? "scale-105 shadow-lg" : ""}`}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-blue-600">
              <Droplets className="h-5 w-5" />물 절약
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700 mb-1">{metrics.waterSaved.toLocaleString()} L</div>
            <p className="text-sm text-gray-600">생산 과정 물 사용량 절약</p>
            <div className="mt-2 text-xs text-blue-600">
              💧 가정용 물 사용량 {Math.floor(metrics.waterSaved / 200)}일분
            </div>
          </CardContent>
        </Card>

        <Card className={`transition-all duration-500 ${isAnimating ? "scale-105 shadow-lg" : ""}`}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-yellow-600">
              <Zap className="h-5 w-5" />
              에너지 절약
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-700 mb-1">{metrics.energySaved.toFixed(1)} kWh</div>
            <p className="text-sm text-gray-600">제조 과정 에너지 절약</p>
            <div className="mt-2 text-xs text-yellow-600">
              ⚡ 가정용 전력 {Math.floor(metrics.energySaved / 10)}일분
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Goal Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-green-600" />
            이번 달 목표 달성률
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>탄소 절약 목표</span>
                <span>
                  {metrics.currentProgress.toFixed(1)} / {metrics.monthlyGoal} kg
                </span>
              </div>
              <Progress value={progressPercentage} className="h-4" />
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-lg font-bold text-green-700">{Math.round(progressPercentage)}%</div>
                <div className="text-sm text-gray-600">목표 달성률</div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-lg font-bold text-blue-700">
                  {Math.max(0, Math.round(metrics.monthlyGoal - metrics.currentProgress))} kg
                </div>
                <div className="text-sm text-gray-600">목표까지 남은 양</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <Button className="bg-green-600 hover:bg-green-700">
          <Recycle className="h-4 w-4 mr-2" />더 많은 상품 둘러보기
        </Button>
        <Button variant="outline">
          <TreePine className="h-4 w-4 mr-2" />
          친구에게 공유하기
        </Button>
      </div>
    </div>
  )
}

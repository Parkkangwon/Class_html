"use client"

import { useState, useEffect } from "react"
import { Leaf, Award, Trophy, Zap, CheckCircle, Lock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface Achievement {
  id: string
  title: string
  description: string
  icon: JSX.Element
  progress: number
  target: number
  status: 'completed' | 'in-progress' | 'locked'
}

export default function AchievementsPage() {
  const [achievements] = useState<Achievement[]>([
    {
      id: 'eco-warrior',
      title: '에코 워리어',
      description: '친환경 제품 10개 구매 달성',
      icon: <Leaf className="h-6 w-6 text-green-500" />,
      progress: 7,
      target: 10,
      status: 'in-progress'
    },
    {
      id: 'recycling-champion',
      title: '재활용 챔피언',
      description: '재활용 가능한 제품 20회 구매',
      icon: <CheckCircle className="h-6 w-6 text-blue-500" />,
      progress: 15,
      target: 20,
      status: 'in-progress'
    },
    {
      id: 'carbon-neutral',
      title: '탄소 중립 기여자',
      description: '탄소 배출량 100kg 절감 달성',
      icon: <Zap className="h-6 w-6 text-yellow-500" />,
      progress: 45,
      target: 100,
      status: 'in-progress'
    },
    {
      id: 'first-purchase',
      title: '첫 걸음',
      description: '첫 친환경 제품 구매',
      icon: <Award className="h-6 w-6 text-purple-500" />,
      progress: 1,
      target: 1,
      status: 'completed'
    }
  ])

  const completedCount = achievements.filter(a => a.status === 'completed').length
  const inProgressCount = achievements.filter(a => a.status === 'in-progress').length

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Trophy className="h-10 w-10 text-amber-500" />
          <h1 className="text-3xl font-bold text-gray-900">환경 보호 업적</h1>
        </div>
        <p className="text-lg text-gray-600">지속가능한 소비를 통해 업적을 달성해보세요!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-green-50 to-blue-50">
          <CardHeader>
            <CardTitle className="text-4xl font-bold text-green-600">
              {achievements.length}
            </CardTitle>
            <CardDescription>전체 업적</CardDescription>
          </CardHeader>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle className="text-4xl font-bold text-blue-600">
              {completedCount}
            </CardTitle>
            <CardDescription>달성한 업적</CardDescription>
          </CardHeader>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
          <CardHeader>
            <CardTitle className="text-4xl font-bold text-purple-600">
              {inProgressCount}
            </CardTitle>
            <CardDescription>진행 중인 업적</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map((achievement) => (
          <Card key={achievement.id} className="relative overflow-hidden">
            {achievement.status === 'completed' && (
              <div className="absolute top-2 right-2">
                <Badge className="bg-green-500">달성 완료</Badge>
              </div>
            )}
            {achievement.status === 'locked' && (
              <div className="absolute inset-0 bg-black/5 backdrop-blur-sm flex items-center justify-center">
                <Lock className="h-8 w-8 text-gray-400" />
              </div>
            )}
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-green-100">
                  {achievement.icon}
                </div>
                <div>
                  <CardTitle>{achievement.title}</CardTitle>
                  <CardDescription>{achievement.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>진행률</span>
                  <span className="font-medium">
                    {achievement.progress} / {achievement.target}
                  </span>
                </div>
                <Progress 
                  value={(achievement.progress / achievement.target) * 100} 
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

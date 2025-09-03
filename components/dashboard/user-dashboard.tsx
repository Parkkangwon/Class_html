"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Gavel, Heart, Package, CheckCircle, Leaf, Recycle, Droplets, Zap, Trash2 } from "lucide-react"
import { getSustainabilityData, getImpactComparison } from "@/services/sustainability.service"
import { useRouter } from 'next/navigation'
import { useAuth } from "@/contexts/auth-context"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts"

interface DashboardStats {
  activeBids: number
  watchlistItems: number
  completedOrders: number
  sustainabilityScore: number
  totalCO2Saved: number
  totalWaterSaved: number
  totalWastePrevented: number
  totalEnergySaved: number
  itemsRecycled: number
  monthlyImpact: Array<{
    month: string
    co2Saved: number
    waterSaved: number
    wastePrevented: number
    energySaved: number
  }>
}

interface RecentActivity {
  id: string
  type: "bid" | "win" | "watch" | "order"
  title: string
  description: string
  timestamp: Date
  status: "active" | "completed" | "pending"
  amount?: number
}

export function UserDashboard() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return null
  }

  const [stats, setStats] = useState<DashboardStats>({
    activeBids: 3,
    watchlistItems: 8,
    completedOrders: 12,
    sustainabilityScore: 0,
    totalCO2Saved: 0,
    totalWaterSaved: 0,
    totalWastePrevented: 0,
    totalEnergySaved: 0,
    itemsRecycled: 0,
    monthlyImpact: []
  })
  const [loading, setLoading] = useState(true)
  const [comparison, setComparison] = useState<ReturnType<typeof getImpactComparison>>()

  useEffect(() => {
    if (user) {
      // Simulate API call
      setTimeout(() => {
        const sustainabilityData = getSustainabilityData(user.id)
        setStats(prev => ({
          ...prev,
          ...sustainabilityData
        }))
        setComparison(getImpactComparison())
        setLoading(false)
      }, 800)
    }
  }, [user])

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([
    {
      id: "1",
      type: "bid",
      title: "빈티지 원목 식탁",
      description: "45,000원으로 입찰 참여 중",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      status: "active",
      amount: 45000,
    },
    {
      id: "2",
      type: "win",
      title: "수제 도자기 화분",
      description: "낙찰 완료 - 결제 대기 중",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: "pending",
      amount: 28000,
    },
    {
      id: "3",
      type: "watch",
      title: "친환경 대나무 텀블러",
      description: "관심 목록에 추가됨",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      status: "active",
    },
  ])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR").format(price) + "원"
  }

  const renderImpactCard = (title: string, value: number, unit: string, icon: React.ReactNode, bgColor: string) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`p-2 rounded-full ${bgColor}`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {value.toLocaleString('ko-KR')} <span className="text-sm font-normal text-muted-foreground">{unit}</span>
        </div>
        {comparison && (
          <p className="text-xs text-muted-foreground mt-1">
            {value > 0 ? '이번 달 ' : ''}{value > 0 ? '전월 대비 ' : ''}
            {value > 0 ? '증가' : '감소'} 중
          </p>
        )}
      </CardContent>
    </Card>
  )

  const getActivityIcon = (type: RecentActivity["type"]) => {
    switch (type) {
      case "bid":
        return <Gavel className="h-4 w-4 text-purple-500" />
      case "win":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "watch":
        return <Heart className="h-4 w-4 text-red-500" />
      case "order":
        return <Package className="h-4 w-4 text-blue-500" />
    }
  }

  const getStatusBadge = (status: RecentActivity["status"]) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="outline" className="text-green-600 border-green-600">
            진행중
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="text-blue-600 border-blue-600">
            완료
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="outline" className="text-orange-600 border-orange-600">
            대기중
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="text-gray-600 border-gray-600">
            알 수 없음
          </Badge>
        )
    }
  }

  const getSustainabilityMessage = (score: number) => {
    if (score >= 90) return '환경을 위한 훌륭한 노력이에요! 계속 이렇게 지속해 주세요.';
    if (score >= 70) return '좋은 성과를 내고 계세요! 조금만 더 노력하면 최고에요.';
    if (score >= 50) return '괜찮은 시작이에요. 지속 가능한 생활을 위해 조금 더 노력해 보세요.';
    if (score >= 30) return '개선의 여지가 있어요. 작은 것부터 시작해 보는 건 어떨까요?';
    return '지속 가능한 생활을 위해 노력이 필요해 보여요. 함께 시작해 볼까요?';
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {renderImpactCard(
          '탄소 배출 감소', 
          stats.totalCO2Saved, 
          'kg', 
          <Leaf className="h-4 w-4 text-white" />,
          'bg-green-500'
        )}
        {renderImpactCard(
          '물 사용 절약', 
          stats.totalWaterSaved, 
          'L', 
          <Droplets className="h-4 w-4 text-white" />,
          'bg-blue-500'
        )}
        {renderImpactCard(
          '에너지 절약', 
          stats.totalEnergySaved, 
          'kWh', 
          <Zap className="h-4 w-4 text-white" />,
          'bg-yellow-500'
        )}
        {renderImpactCard(
          '폐기물 감소', 
          stats.totalWastePrevented, 
          'kg', 
          <Trash2 className="h-4 w-4 text-white" />,
          'bg-gray-500'
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">월별 탄소 배출 감소량</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.monthlyImpact}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} kg`, '탄소 배출 감소량']} />
                <Legend />
                <Line type="monotone" dataKey="co2Saved" name="CO2 감소량" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">자원 절약 현황</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: '물 사용 절약', value: stats.totalWaterSaved },
                { name: '에너지 절약', value: stats.totalEnergySaved },
                { name: '폐기물 감소', value: stats.totalWastePrevented }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3B82F6" name="절약량" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">지속가능성 점수</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8">
            <div className="relative w-48 h-48 mb-4">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-4xl font-bold">{stats.sustainabilityScore}</div>
              </div>
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                  className="text-gray-200"
                  strokeWidth="10"
                  stroke="currentColor"
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                />
                <circle
                  className="text-green-500"
                  strokeWidth="10"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                  strokeDasharray={`${(stats.sustainabilityScore / 100) * 251.2} 251.2`}
                  transform="rotate(-90 50 50)"
                />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground">
                {stats.sustainabilityScore >= 80 ? '🎉 ' : ''}
                {getSustainabilityMessage(stats.sustainabilityScore)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>최근 활동</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  {getActivityIcon(activity.type)}
                  <div>
                    <p className="font-medium">{activity.title}</p>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                    <p className="text-xs text-gray-400">{activity.timestamp.toLocaleString("ko-KR")}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {activity.amount && (
                    <span className="font-medium text-purple-600">{formatPrice(activity.amount)}</span>
                  )}
                  {getStatusBadge(activity.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { BarChart3, Users, Gavel, Package, CreditCard, Truck, MessageSquare, Settings, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AdminSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const menuItems = [
  { id: "overview", label: "대시보드", icon: BarChart3 },
  { id: "auctions", label: "경매 관리", icon: Gavel },
  { id: "users", label: "사용자 관리", icon: Users },
  { id: "products", label: "상품 관리", icon: Package },
  { id: "settlements", label: "정산 관리", icon: CreditCard },
  { id: "delivery", label: "배송 관리", icon: Truck },
  { id: "support", label: "고객 지원", icon: MessageSquare },
  { id: "settings", label: "시스템 설정", icon: Settings },
]

export function AdminSidebar({ activeTab, onTabChange }: AdminSidebarProps) {
  return (
    <div className="w-64 bg-white shadow-sm border-r min-h-screen">
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-8">
          <Shield className="h-8 w-8 text-green-600" />
          <div>
            <h1 className="text-xl font-serif font-bold text-gray-800">관리자</h1>
            <p className="text-sm text-gray-600">자원순환경매</p>
          </div>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => onTabChange(item.id)}
              >
                <Icon className="h-4 w-4 mr-3" />
                {item.label}
              </Button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, Truck, CheckCircle, AlertTriangle } from "lucide-react"

interface Order {
  id: string
  itemTitle: string
  itemImage: string
  winningBid: number
  totalAmount: number
  status: "payment_pending" | "paid" | "preparing" | "shipped" | "delivered" | "cancelled"
  orderDate: Date
  deliveryDate?: Date
  trackingNumber?: string
}

export default function OrdersPage() {
  const [orders] = useState<Order[]>([
    {
      id: "ORDER_1703123456789",
      itemTitle: "로렉스 서브마리너 116610LN",
      itemImage: "/luxury-diver-watch.png",
      winningBid: 12500000,
      totalAmount: 13780000,
      status: "delivered",
      orderDate: new Date("2024-01-15"),
      deliveryDate: new Date("2024-01-18"),
      trackingNumber: "1234567890123",
    },
    {
      id: "ORDER_1703123456790",
      itemTitle: "샤넬 클래식 플랩백 미디움",
      itemImage: "/classic-flap-bag.png",
      winningBid: 3200000,
      totalAmount: 3550000,
      status: "shipped",
      orderDate: new Date("2024-01-20"),
      trackingNumber: "9876543210987",
    },
    {
      id: "ORDER_1703123456791",
      itemTitle: "에르메스 버킨백 35cm",
      itemImage: "/luxury-handbag.png",
      winningBid: 8900000,
      totalAmount: 9820000,
      status: "payment_pending",
      orderDate: new Date("2024-01-22"),
    },
  ])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR").format(price) + "원"
  }

  const getStatusInfo = (status: Order["status"]) => {
    switch (status) {
      case "payment_pending":
        return { label: "결제 대기", color: "bg-red-500", icon: AlertTriangle }
      case "paid":
        return { label: "결제 완료", color: "bg-blue-500", icon: CheckCircle }
      case "preparing":
        return { label: "배송 준비", color: "bg-yellow-500", icon: Package }
      case "shipped":
        return { label: "배송 중", color: "bg-purple-500", icon: Truck }
      case "delivered":
        return { label: "배송 완료", color: "bg-green-500", icon: CheckCircle }
      case "cancelled":
        return { label: "주문 취소", color: "bg-gray-500", icon: AlertTriangle }
    }
  }

  const filterOrdersByStatus = (status?: Order["status"]) => {
    if (!status) return orders
    return orders.filter((order) => order.status === status)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">주문 내역</h1>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">전체</TabsTrigger>
          <TabsTrigger value="payment_pending">결제대기</TabsTrigger>
          <TabsTrigger value="paid">결제완료</TabsTrigger>
          <TabsTrigger value="preparing">배송준비</TabsTrigger>
          <TabsTrigger value="shipped">배송중</TabsTrigger>
          <TabsTrigger value="delivered">배송완료</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <OrderList orders={orders} />
        </TabsContent>
        <TabsContent value="payment_pending">
          <OrderList orders={filterOrdersByStatus("payment_pending")} />
        </TabsContent>
        <TabsContent value="paid">
          <OrderList orders={filterOrdersByStatus("paid")} />
        </TabsContent>
        <TabsContent value="preparing">
          <OrderList orders={filterOrdersByStatus("preparing")} />
        </TabsContent>
        <TabsContent value="shipped">
          <OrderList orders={filterOrdersByStatus("shipped")} />
        </TabsContent>
        <TabsContent value="delivered">
          <OrderList orders={filterOrdersByStatus("delivered")} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function OrderList({ orders }: { orders: Order[] }) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR").format(price) + "원"
  }

  const getStatusInfo = (status: Order["status"]) => {
    switch (status) {
      case "payment_pending":
        return { label: "결제 대기", color: "bg-red-500", icon: AlertTriangle }
      case "paid":
        return { label: "결제 완료", color: "bg-blue-500", icon: CheckCircle }
      case "preparing":
        return { label: "배송 준비", color: "bg-yellow-500", icon: Package }
      case "shipped":
        return { label: "배송 중", color: "bg-purple-500", icon: Truck }
      case "delivered":
        return { label: "배송 완료", color: "bg-green-500", icon: CheckCircle }
      case "cancelled":
        return { label: "주문 취소", color: "bg-gray-500", icon: AlertTriangle }
    }
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">주문 내역이 없습니다</h3>
          <p className="text-gray-500">경매에 참여하여 상품을 낙찰받아보세요.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const statusInfo = getStatusInfo(order.status)
        const StatusIcon = statusInfo.icon

        return (
          <Card key={order.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">주문번호: {order.id}</span>
                  <Badge className={`${statusInfo.color} text-white`}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {statusInfo.label}
                  </Badge>
                </div>
                <span className="text-sm text-gray-500">{order.orderDate.toLocaleDateString("ko-KR")}</span>
              </div>

              <div className="flex items-center space-x-4">
                <img
                  src={order.itemImage || "/placeholder.svg"}
                  alt={order.itemTitle}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800 mb-1">{order.itemTitle}</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>낙찰가: {formatPrice(order.winningBid)}</p>
                    <p className="font-medium">총 결제금액: {formatPrice(order.totalAmount)}</p>
                  </div>
                </div>
                <div className="text-right space-y-2">
                  {order.status === "payment_pending" && (
                    <Button size="sm" className="bg-red-600 hover:bg-red-700">
                      결제하기
                    </Button>
                  )}
                  {order.trackingNumber && (
                    <div className="text-sm text-gray-600">
                      <p>운송장: {order.trackingNumber}</p>
                      <Button variant="outline" size="sm">
                        배송조회
                      </Button>
                    </div>
                  )}
                  {order.status === "delivered" && (
                    <Button variant="outline" size="sm">
                      리뷰 작성
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

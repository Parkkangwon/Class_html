"use client"

import { Truck, Package, CheckCircle, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"

// Mock delivery data
const mockDeliveries = [
  {
    id: "D001",
    orderId: "O001",
    auctionTitle: "루이비통 네버풀 MM",
    recipientName: "김경매",
    recipientPhone: "010-1234-5678",
    address: "서울시 강남구 테헤란로 123",
    deliveryMethod: "택배",
    trackingNumber: "1234567890",
    status: "shipped",
    shippedDate: new Date("2024-01-16"),
  },
  {
    id: "D002",
    orderId: "O002",
    auctionTitle: "롤렉스 서브마리너",
    recipientName: "이입찰",
    recipientPhone: "010-2345-6789",
    address: "부산시 해운대구 센텀로 456",
    deliveryMethod: "직접배송",
    trackingNumber: "2345678901",
    status: "delivered",
    shippedDate: new Date("2024-01-15"),
  },
  {
    id: "D003",
    orderId: "O003",
    auctionTitle: "아이폰 15 Pro Max",
    recipientName: "박수집",
    recipientPhone: "010-3456-7890",
    address: "대구시 중구 동성로 789",
    deliveryMethod: "택배",
    trackingNumber: "",
    status: "preparing",
    shippedDate: null,
  },
]

function getStatusBadge(status: string) {
  switch (status) {
    case "preparing":
      return <Badge className="bg-yellow-500">배송준비중</Badge>
    case "shipped":
      return <Badge className="bg-blue-500">배송중</Badge>
    case "delivered":
      return <Badge className="bg-green-500">배송완료</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export function DeliveryManagement() {
  const preparingCount = mockDeliveries.filter((d) => d.status === "preparing").length
  const shippedCount = mockDeliveries.filter((d) => d.status === "shipped").length
  const deliveredCount = mockDeliveries.filter((d) => d.status === "delivered").length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">배송 관리</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{preparingCount}</p>
                <p className="text-sm text-gray-600">배송준비중</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Truck className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{shippedCount}</p>
                <p className="text-sm text-gray-600">배송중</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{deliveredCount}</p>
                <p className="text-sm text-gray-600">배송완료</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{mockDeliveries.length}</p>
                <p className="text-sm text-gray-600">총 배송</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deliveries Table */}
      <Card>
        <CardHeader>
          <CardTitle>배송 현황</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>배송 ID</TableHead>
                <TableHead>주문 정보</TableHead>
                <TableHead>수령인</TableHead>
                <TableHead>배송지</TableHead>
                <TableHead>배송방법</TableHead>
                <TableHead>운송장번호</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>발송일</TableHead>
                <TableHead>작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockDeliveries.map((delivery) => (
                <TableRow key={delivery.id}>
                  <TableCell className="font-medium">{delivery.id}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{delivery.auctionTitle}</p>
                      <p className="text-sm text-gray-500">{delivery.orderId}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{delivery.recipientName}</p>
                      <p className="text-sm text-gray-500">{delivery.recipientPhone}</p>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{delivery.address}</TableCell>
                  <TableCell>{delivery.deliveryMethod}</TableCell>
                  <TableCell>{delivery.trackingNumber || "-"}</TableCell>
                  <TableCell>{getStatusBadge(delivery.status)}</TableCell>
                  <TableCell>{delivery.shippedDate ? delivery.shippedDate.toLocaleDateString("ko-KR") : "-"}</TableCell>
                  <TableCell>
                    {delivery.status === "preparing" && <Button size="sm">발송처리</Button>}
                    {delivery.status === "shipped" && (
                      <Button size="sm" variant="outline">
                        추적
                      </Button>
                    )}
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

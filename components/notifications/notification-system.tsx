"use client"

import { useState, useEffect } from "react"
import { Bell, Clock, Gavel, CreditCard, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface Notification {
  id: string
  type: "bid_outbid" | "auction_ending" | "payment_due" | "delivery_update" | "auction_won"
  title: string
  message: string
  timestamp: Date
  isRead: boolean
  actionUrl?: string
}

export function NotificationSystem() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "bid_outbid",
      title: "입찰가 초과됨",
      message: "빈티지 원목 식탁 경매에서 다른 입찰자가 더 높은 가격을 제시했습니다.",
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      isRead: false,
      actionUrl: "/auction/1",
    },
    {
      id: "2",
      type: "auction_ending",
      title: "경매 마감 임박",
      message: "관심 경매 '친환경 대나무 텀블러 세트'가 30분 후 마감됩니다.",
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      isRead: false,
      actionUrl: "/auction/2",
    },
    {
      id: "3",
      type: "auction_won",
      title: "경매 낙찰!",
      message: "수제 도자기 화분 경매에서 낙찰되었습니다. 결제를 진행해주세요.",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isRead: true,
      actionUrl: "/orders",
    },
  ])
  const [showDialog, setShowDialog] = useState(false)

  const unreadCount = notifications.filter((n) => !n.isRead).length

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const newNotification: Notification = {
          id: Date.now().toString(),
          type: "bid_outbid",
          title: "새로운 입찰",
          message: "관심 경매에 새로운 입찰이 있습니다.",
          timestamp: new Date(),
          isRead: false,
          actionUrl: "/auction/1",
        }
        setNotifications((prev) => [newNotification, ...prev.slice(0, 9)])
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "bid_outbid":
        return <Gavel className="h-4 w-4 text-orange-500" />
      case "auction_ending":
        return <Clock className="h-4 w-4 text-red-500" />
      case "payment_due":
        return <CreditCard className="h-4 w-4 text-blue-500" />
      case "delivery_update":
        return <Truck className="h-4 w-4 text-green-500" />
      case "auction_won":
        return <Gavel className="h-4 w-4 text-purple-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days > 0) return `${days}일 전`
    if (hours > 0) return `${hours}시간 전`
    if (minutes > 0) return `${minutes}분 전`
    return "방금 전"
  }

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>알림</DialogTitle>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                모두 읽음
              </Button>
            )}
          </div>
        </DialogHeader>
        <div className="max-h-96 overflow-y-auto space-y-2">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>새로운 알림이 없습니다</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`cursor-pointer transition-all hover:bg-gray-50 ${
                  !notification.isRead ? "border-green-200 bg-green-50" : ""
                }`}
                onClick={() => {
                  markAsRead(notification.id)
                  if (notification.actionUrl) {
                    window.location.href = notification.actionUrl
                  }
                }}
              >
                <CardContent className="p-3">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">{notification.title}</p>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 ml-2" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{formatTimeAgo(notification.timestamp)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

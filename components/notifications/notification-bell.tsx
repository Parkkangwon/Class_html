'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, X, AlertCircle, Gavel, Zap, MessageSquare, CreditCard, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useToast } from '@/components/ui/use-toast';
import { markAsRead, markAllAsRead, fetchNotifications, NotificationData } from '@/lib/notifications';

export function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  // Initial data fetch
  useEffect(() => {
    loadNotifications();
    
    // Set up WebSocket connection for real-time updates
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001');
    
    ws.onopen = () => {
      console.log('Connected to WebSocket for notifications');
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'NEW_NOTIFICATION') {
        setNotifications(prev => [data.notification, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Show toast for important notifications
        if (['BID_RECEIVED', 'OUTBID', 'AUCTION_WON'].includes(data.notification.type)) {
          toast({
            title: data.notification.title,
            description: data.notification.message,
            action: data.notification.link ? (
              <a href={data.notification.link}>
                <Button variant="outline" size="sm">보기</Button>
              </a>
            ) : undefined,
          });
        }
      }
    };
    
    return () => {
      ws.close();
    };
  }, [toast]);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const data = await fetchNotifications();
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      toast({
        variant: 'destructive',
        title: '알림을 불러오는 중 오류가 발생했습니다.',
        description: '나중에 다시 시도해주세요.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true, readAt: new Date() } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true, readAt: new Date() }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'BID_RECEIVED':
        return <Gavel className="h-4 w-4 text-blue-500" />;
      case 'AUCTION_WON':
        return <Zap className="h-4 w-4 text-green-500" />;
      case 'OUTBID':
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case 'PAYMENT_RECEIVED':
        return <CreditCard className="h-4 w-4 text-purple-500" />;
      case 'AUCTION_ENDING_SOON':
        return <Clock className="h-4 w-4 text-red-500" />;
      case 'NEW_MESSAGE':
        return <MessageSquare className="h-4 w-4 text-indigo-500" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <DropdownMenu onOpenChange={(open) => {
      setIsOpen(open);
      if (open && unreadCount > 0) {
        handleMarkAllAsRead();
      }
    }}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 p-0" align="end" forceMount>
        <div className="flex items-center justify-between p-4">
          <h3 className="font-semibold">알림</h3>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                handleMarkAllAsRead();
              }}
              disabled={unreadCount === 0}
            >
              모두 읽음으로 표시
            </Button>
          </div>
        </div>
        
        <Separator />
        
        <ScrollArea className="h-[400px] w-full">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              새로운 알림이 없습니다.
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={`p-4 hover:bg-accent/50 ${!notification.read ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 pt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{notification.title}</p>
                        <div className="flex items-center">
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(notification.createdAt), { 
                              addSuffix: true,
                              locale: ko
                            })}
                          </span>
                          {!notification.read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(notification.id);
                              }}
                              className="ml-2 text-muted-foreground hover:text-foreground"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {notification.message}
                      </p>
                      {notification.link && (
                        <a 
                          href={notification.link}
                          className="mt-2 inline-block text-sm text-blue-600 hover:underline"
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          자세히 보기 →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        {notifications.length > 0 && (
          <>
            <Separator />
            <div className="p-2 text-center">
              <a 
                href="/notifications" 
                className="text-sm font-medium text-primary hover:underline"
                onClick={() => setIsOpen(false)}
              >
                모든 알림 보기
              </a>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

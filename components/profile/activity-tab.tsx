import { Gavel, Hammer, Clock, CheckCircle, XCircle, Clock4, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

const activityTypes = {
  BID: { label: '입찰', icon: Gavel, color: 'bg-blue-100 text-blue-600' },
  WIN: { label: '낙찰', icon: CheckCircle, color: 'bg-green-100 text-green-600' },
  OUTBID: { label: '입찰 상실', icon: XCircle, color: 'bg-red-100 text-red-600' },
  WATCH: { label: '관심 상품', icon: Clock, color: 'bg-yellow-100 text-yellow-600' },
};

const mockActivities = [
  {
    id: 1,
    type: 'BID',
    title: '애플 맥북 프로 16인치',
    amount: 2500000,
    time: new Date('2023-06-15T14:32:00'),
    status: 'active',
    image: '/macbook-pro-16.jpg',
  },
  {
    id: 2,
    type: 'WIN',
    title: '소니 WH-1000XM5 헤드폰',
    amount: 320000,
    time: new Date('2023-06-14T11:20:00'),
    status: 'completed',
    image: '/sony-wh1000xm5.jpg',
  },
  {
    id: 3,
    type: 'OUTBID',
    title: '나이키 에어포스 1',
    amount: 120000,
    time: new Date('2023-06-13T16:45:00'),
    status: 'outbid',
    image: '/nike-air-force.jpg',
  },
  {
    id: 4,
    type: 'WATCH',
    title: '스타벅스 기프트카드 5만원',
    amount: 45000,
    time: new Date('2023-06-12T09:15:00'),
    status: 'watching',
    image: '/starbucks-giftcard.jpg',
  },
];

const mockBids = [
  {
    id: 1,
    item: '애플 맥북 프로 16인치',
    amount: 2500000,
    time: new Date('2023-06-15T14:32:00'),
    status: '최고 입찰가',
    image: '/macbook-pro-16.jpg',
  },
  {
    id: 2,
    item: '소니 WH-1000XM5 헤드폰',
    amount: 320000,
    time: new Date('2023-06-14T11:20:00'),
    status: '낙찰 완료',
    image: '/sony-wh1000xm5.jpg',
  },
  {
    id: 3,
    item: '나이키 에어포스 1',
    amount: 120000,
    time: new Date('2023-06-13T16:45:00'),
    status: '입찰 실패',
    image: '/nike-air-force.jpg',
  },
];

export function ActivityTab() {
  return (
    <Tabs defaultValue="all" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 max-w-md">
        <TabsTrigger value="all">전체 활동</TabsTrigger>
        <TabsTrigger value="bids">내 입찰</TabsTrigger>
        <TabsTrigger value="wins">낙찰 내역</TabsTrigger>
        <TabsTrigger value="watchlist">관심 목록</TabsTrigger>
      </TabsList>
      
      <TabsContent value="all" className="space-y-4">
        <h3 className="text-lg font-medium">최근 활동</h3>
        <div className="space-y-4">
          {mockActivities.map((activity) => {
            const ActivityIcon = activityTypes[activity.type as keyof typeof activityTypes]?.icon || Gavel;
            const activityType = activityTypes[activity.type as keyof typeof activityTypes] || { label: '활동', color: 'bg-gray-100 text-gray-600' };
            
            return (
              <Card key={activity.id} className="overflow-hidden
                hover:shadow-md transition-shadow duration-200">
                <div className="flex">
                  <div className="w-24 h-24 bg-gray-100 flex-shrink-0 overflow-hidden">
                    <img 
                      src={activity.image} 
                      alt={activity.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4 flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <div className={`p-1.5 rounded-full ${activityType.color}`}>
                            <ActivityIcon className="h-4 w-4" />
                          </div>
                          <h4 className="font-medium">{activity.title}</h4>
                        </div>
                        <div className="mt-2 flex items-center space-x-3 text-sm text-muted-foreground">
                          <span>{activity.amount.toLocaleString()}원</span>
                          <span>•</span>
                          <span>{formatDistanceToNow(activity.time, { addSuffix: true, locale: ko })}</span>
                        </div>
                      </div>
                      <Badge 
                        variant={activity.status === 'active' ? 'default' : 'secondary'}
                        className="ml-2 whitespace-nowrap"
                      >
                        {activityType.label}
                      </Badge>
                    </div>
                    <div className="mt-3 flex justify-end">
                      <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                        상세 보기
                        <ArrowUpRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
          
          {mockActivities.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <Clock4 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">활동 내역이 없습니다</h3>
              <p className="mt-1 text-sm text-gray-500">경매에 참여하시면 여기에 표시됩니다.</p>
              <div className="mt-6">
                <Button>경매 상품 보러가기</Button>
              </div>
            </div>
          )}
        </div>
      </TabsContent>
      
      <TabsContent value="bids" className="space-y-4">
        <h3 className="text-lg font-medium">내 입찰 내역</h3>
        <div className="space-y-4">
          {mockBids.map((bid) => (
            <Card key={bid.id} className="overflow-hidden">
              <div className="flex">
                <div className="w-20 h-20 bg-gray-100 flex-shrink-0">
                  <img 
                    src={bid.image} 
                    alt={bid.item}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{bid.item}</h4>
                      <div className="mt-1 text-sm text-muted-foreground">
                        <span>{bid.amount.toLocaleString()}원</span>
                        <span className="mx-2">•</span>
                        <span>{formatDistanceToNow(bid.time, { addSuffix: true, locale: ko })}</span>
                      </div>
                    </div>
                    <Badge 
                      variant={
                        bid.status === '최고 입찰가' ? 'default' : 
                        bid.status === '낙찰 완료' ? 'success' : 'secondary'
                      }
                    >
                      {bid.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          ))}
          
          {mockBids.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <Gavel className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">입찰 내역이 없습니다</h3>
              <p className="mt-1 text-sm text-gray-500">경매에 입찰하시면 여기에 표시됩니다.</p>
            </div>
          )}
        </div>
      </TabsContent>
      
      <TabsContent value="wins">
        <h3 className="text-lg font-medium mb-4">낙찰 내역</h3>
        <div className="space-y-4">
          {mockBids
            .filter(bid => bid.status === '낙찰 완료')
            .map((bid) => (
              <Card key={bid.id} className="overflow-hidden">
                <div className="flex">
                  <div className="w-20 h-20 bg-gray-100 flex-shrink-0">
                    <img 
                      src={bid.image} 
                      alt={bid.item}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4 flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{bid.item}</h4>
                        <div className="mt-1 text-sm text-muted-foreground">
                          <span>{bid.amount.toLocaleString()}원</span>
                          <span className="mx-2">•</span>
                          <span>{formatDistanceToNow(bid.time, { addSuffix: true, locale: ko })}</span>
                        </div>
                      </div>
                      <Button size="sm">결제하기</Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            
            {mockBids.filter(bid => bid.status === '낙찰 완료').length === 0 && (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <CheckCircle className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">낙찰된 상품이 없습니다</h3>
                <p className="mt-1 text-sm text-gray-500">경매에서 낙찰되면 여기에 표시됩니다.</p>
              </div>
            )}
        </div>
      </TabsContent>
      
      <TabsContent value="watchlist">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">관심 목록</h3>
          <Button variant="outline" size="sm">모두 삭제</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((item) => (
            <Card key={item} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative">
                <div className="aspect-square bg-gray-100">
                  <img 
                    src={`/watchlist-${item}.jpg`}
                    alt={`관심 상품 ${item}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white"
                >
                  <XCircle className="h-4 w-4 text-gray-600" />
                </Button>
                <div className="absolute bottom-2 left-2">
                  <Badge className="bg-white text-gray-900 hover:bg-white/90">
                    <Clock className="h-3 w-3 mr-1" />
                    관심 상품
                  </Badge>
                </div>
              </div>
              <div className="p-4">
                <h4 className="font-medium">관심 상품 {item}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  현재 입찰가: {(100000 + item * 50000).toLocaleString()}원
                </p>
                <div className="mt-3 flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    {item}일 전 추가
                  </span>
                  <Button size="sm" variant="outline">
                    입찰하기
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
        
        {[1, 2, 3].length === 0 && (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <Clock className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">관심 상품이 없습니다</h3>
            <p className="mt-1 text-sm text-gray-500">상품을 관심 목록에 추가하시면 여기에 표시됩니다.</p>
            <div className="mt-6">
              <Button>상품 보러가기</Button>
            </div>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}

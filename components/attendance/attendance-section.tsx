'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, Check, Flame, Gift, Calendar as CalendarIcon, History, Trophy } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AttendanceHistory } from './attendance-history';
import { AttendanceRanking } from './attendance-ranking';
import { useSession } from 'next-auth/react';

type TabType = 'checkin' | 'history' | 'ranking';

export function AttendanceSection() {
  const [activeTab, setActiveTab] = useState<TabType>('checkin');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    currentStreak: 0,
    monthlyAttendance: 0,
    nextBonusIn: 0,
    hasCheckedIn: false
  });
  const { data: session } = useSession();
  const { toast } = useToast();

  const fetchAttendanceStatus = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/attendance/status');
      const { data } = await response.json();
      
      if (response.ok) {
        setStats({
          currentStreak: data.streak || 0,
          monthlyAttendance: data.monthlyAttendance || 0,
          nextBonusIn: data.nextBonusIn || 0,
          hasCheckedIn: data.hasCheckedIn || false
        });
      }
    } catch (error) {
      console.error('출석 상태를 불러오는 중 오류 발생:', error);
      toast({
        title: '오류 발생',
        description: '출석 상태를 불러오는 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/attendance/check-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '출석체크에 실패했습니다.');
      }

      toast({
        title: '출석체크 완료!',
        description: data.message,
        duration: 5000,
      });

      await fetchAttendanceStatus();
    } catch (error: any) {
      toast({
        title: '오류 발생',
        description: error.message || '출석체크 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceStatus();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs 
        value={activeTab} 
        onValueChange={(value) => setActiveTab(value as TabType)}
        className="space-y-6"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">출석체크</h2>
            <p className="text-muted-foreground">
              매일 출석하고 포인트를 받아가세요!
            </p>
          </div>
          {activeTab === 'checkin' && (
            <Button
              onClick={handleCheckIn}
              disabled={isLoading || stats.hasCheckedIn}
              className={cn(
                "gap-2",
                stats.hasCheckedIn ? "bg-green-500 hover:bg-green-600" : ""
              )}
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  처리 중...
                </>
              ) : stats.hasCheckedIn ? (
                <>
                  <Check className="h-4 w-4" />
                  오늘의 출석 완료
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  출석체크하고 포인트 받기
                </>
              )}
            </Button>
          )}
        </div>

        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="checkin" className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            출석체크
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            출석이력
          </TabsTrigger>
          <TabsTrigger value="ranking" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            랭킹
          </TabsTrigger>
        </TabsList>

        <TabsContent value="checkin" className="space-y-6">

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">현재 연속 출석</CardTitle>
                <Flame className="h-5 w-5 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.currentStreak}일</div>
                <p className="text-xs text-muted-foreground">
                  {stats.currentStreak > 0 
                    ? `매일 출석하면 포인트가 쌓여요!` 
                    : '출석을 시작해보세요!'}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">이번 달 출석일</CardTitle>
                <CalendarIcon className="h-5 w-5 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.monthlyAttendance}일</div>
                <p className="text-xs text-muted-foreground">
                  {stats.monthlyAttendance >= 15 
                    ? '🎉 월간 보너스 달성!' 
                    : `${15 - stats.monthlyAttendance}일 더 출석하면 보너스!`}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">다음 보너스</CardTitle>
                <Gift className="h-5 w-5 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.nextBonusIn === 0 ? '오늘!' : `${stats.nextBonusIn}일 후`}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.nextBonusIn === 0 
                    ? '출석체크하면 2배 보너스!' 
                    : '연속 출석 보너스가 기다리고 있어요!'}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">출석 보상 안내</CardTitle>
              <CardDescription>매일 출석하고 다양한 보상을 받아보세요!</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h3 className="font-medium mb-2">기본 보상</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 mr-2" />
                    <span>매일 출석 시 <span className="font-semibold">1구루</span> 적립</span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 mr-2" />
                    <span>연속 7일 출석 시 <span className="font-semibold">2배 보너스</span> 지급</span>
                  </li>
                </ul>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <h3 className="font-medium mb-2">월간 보상</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 mt-2 mr-2" />
                    <span>한 달 동안 15일 이상 출석 시 <span className="font-semibold">100구루</span> 보너스</span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 mt-2 mr-2" />
                    <span>매월 1일 출석 시 추가 보너스</span>
                  </li>
                </ul>
              </div>

              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <h3 className="font-medium mb-2 flex items-center text-amber-800 dark:text-amber-200">
                  <Icons.zap className="h-4 w-4 mr-1.5" />
                  특별 이벤트
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <div className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-2 mr-2" />
                    <span>주말 출석 시 <span className="font-semibold">2배 보너스</span> 지급</span>
                  </li>
                  <li className="flex items-start">
                    <div className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-2 mr-2" />
                    <span>기간 한정 특별 이벤트 진행 시 추가 보너스</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>나의 출석 이력</CardTitle>
              <CardDescription>지난 출석 기록을 확인해보세요.</CardDescription>
            </CardHeader>
            <CardContent>
              <AttendanceHistory userId={session?.user?.id || ''} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ranking" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>출석 랭킹</CardTitle>
              <CardDescription>다른 사용자와 출석 순위를 경쟁해보세요!</CardDescription>
            </CardHeader>
            <CardContent>
              <AttendanceRanking userId={session?.user?.id || ''} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

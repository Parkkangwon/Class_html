'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Icons } from '@/components/icons';
import { useToast } from '@/components/ui/use-toast';

interface AttendanceRecord {
  id: string;
  date: string;
  pointsEarned: number;
  isStreakBonus: boolean;
  isMonthlyBonus: boolean;
  isSpecialEvent: boolean;
  eventName: string | null;
}

export function AttendanceHistory({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const { toast } = useToast();
  const limit = 10;

  const fetchHistory = async (pageNum: number) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/attendance/history?page=${pageNum}&limit=${limit}`);
      const { data, pagination } = await response.json();
      
      if (response.ok) {
        setRecords(prev => pageNum === 1 ? data : [...prev, ...data]);
        setHasMore(pagination.page < pagination.totalPages);
      }
    } catch (error) {
      console.error('출석 이력 조회 중 오류 발생:', error);
      toast({
        title: '오류 발생',
        description: '출석 이력을 불러오는 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(1);
  }, [userId]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchHistory(nextPage);
  };

  const getStatusBadge = (record: AttendanceRecord) => {
    if (record.isSpecialEvent && record.eventName) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          {record.eventName}
        </span>
      );
    }
    if (record.isMonthlyBonus) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          월간 보너스
        </span>
      );
    }
    if (record.isStreakBonus) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          연속 출석 보너스
        </span>
      );
    }
    return null;
  };

  if (loading && records.length === 0) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="text-center py-12">
        <Icons.calendarCheck className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">출석 이력이 없습니다</h3>
        <p className="mt-1 text-sm text-gray-500">매일 출석하고 포인트를 받아보세요!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden bg-white shadow sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {records.map((record) => (
            <li key={record.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-indigo-600">
                      {format(new Date(record.date), 'yyyy년 M월 d일 (EEE)', { locale: ko })}
                    </div>
                    <div className="ml-2">
                      {getStatusBadge(record)}
                    </div>
                  </div>
                  <div className="ml-2 flex-shrink-0 flex">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      +{record.pointsEarned} 포인트
                    </span>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {hasMore && (
        <div className="flex justify-center mt-4">
          <Button 
            variant="outline" 
            onClick={loadMore}
            disabled={loading}
            className="flex items-center"
          >
            {loading ? (
              <>
                <Icons.loader className="mr-2 h-4 w-4 animate-spin" />
                로드 중...
              </>
            ) : (
              '더 보기'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

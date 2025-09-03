'use client';

import { useState, useMemo, useCallback, memo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

// 동적 임포트로 컴포넌트 로드
const Button = dynamic(() => import('@/components/ui/button').then(mod => mod.Button));
const Card = dynamic(() => import('@/components/ui/card').then(mod => mod.Card));
const CardContent = dynamic(() => import('@/components/ui/card').then(mod => mod.CardContent));
const CardHeader = dynamic(() => import('@/components/ui/card').then(mod => mod.CardHeader));
const CardTitle = dynamic(() => import('@/components/ui/card').then(mod => mod.CardTitle));
const CardDescription = dynamic(() => import('@/components/ui/card').then(mod => mod.CardDescription));
const CardFooter = dynamic(() => import('@/components/ui/card').then(mod => mod.CardFooter));
const Input = dynamic(() => import('@/components/ui/input').then(mod => mod.Input));
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
const Pagination = dynamic(() => import('@/components/ui/pagination').then(mod => ({
  Pagination: mod.Pagination,
  PaginationContent: mod.PaginationContent,
  PaginationItem: mod.PaginationItem,
  PaginationLink: mod.PaginationLink,
  PaginationNext: mod.PaginationNext,
  PaginationPrevious: mod.PaginationPrevious,
})));
import * as Icons from '@/components/icons';
const Skeleton = dynamic(() => import('@/components/ui/skeleton').then(mod => mod.Skeleton));
const Badge = dynamic(() => import('@/components/ui/badge').then(mod => mod.Badge));

interface Ticket {
  id: string;
  subject: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'general' | 'billing' | 'technical' | 'other';
  createdAt: string;
  updatedAt: string;
  userId: string;
  userName: string;
  lastMessage: string;
  unreadCount: number;
  assignedTo?: string;
  lastRepliedAt?: string;
  lastRepliedBy?: string;
}

type SortField = 'updatedAt' | 'createdAt' | 'priority' | 'status';
type SortOrder = 'asc' | 'desc';

interface Filters {
  searchQuery: string;
  status: string;
  priority: string;
  category: string;
}

interface Sort {
  field: SortField;
  order: SortOrder;
}

interface PaginationState {
  page: number;
  limit: number;
}

// 상태별 스타일 정의
const statusVariants = {
  open: { 
    label: '대기중', 
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    icon: 'alertTriangle' as const
  },
  in_progress: { 
    label: '처리중', 
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    icon: 'loader' as const
  },
  resolved: { 
    label: '해결됨', 
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    icon: 'check' as const
  },
  closed: { 
    label: '종료됨', 
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    icon: 'lock' as const
  },
} as const;

// 아이콘 타입 정의
type IconName = keyof typeof Icons;

// 아이콘이 존재하는지 확인하는 유틸리티 함수
const getIconComponent = (iconName: string) => {
  const icon = Icons[iconName as IconName];
  return icon || Icons.helpCircle; // 아이콘이 없을 경우 도움말 아이콘 반환
};

// 우선순위별 스타일 정의
const priorityVariants = {
  low: { 
    label: '낮음', 
    color: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    icon: 'arrowDown'
  },
  medium: { 
    label: '보통', 
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    icon: 'equal'
  },
  high: { 
    label: '높음', 
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    icon: 'arrowUp'
  },
  urgent: { 
    label: '긴급', 
    color: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    icon: 'alertTriangle'
  },
} as const;

// 카테고리별 스타일 정의
const categoryVariants = {
  general: { label: '일반 문의', icon: 'helpCircle' },
  billing: { label: '결제/환불', icon: 'creditCard' },
  technical: { label: '기술 문의', icon: 'server' },
  other: { label: '기타', icon: 'moreHorizontal' },
} as const;

// 상태 관리 훅
const useTicketFilters = () => {
  const [filters, setFilters] = useState<Filters>({
    searchQuery: '',
    status: 'all',
    priority: 'all',
    category: 'all',
  });
  
  const [sort, setSort] = useState<Sort>({
    field: 'updatedAt',
    order: 'desc',
  });
  
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 10,
  });

  return {
    filters,
    sort,
    pagination,
    setFilters: useCallback((newFilters: Partial<Filters>) => 
      setFilters(prev => ({
        ...prev,
        ...newFilters,
      })), []),
    setSort: useCallback((newSort: Partial<Sort>) => 
      setSort(prev => ({
        ...prev,
        ...newSort,
      })), []),
    setPagination: useCallback((newPagination: Partial<PaginationState>) => 
      setPagination(prev => ({
        ...prev,
        ...newPagination,
        page: newPagination.page || 1, // 페이지는 항상 1 이상이어야 함
      })), []),
  };
};

// 상태 뱃지 컴포넌트
const StatusBadge = memo(({ status }: { status: keyof typeof statusVariants }) => {
  const { label, color, icon } = statusVariants[status] || statusVariants.open;
  const IconComponent = getIconComponent(icon);
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      <IconComponent className="h-3 w-3 mr-1" />
      {label}
    </span>
  );
});
StatusBadge.displayName = 'StatusBadge';

// 티켓 목록 컴포넌트
export function TicketList() {
  const router = useRouter();
  const {
    filters,
    sort,
    pagination,
    setFilters,
    setSort,
    setPagination,
  } = useTicketFilters();

  // 티켓 데이터 페칭
  const { data: ticketsData, isLoading, error } = useQuery<{
    tickets: Ticket[];
    total: number;
  }>({
    queryKey: ['tickets', { 
      ...filters,
      ...sort,
      ...pagination
    }],
    queryFn: async ({ queryKey }) => {
      const [_key, params] = queryKey as [string, Filters & Sort & PaginationState];
      const queryParams = new URLSearchParams();
      
      // 필터 파라미터 추가
      if (params.searchQuery) queryParams.append('q', params.searchQuery);
      if (params.status !== 'all') queryParams.append('status', params.status);
      if (params.priority !== 'all') queryParams.append('priority', params.priority);
      if (params.category !== 'all') queryParams.append('category', params.category);
      
      // 정렬 파라미터 추가
      queryParams.append('sort', params.field);
      queryParams.append('order', params.order);
      
      // 페이지네이션 파라미터 추가
      queryParams.append('page', params.page.toString());
      queryParams.append('limit', params.limit.toString());
      
      const response = await fetch(`/api/tickets?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error('티켓을 불러오는 중 오류가 발생했습니다.');
      }
      return response.json();
    },
    keepPreviousData: true, // 이전 데이터 유지하여 깜빡임 방지
    staleTime: 5 * 60 * 1000, // 5분간 데이터 신선도 유지
  });
  
  // 필터 핸들러
  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, searchQuery: e.target.value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);
  
  // 상태 필터 핸들러
  const handleStatusFilter = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, status: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);
  
  // 페이지 변경 핸들러
  const handlePageChange = useCallback((newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  
  // 정렬 핸들러
  const handleSort = useCallback((field: SortField) => {
    setSort(prev => ({
      field,
      order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc'
    }));
  }, []);
  
  // 총 페이지 수 계산
  const totalPages = useMemo(() => {
    return ticketsData?.total ? Math.ceil(ticketsData.total / pagination.limit) : 0;
  }, [ticketsData?.total, pagination.limit]);
  
  // 페이지네이션 범위 계산
  const paginationRange = useMemo(() => {
    const range = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, pagination.page - Math.floor(maxVisiblePages / 2));
    let endPage = startPage + maxVisiblePages - 1;
    
    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      range.push(i);
    }
    
    return range;
  }, [pagination.page, totalPages]);
      
  // 로딩 상태 표시
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-[180px]" />
        </div>
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  // 에러 상태 표시
  if (error) {
    return (
      <div className="text-center py-10">
        <Icons.alertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium mb-2">오류가 발생했습니다</h3>
        <p className="text-muted-foreground mb-4">
          {error instanceof Error ? error.message : '티켓을 불러오는 중 오류가 발생했습니다.'}
        </p>
        <Button onClick={() => window.location.reload()} variant="outline">
          <Icons.refreshCw className="mr-2 h-4 w-4" />
          다시 시도하기
        </Button>
      </div>
    );
  }

  // 데이터가 없을 때 표시
  if (!ticketsData?.tickets?.length) {
    return (
      <div className="text-center py-10">
        <Icons.inbox className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-1">문의 내역이 없습니다</h3>
        <p className="text-muted-foreground mb-6">새로운 문의를 작성해보세요.</p>
        <Button onClick={() => router.push('/support/new')}>
          <Icons.plus className="mr-2 h-4 w-4" />
          새 문의하기
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 검색 및 필터 섹션 */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="제목 또는 내용 검색"
            value={filters.searchQuery}
            onChange={handleSearch}
            className="w-full"
          />
        </div>
        <Select value={filters.status} onValueChange={handleStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="상태별 필터" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">모든 상태</SelectItem>
            <SelectItem value="open">대기중</SelectItem>
            <SelectItem value="in_progress">처리중</SelectItem>
            <SelectItem value="resolved">해결됨</SelectItem>
            <SelectItem value="closed">종료됨</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 티켓 목록 */}
      <div className="space-y-4">
        {ticketsData.tickets.map((ticket) => (
          <TicketItem 
            key={ticket.id}
            ticket={ticket}
            onClick={() => router.push(`/support/tickets/${ticket.id}`)}
          />
        ))}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
                  disabled={pagination.page === 1}
                />
              </PaginationItem>
              
              {paginationRange.map((pageNum) => (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    isActive={pageNum === pagination.page}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => handlePageChange(Math.min(totalPages, pagination.page + 1))}
                  disabled={pagination.page === totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );

  // Fetch tickets with useQuery
  interface TicketsResponse {
  tickets: Ticket[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const { data: ticketsData, isLoading, error } = useQuery({
    queryKey: ['tickets', pagination.page, pagination.limit, sort, filters],
    queryKey: ['tickets', pagination.page, pagination.limit, sort, filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sortField: sort.field,
        sortOrder: sort.order,
        ...(filters.searchQuery && { search: filters.searchQuery }),
        ...(filters.status && { status: filters.status }),
        ...(filters.priority && { priority: filters.priority }),
        ...(filters.category && { category: filters.category }),
      });

      const response = await fetch(`/api/tickets?${params.toString()}`);
      if (!response.ok) {
        throw new Error('티켓 목록을 불러오는 데 실패했습니다.');
      }
      return response.json();
    },
    keepPreviousData: true,
  });

  const tickets = ticketsData?.tickets || [];
  const totalCount = ticketsData?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / pagination.limit);
  const totalTickets = ticketsData?.total || 0;
  const totalPages = Math.ceil(totalTickets / itemsPerPage);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1); // Reset to first page on new search
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle sort change
  const handleSortChange = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  // Handle filter changes
  const handleFilterChange = (type: 'status' | 'priority' | 'category', value: string) => {
    if (type === 'status') setStatusFilter(value);
    else if (type === 'priority') setPriorityFilter(value);
    else if (type === 'category') setCategoryFilter(value);
    setCurrentPage(1);
  };

  // Loading state
  if (isLoading && !ticketsData) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-64" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <div className="flex space-x-2">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <div className="mt-4 flex justify-between items-center">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-8">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
          <Icons.alertCircle className="h-6 w-6 text-red-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">오류가 발생했습니다</h3>
        <p className="text-muted-foreground mb-6">
          {error instanceof Error ? error.message : '티켓 목록을 불러오는 중 문제가 발생했습니다.'}
        </p>
        <Button 
          variant="outline" 
          onClick={() => router.refresh()}
        >
          <Icons.refreshCw className="h-4 w-4 mr-2" />
          다시 시도하기
        </Button>
      </div>
    );
  }

  // Empty state
  if (tickets.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed rounded-lg">
        <Icons.ticket className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">문의 내역이 없습니다</h3>
        <p className="mt-1 text-muted-foreground">새로운 문의를 작성해보세요.</p>
        <div className="mt-6">
          <Link href="/support/new">
            <Button>
              <Icons.plus className="h-4 w-4 mr-2" />
              새 문의하기
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with search and filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">나의 문의내역</h2>
            <p className="text-muted-foreground">
              총 {totalTickets}개의 문의사항이 있습니다.
            </p>
          </div>
          <Link href="/support/new" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">
              <Icons.plus className="mr-2 h-4 w-4" />
              새 문의하기
            </Button>
          </Link>
        </div>

        {/* Search and filter bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-1">
            <Input
              placeholder="제목 또는 내용 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
              startIcon={<Icons.search className="h-4 w-4 text-muted-foreground" />}
            />
          </div>
          
          <Select 
            value={statusFilter} 
            onValueChange={(value) => handleFilterChange('status', value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="상태별 보기" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">모든 상태</SelectItem>
              {Object.entries(statusVariants).map(([key, { label, icon }]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center">
                    {icon}
                    {label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select 
            value={priorityFilter} 
            onValueChange={(value) => handleFilterChange('priority', value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="우선순위별 보기" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">모든 우선순위</SelectItem>
              {Object.entries(priorityVariants).map(([key, { label, icon }]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center">
                    {icon}
                    {label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select 
            value={categoryFilter} 
            onValueChange={(value) => handleFilterChange('category', value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="카테고리별 보기" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">모든 카테고리</SelectItem>
              {Object.entries(categoryVariants).map(([key, { label, icon }]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center">
                    {icon}
                    {label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Sort options */}
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span className="whitespace-nowrap">정렬:</span>
          {[
            { field: 'updatedAt' as const, label: '마지막 업데이트' },
            { field: 'createdAt' as const, label: '생성일' },
            { field: 'priority' as const, label: '우선순위' },
            { field: 'status' as const, label: '상태' },
          ].map(({ field, label }) => (
            <button
              key={field}
              onClick={() => handleSortChange(field)}
              className={`flex items-center gap-1 px-2 py-1 rounded-md transition-colors ${
                sortField === field
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              {label}
              {sortField === field && (
                <Icons.arrowUp
                  className={`h-3 w-3 transition-transform ${
                    sortOrder === 'desc' ? 'rotate-0' : 'rotate-180'
                  }`}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Ticket List */}
      <div className="space-y-4">
        {tickets.map((ticket) => {
          const status = statusVariants[ticket.status];
          const priority = priorityVariants[ticket.priority];
          const category = categoryVariants[ticket.category];
          const lastUpdated = new Date(ticket.updatedAt);
          const isUnread = ticket.unreadCount > 0;
          
          return (
            <Card 
              key={ticket.id} 
              className={`transition-all hover:shadow-md overflow-hidden ${
                isUnread ? 'border-l-4 border-l-primary' : ''
              }`}
            >
              <CardContent className="p-0">
                <Link href={`/support/tickets/${ticket.id}`} className="block">
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-base line-clamp-1">
                            {ticket.subject}
                            {isUnread && (
                              <span className="ml-2 inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary text-white text-xs font-medium">
                                {ticket.unreadCount}
                              </span>
                            )}
                          </h3>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            {category.icon}
                            <span>{category.label}</span>
                          </div>
                          <span>•</span>
                          <div className="flex items-center">
                            <Icons.calendar className="h-3.5 w-3.5 mr-1" />
                            <span>
                              {format(lastUpdated, 'yyyy.MM.dd HH:mm', { locale: ko })}
                            </span>
                          </div>
                          {ticket.lastRepliedAt && (
                            <>
                              <span>•</span>
                              <div className="flex items-center">
                                <Icons.messageSquare className="h-3.5 w-3.5 mr-1" />
                                <span>
                                  {formatDistanceToNow(new Date(ticket.lastRepliedAt), { 
                                    addSuffix: true,
                                    locale: ko 
                                  })}
                                </span>
                                {ticket.lastRepliedBy && (
                                  <span className="ml-1">
                                    • {ticket.lastRepliedBy} 님의 답변
                                  </span>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap sm:flex-col sm:items-end">
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline" 
                            className={`${priority.color} flex items-center gap-1`}
                          >
                            {priority.icon}
                            {priority.label}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={`${status.color} flex items-center gap-1`}
                          >
                            {status.icon}
                            {status.label}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDistanceToNow(lastUpdated, { 
                            addSuffix: true,
                            locale: ko 
                          })}
                        </div>
                      </div>
                    </div>
                    
                    {ticket.lastMessage && (
                      <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                        {ticket.lastMessage}
                      </p>
                    )}
                  </div>
                </Link>
                
                <div className="border-t px-6 py-3 bg-muted/5 text-sm text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icons.user className="h-4 w-4" />
                      <span>{ticket.userName}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Icons.messageSquare className="h-4 w-4" />
                        <span>답변 {ticket.unreadCount}개</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Icons.clock className="h-4 w-4" />
                        <span>
                          {format(new Date(ticket.createdAt), 'yyyy.MM.dd', { locale: ko })} 등록
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center py-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) setCurrentPage(currentPage - 1);
                  }}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Calculate page numbers with ellipsis
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(pageNum);
                      }}
                      isActive={currentPage === pageNum}
                      className={currentPage === pageNum ? 'bg-primary text-primary-foreground' : ''}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              
              <PaginationItem>
                <PaginationNext 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                  }}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}

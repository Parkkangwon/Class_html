'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Mock data - replace with real API calls in production
const mockPerformanceData = {
  pageLoadTimes: [
    { page: '홈', loadTime: 1.2 },
    { page: '경매 목록', loadTime: 1.8 },
    { page: '상품 상세', loadTime: 2.1 },
    { page: '지원 페이지', loadTime: 1.5 },
  ],
  coreWebVitals: {
    lcp: 1.8,
    fid: 0.1,
    cls: 0.05,
  },
  resourceTiming: [
    { name: 'JavaScript', size: 450, time: 1.2 },
    { name: 'CSS', size: 120, time: 0.8 },
    { name: '이미지', size: 850, time: 2.1 },
    { name: '폰트', size: 180, time: 0.5 },
  ],
  userTiming: [
    { name: '데이터 로드', duration: 1.2 },
    { name: '컴포넌트 렌더링', duration: 0.8 },
    { name: '이미지 로드', duration: 1.5 },
    { name: 'API 호출', duration: 0.9 },
  ],
};

// Format bytes to human-readable format
const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export default function PerformanceDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(mockPerformanceData);
  
  // In a real app, you would fetch this data from your analytics/performance monitoring service
  useEffect(() => {
    const fetchData = async () => {
      try {
        // const response = await fetch('/api/performance-metrics');
        // const result = await response.json();
        // setData(result);
        
        // Using mock data for now
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching performance data:', error);
        setIsLoading(false);
      }
    };
    
    fetchData();
    
    // Set up real-time updates (e.g., with WebSockets)
    // const ws = new WebSocket('wss://your-api/performance-updates');
    // ws.onmessage = (event) => {
    //   setData(JSON.parse(event.data));
    // };
    // 
    // return () => ws.close();
  }, []);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">성능 대시보드</h1>
        <p className="text-muted-foreground">
          애플리케이션 성능 메트릭을 모니터링하세요.
        </p>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="web-vitals">Core Web Vitals</TabsTrigger>
          <TabsTrigger value="resources">리소스</TabsTrigger>
          <TabsTrigger value="user-timing">사용자 타이밍</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard 
              title="LCP" 
              value={`${data.coreWebVitals.lcp}s`} 
              description="Largest Contentful Paint" 
              icon={Icons.gauge}
              status={data.coreWebVitals.lcp < 2.5 ? 'good' : 'poor'}
            />
            <MetricCard 
              title="FID" 
              value={`${data.coreWebVitals.fid}ms`} 
              description="First Input Delay" 
              icon={Icons.timer}
              status={data.coreWebVitals.fid < 100 ? 'good' : 'poor'}
            />
            <MetricCard 
              title="CLS" 
              value={data.coreWebVitals.cls.toFixed(2)} 
              description="Cumulative Layout Shift" 
              icon={Icons.layout}
              status={data.coreWebVitals.cls < 0.1 ? 'good' : 'poor'}
            />
            <MetricCard 
              title="평균 페이지 로드" 
              value={`${(data.pageLoadTimes.reduce((sum, page) => sum + page.loadTime, 0) / data.pageLoadTimes.length).toFixed(2)}s`} 
              description="전체 페이지 평균" 
              icon={Icons.barChart}
              status="neutral"
            />
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>페이지별 로드 시간</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <Bar
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: '로드 시간 (초)',
                        },
                      },
                      x: {
                        title: {
                          display: true,
                          text: '페이지',
                        },
                      },
                    },
                  }}
                  data={{
                    labels: data.pageLoadTimes.map((item) => item.page),
                    datasets: [
                      {
                        label: '로드 시간 (초)',
                        data: data.pageLoadTimes.map((item) => item.loadTime),
                        backgroundColor: 'rgba(79, 70, 229, 0.7)',
                        borderColor: 'rgba(79, 70, 229, 1)',
                        borderWidth: 1,
                      },
                    ],
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="web-vitals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Core Web Vitals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 border rounded-lg">
                  <h3 className="text-sm font-medium text-muted-foreground">LCP</h3>
                  <p className="text-2xl font-bold">{data.coreWebVitals.lcp}s</p>
                  <p className="text-sm text-muted-foreground">
                    {data.coreWebVitals.lcp < 2.5 ? '👍 좋음' : '👎 개선 필요'}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Largest Contentful Paint - 2.5초 이하 권장
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h3 className="text-sm font-medium text-muted-foreground">FID</h3>
                  <p className="text-2xl font-bold">{data.coreWebVitals.fid}ms</p>
                  <p className="text-sm text-muted-foreground">
                    {data.coreWebVitals.fid < 100 ? '👍 좋음' : '👎 개선 필요'}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    First Input Delay - 100ms 이하 권장
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h3 className="text-sm font-medium text-muted-foreground">CLS</h3>
                  <p className="text-2xl font-bold">{data.coreWebVitals.cls.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">
                    {data.coreWebVitals.cls < 0.1 ? '👍 좋음' : '👎 개선 필요'}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Cumulative Layout Shift - 0.1 이하 권장
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Core Web Vitals 추이</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <Line
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                      mode: 'index',
                      intersect: false,
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: '값',
                        },
                      },
                      x: {
                        title: {
                          display: true,
                          text: '날짜',
                        },
                      },
                    },
                  }}
                  data={{
                    labels: ['1일 전', '2일 전', '3일 전', '4일 전', '5일 전', '어제', '오늘'],
                    datasets: [
                      {
                        label: 'LCP (초)',
                        data: [2.1, 2.0, 2.3, 1.9, 1.8, 1.7, data.coreWebVitals.lcp],
                        borderColor: 'rgb(79, 70, 229)',
                        backgroundColor: 'rgba(79, 70, 229, 0.1)',
                        tension: 0.3,
                        yAxisID: 'y',
                      },
                      {
                        label: 'FID (ms)',
                        data: [90, 95, 110, 105, 100, 95, data.coreWebVitals.fid],
                        borderColor: 'rgb(16, 185, 129)',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.3,
                        yAxisID: 'y1',
                      },
                      {
                        label: 'CLS',
                        data: [0.08, 0.07, 0.09, 0.06, 0.05, 0.06, data.coreWebVitals.cls],
                        borderColor: 'rgb(245, 158, 11)',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        tension: 0.3,
                        yAxisID: 'y2',
                      },
                    ],
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="resources" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>리소스 크기</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <Pie
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'right',
                        },
                        tooltip: {
                          callbacks: {
                            label: (context) => {
                              const label = context.label || '';
                              const value = context.raw || 0;
                              return `${label}: ${formatBytes(value)}`;
                            },
                          },
                        },
                      },
                    }}
                    data={{
                      labels: data.resourceTiming.map((item) => item.name),
                      datasets: [
                        {
                          data: data.resourceTiming.map((item) => item.size),
                          backgroundColor: [
                            'rgba(79, 70, 229, 0.7)',
                            'rgba(16, 185, 129, 0.7)',
                            'rgba(245, 158, 11, 0.7)',
                            'rgba(236, 72, 153, 0.7)',
                          ],
                          borderColor: [
                            'rgba(79, 70, 229, 1)',
                            'rgba(16, 185, 129, 1)',
                            'rgba(245, 158, 11, 1)',
                            'rgba(236, 72, 153, 1)',
                          ],
                          borderWidth: 1,
                        },
                      ],
                    }}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>리소스 로드 시간</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <Bar
                    options={{
                      indexAxis: 'y' as const,
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        x: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: '로드 시간 (초)',
                          },
                        },
                        y: {
                          title: {
                            display: true,
                            text: '리소스 유형',
                          },
                        },
                      },
                    }}
                    data={{
                      labels: data.resourceTiming.map((item) => item.name),
                      datasets: [
                        {
                          label: '로드 시간 (초)',
                          data: data.resourceTiming.map((item) => item.time),
                          backgroundColor: 'rgba(16, 185, 129, 0.7)',
                          borderColor: 'rgba(16, 185, 129, 1)',
                          borderWidth: 1,
                        },
                      ],
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>리소스 상세 정보</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        리소스 유형
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        크기
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        로드 시간
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        상태
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.resourceTiming.map((resource, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {resource.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatBytes(resource.size * 1024)} {/* Convert KB to bytes */}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {resource.time.toFixed(2)}초
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            resource.time < 1 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {resource.time < 1 ? '양호' : '개선 필요'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="user-timing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>사용자 타이밍</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <Bar
                  options={{
                    indexAxis: 'y' as const,
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      x: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: '소요 시간 (초)',
                        },
                      },
                      y: {
                        title: {
                          display: true,
                          text: '이벤트',
                        },
                      },
                    },
                  }}
                  data={{
                    labels: data.userTiming.map((item) => item.name),
                    datasets: [
                      {
                        label: '소요 시간 (초)',
                        data: data.userTiming.map((item) => item.duration),
                        backgroundColor: 'rgba(79, 70, 229, 0.7)',
                        borderColor: 'rgba(79, 70, 229, 1)',
                        borderWidth: 1,
                      },
                    ],
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper component for metric cards
function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  status = 'neutral',
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  status?: 'good' | 'neutral' | 'poor';
}) {
  const statusColors = {
    good: 'bg-green-50 text-green-700',
    neutral: 'bg-gray-50 text-gray-700',
    poor: 'bg-red-50 text-red-700',
  };
  
  const iconColors = {
    good: 'text-green-600',
    neutral: 'text-gray-600',
    poor: 'text-red-600',
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`h-8 w-8 rounded-full ${statusColors[status]} flex items-center justify-center`}>
          <Icon className={`h-4 w-4 ${iconColors[status]}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

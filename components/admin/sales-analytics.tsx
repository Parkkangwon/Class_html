'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Icons } from '@/components/icons';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface SalesData {
  date: string;
  totalSales: number;
  totalRevenue: number;
  averageOrderValue: number;
  orders: number;
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const timeRanges = [
  { value: '7days', label: '지난 7일' },
  { value: '30days', label: '지난 30일' },
  { value: '90days', label: '지난 90일' },
  { value: 'year', label: '올해' },
];

export function SalesAnalytics() {
  const [timeRange, setTimeRange] = useState('30days');
  const [activeTab, setActiveTab] = useState('revenue');

  const { data: salesData, isLoading } = useQuery<SalesData[]>({
    queryKey: ['sales-analytics', timeRange],
    queryFn: async () => {
      // In a real app, you would fetch this data from your API
      // const response = await fetch(`/api/admin/analytics/sales?range=${timeRange}`);
      // return response.json();
      
      // Mock data for demonstration
      return generateMockSalesData(timeRange);
    },
  });

  const { data: categoryData } = useQuery<CategoryData[]>({
    queryKey: ['category-analytics', timeRange],
    queryFn: async () => {
      // Mock category data
      return [
        { name: '전자제품', value: 4000, color: COLORS[0] },
        { name: '의류', value: 3000, color: COLORS[1] },
        { name: '가구', value: 2000, color: COLORS[2] },
        { name: '예술품', value: 1500, color: COLORS[3] },
        { name: '기타', value: 1000, color: COLORS[4] },
      ];
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const totalRevenue = salesData?.reduce((sum, item) => sum + item.totalRevenue, 0) || 0;
  const totalSales = salesData?.reduce((sum, item) => sum + item.orders, 0) || 0;
  const averageOrderValue = salesData?.length ? totalRevenue / totalSales : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">매출 분석</h2>
        <div className="flex items-center space-x-2">
          <TabsList>
            {timeRanges.map((range) => (
              <TabsTrigger
                key={range.value}
                value={range.value}
                onClick={() => setTimeRange(range.value)}
                className={timeRange === range.value ? 'bg-primary text-primary-foreground' : ''}
              >
                {range.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 매출</CardTitle>
            <Icons.dollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('ko-KR', {
                style: 'currency',
                currency: 'KRW',
                maximumFractionDigits: 0,
              }).format(totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              지난 기간 대비 +12.5%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 거래 건수</CardTitle>
            <Icons.shoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSales.toLocaleString()}건</div>
            <p className="text-xs text-muted-foreground">
              지난 기간 대비 +8.2%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 거래 금액</CardTitle>
            <Icons.creditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('ko-KR', {
                style: 'currency',
                currency: 'KRW',
                maximumFractionDigits: 0,
              }).format(averageOrderValue)}
            </div>
            <p className="text-xs text-muted-foreground">
              지난 기간 대비 +4.1%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">반품률</CardTitle>
            <Icons.refreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.3%</div>
            <p className="text-xs text-muted-foreground">
              지난 기간 대비 -0.5%
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">매출 추이</TabsTrigger>
          <TabsTrigger value="categories">카테고리별 매출</TabsTrigger>
          <TabsTrigger value="comparison">기간별 비교</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>매출 추이</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => {
                      if (timeRange === 'year') {
                        return value.split('-')[1] + '월';
                      }
                      return value.split('-').slice(1).join('/');
                    }}
                  />
                  <YAxis 
                    tickFormatter={(value) => 
                      new Intl.NumberFormat('ko-KR', {
                        style: 'currency',
                        currency: 'KRW',
                        maximumFractionDigits: 0,
                      })
                      .format(value)
                      .replace('₩', '₩ ')
                    }
                  />
                  <Tooltip 
                    formatter={(value) => [
                      new Intl.NumberFormat('ko-KR', {
                        style: 'currency',
                        currency: 'KRW',
                        maximumFractionDigits: 0,
                      }).format(Number(value)),
                      '총 매출'
                    ]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="totalRevenue" 
                    name="총 매출" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>카테고리별 매출 비중</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => 
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {categoryData?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [
                          new Intl.NumberFormat('ko-KR', {
                            style: 'currency',
                            currency: 'KRW',
                            maximumFractionDigits: 0,
                          }).format(Number(value)),
                          '매출액'
                        ]}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-4">
                  <h3 className="font-medium">카테고리별 매출 현황</h3>
                  <div className="space-y-3">
                    {categoryData?.map((item, index) => (
                      <div key={index} className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="flex-1 text-sm">{item.name}</span>
                        <span className="text-sm font-medium">
                          {new Intl.NumberFormat('ko-KR', {
                            style: 'currency',
                            currency: 'KRW',
                            maximumFractionDigits: 0,
                          }).format(item.value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>기간별 매출 비교</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData?.slice(0, 7)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    tickFormatter={(value) => 
                      new Intl.NumberFormat('ko-KR', {
                        style: 'currency',
                        currency: 'KRW',
                        maximumFractionDigits: 0,
                      })
                      .format(value)
                      .replace('₩', '₩ ')
                    }
                  />
                  <Tooltip 
                    formatter={(value) => [
                      new Intl.NumberFormat('ko-KR', {
                        style: 'currency',
                        currency: 'KRW',
                        maximumFractionDigits: 0,
                      }).format(Number(value)),
                      '총 매출'
                    ]}
                  />
                  <Bar dataKey="totalRevenue" name="총 매출" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper function to generate mock sales data
function generateMockSalesData(range: string): SalesData[] {
  const today = new Date();
  const data: SalesData[] = [];
  let days = 30; // Default to 30 days

  switch (range) {
    case '7days':
      days = 7;
      break;
    case '90days':
      days = 90;
      break;
    case 'year':
      days = 12; // 12 months
      break;
  }

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    
    if (range === 'year') {
      // For yearly view, show monthly data
      date.setMonth(date.getMonth() - i);
      const month = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
      
      const orders = Math.floor(Math.random() * 50) + 20;
      const totalRevenue = Math.floor(Math.random() * 5000000) + 2000000;
      
      data.push({
        date: `${year}-${String(date.getMonth() + 1).padStart(2, '0')}-01`,
        totalSales: orders,
        totalRevenue,
        averageOrderValue: Math.floor(totalRevenue / orders),
        orders,
      });
    } else {
      // For daily view
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      const orders = Math.floor(Math.random() * 20) + 5;
      const totalRevenue = Math.floor(Math.random() * 500000) + 200000;
      
      data.push({
        date: dateString,
        totalSales: orders,
        totalRevenue,
        averageOrderValue: Math.floor(totalRevenue / orders),
        orders,
      });
    }
  }

  return data;
}

"use client"

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
} from "recharts"

// Mock chart data
const monthlyRevenueData = [
  { month: "1월", revenue: 8500000, auctions: 89 },
  { month: "2월", revenue: 9200000, auctions: 95 },
  { month: "3월", revenue: 11800000, auctions: 112 },
  { month: "4월", revenue: 10500000, auctions: 98 },
  { month: "5월", revenue: 13200000, auctions: 125 },
  { month: "6월", revenue: 15800000, auctions: 142 },
]

const categoryData = [
  { name: "가구", value: 35, color: "#10B981" },
  { name: "소품", value: 28, color: "#3B82F6" },
  { name: "도예/공예", value: 20, color: "#8B5CF6" },
  { name: "패션", value: 12, color: "#F59E0B" },
  { name: "기타", value: 5, color: "#EF4444" },
]

const userGrowthData = [
  { month: "1월", users: 2100 },
  { month: "2월", users: 2350 },
  { month: "3월", users: 2680 },
  { month: "4월", users: 2890 },
  { month: "5월", users: 3150 },
  { month: "6월", users: 3456 },
]

export function MonthlyRevenueChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={monthlyRevenueData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
        <Tooltip
          formatter={(value: number) => [`${(value / 1000000).toFixed(1)}M원`, "매출"]}
          labelStyle={{ color: "#374151" }}
        />
        <Bar dataKey="revenue" fill="#10B981" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function UserGrowthChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={userGrowthData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip
          formatter={(value: number) => [`${value.toLocaleString()}명`, "사용자"]}
          labelStyle={{ color: "#374151" }}
        />
        <Line
          type="monotone"
          dataKey="users"
          stroke="#10B981"
          strokeWidth={3}
          dot={{ fill: "#10B981", strokeWidth: 2, r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function CategoryDistributionChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={categoryData}
          cx="50%"
          cy="50%"
          outerRadius={100}
          dataKey="value"
          label={({ name, value }) => `${name} ${value}%`}
        >
          {categoryData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => [`${value}%`, "비율"]} />
      </PieChart>
    </ResponsiveContainer>
  )
}

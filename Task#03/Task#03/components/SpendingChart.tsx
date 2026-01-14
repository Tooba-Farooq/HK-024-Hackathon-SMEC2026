'use client'

import { Receipt } from '@/lib/types'
import { getCategoryBreakdown, getDailySpending } from '@/lib/analytics'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface SpendingChartProps {
  receipts: Receipt[]
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316']

export default function SpendingChart({ receipts }: SpendingChartProps) {
  const categoryData = getCategoryBreakdown(receipts)
  const dailyData = getDailySpending(receipts)

  if (receipts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
        No spending data available yet. Upload some receipts to see your analytics.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Category Pie Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Spending by Category</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(entry: any) => `${entry.name} ${(entry.percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: any) => `${Number(value).toFixed(2)}`} />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-4 space-y-2">
          {categoryData.slice(0, 5).map((cat, idx) => (
            <div key={cat.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                />
                <span className="text-gray-700">{cat.name}</span>
              </div>
              <span className="font-semibold">${cat.value.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Bar Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Daily Spending Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              formatter={(value: any) => [`${Number(value).toFixed(2)}`, 'Amount']}
              labelStyle={{ color: '#000' }}
            />
            <Bar dataKey="amount" fill="#3B82F6" />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 text-sm text-gray-600 text-center">
          Last 30 days of spending activity
        </div>
      </div>

      {/* Statistics Summary */}
      <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
        <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {receipts.length}
            </div>
            <div className="text-sm text-gray-600">Total Receipts</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              ${receipts.reduce((sum, r) => sum + r.total, 0).toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Total Spent</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {categoryData.length}
            </div>
            <div className="text-sm text-gray-600">Categories</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              ${(receipts.reduce((sum, r) => sum + r.total, 0) / receipts.length).toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Avg Receipt</div>
          </div>
        </div>
      </div>
    </div>
  )
}
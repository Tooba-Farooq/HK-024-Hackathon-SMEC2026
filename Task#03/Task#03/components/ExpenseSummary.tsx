'use client'

import { Receipt } from '@/lib/types'
import { calculateMonthlySummary, generateAlerts, getSpendingTrend } from '@/lib/analytics'

interface ExpenseSummaryProps {
  receipts: Receipt[]
}

export default function ExpenseSummary({ receipts }: ExpenseSummaryProps) {
  const summary = calculateMonthlySummary(receipts)
  const alerts = generateAlerts(receipts)
  const trend = getSpendingTrend(receipts)

  const trendIcon = {
    up: '📈',
    down: '📉',
    stable: '➡️'
  }

  const trendColor = {
    up: 'text-red-600',
    down: 'text-green-600',
    stable: 'text-gray-600'
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">This Month</div>
          <div className="text-3xl font-bold text-gray-900">
            ${summary.total.toFixed(2)}
          </div>
          <div className={`text-sm mt-2 ${trendColor[trend]}`}>
            {trendIcon[trend]} {trend === 'up' ? 'Increased' : trend === 'down' ? 'Decreased' : 'Stable'} from last month
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Transactions</div>
          <div className="text-3xl font-bold text-gray-900">
            {summary.count}
          </div>
          <div className="text-sm text-gray-500 mt-2">
            {summary.month}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Avg per Receipt</div>
          <div className="text-3xl font-bold text-gray-900">
            ${summary.average.toFixed(2)}
          </div>
          <div className="text-sm text-gray-500 mt-2">
            Average spending
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Top Category</div>
          <div className="text-2xl font-bold text-gray-900">
            {Object.entries(summary.byCategory).length > 0
              ? Object.entries(summary.byCategory).sort(([, a], [, b]) => b - a)[0][0]
              : 'N/A'}
          </div>
          <div className="text-sm text-gray-500 mt-2">
            {Object.entries(summary.byCategory).length > 0
              ? `$${Object.entries(summary.byCategory).sort(([, a], [, b]) => b - a)[0][1].toFixed(2)}`
              : 'No data'}
          </div>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((alert, idx) => {
            const bgColor = {
              warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
              info: 'bg-blue-50 border-blue-200 text-blue-800',
              success: 'bg-green-50 border-green-200 text-green-800'
            }
            
            const icon = {
              warning: '⚠️',
              info: 'ℹ️',
              success: '✅'
            }

            return (
              <div key={idx} className={`border rounded-lg p-4 ${bgColor[alert.type]}`}>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{icon[alert.type]}</span>
                  <span className="font-medium">{alert.message}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Category Breakdown */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Spending by Category</h3>
        <div className="space-y-3">
          {Object.entries(summary.byCategory)
            .sort(([, a], [, b]) => b - a)
            .map(([category, amount]) => {
              const percentage = (amount / summary.total) * 100
              return (
                <div key={category}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{category}</span>
                    <span className="text-gray-900">${amount.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {percentage.toFixed(1)}% of total
                  </div>
                </div>
              )
            })}
        </div>
      </div>
    </div>
  )
}
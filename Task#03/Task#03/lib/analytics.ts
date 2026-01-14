import { Receipt } from './types';

export interface MonthlySummary {
  month: string
  total: number
  count: number
  average: number
  byCategory: Record<string, number>
}

export interface Alert {
  type: 'warning' | 'info' | 'success'
  message: string
}

export function calculateMonthlySummary(receipts: Receipt[]): MonthlySummary {
  const now = new Date()
  const currentMonth = now.toLocaleString('default', { month: 'long', year: 'numeric' })
  
  // Filter receipts from current month
  const monthReceipts = receipts.filter(r => {
    const receiptDate = new Date(r.date)
    return receiptDate.getMonth() === now.getMonth() && 
           receiptDate.getFullYear() === now.getFullYear()
  })
  
  const total = monthReceipts.reduce((sum, r) => sum + r.total, 0)
  const count = monthReceipts.length
  const average = count > 0 ? total / count : 0
  
  // Calculate by category
  const byCategory: Record<string, number> = {}
  monthReceipts.forEach(r => {
    byCategory[r.category] = (byCategory[r.category] || 0) + r.total
  })
  
  return {
    month: currentMonth,
    total,
    count,
    average,
    byCategory
  }
}

export function getCategoryBreakdown(receipts: Receipt[]): Array<{ name: string; value: number }> {
  const categoryTotals: Record<string, number> = {}
  
  receipts.forEach(r => {
    categoryTotals[r.category] = (categoryTotals[r.category] || 0) + r.total
  })
  
  return Object.entries(categoryTotals)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
}

export function getDailySpending(receipts: Receipt[]): Array<{ date: string; amount: number }> {
  const dailyTotals: Record<string, number> = {}
  
  receipts.forEach(r => {
    const date = new Date(r.date).toLocaleDateString()
    dailyTotals[date] = (dailyTotals[date] || 0) + r.total
  })
  
  return Object.entries(dailyTotals)
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-30) // Last 30 days
}

export function generateAlerts(receipts: Receipt[]): Alert[] {
  const alerts: Alert[] = []
  const summary = calculateMonthlySummary(receipts)
  
  // High spending alert
  if (summary.total > 1000) {
    alerts.push({
      type: 'warning',
      message: `High spending alert: You've spent $${summary.total.toFixed(2)} this month`
    })
  }
  
  // Frequent transactions
  if (summary.count > 50) {
    alerts.push({
      type: 'info',
      message: `You've made ${summary.count} transactions this month`
    })
  }
  
  // Category-specific alerts
  const topCategory = Object.entries(summary.byCategory)
    .sort(([, a], [, b]) => b - a)[0]
  
  if (topCategory && topCategory[1] > summary.total * 0.4) {
    alerts.push({
      type: 'info',
      message: `${topCategory[0]} is your highest spending category at $${topCategory[1].toFixed(2)}`
    })
  }
  
  // Positive feedback
  if (summary.count > 0 && summary.total < 500) {
    alerts.push({
      type: 'success',
      message: `Great job! Your spending is under control this month`
    })
  }
  
  return alerts
}

export function getSpendingTrend(receipts: Receipt[]): 'up' | 'down' | 'stable' {
  if (receipts.length < 2) return 'stable'
  
  const now = new Date()
  const currentMonth = receipts.filter(r => {
    const d = new Date(r.date)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  
  const lastMonth = receipts.filter(r => {
    const d = new Date(r.date)
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1)
    return d.getMonth() === lastMonthDate.getMonth() && d.getFullYear() === lastMonthDate.getFullYear()
  })
  
  const currentTotal = currentMonth.reduce((sum, r) => sum + r.total, 0)
  const lastTotal = lastMonth.reduce((sum, r) => sum + r.total, 0)
  
  if (lastTotal === 0) return 'stable'
  
  const change = ((currentTotal - lastTotal) / lastTotal) * 100
  
  if (change > 10) return 'up'
  if (change < -10) return 'down'
  return 'stable'
}
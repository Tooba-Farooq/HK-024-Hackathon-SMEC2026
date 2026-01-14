'use client'

import { useEffect, useState } from 'react'
import ExpenseSummary from '@/components/ExpenseSummary'
import SpendingChart from '@/components/SpendingChart'
import { Receipt } from '@/lib/types'

export default function Dashboard() {
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReceipts()
  }, [])

  const fetchReceipts = async () => {
    try {
      const res = await fetch('/api/receipts')
      const data = await res.json()
      setReceipts(data)
    } catch (error) {
      console.error('Failed to fetch receipts:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading your expenses...</div>
      </div>
    )
  }
return (
  <div className="bg-stone-100 min-h-screen p-6 rounded-xl text-sm">

    {/* Header */}
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-1 tracking-tight">
        Expense Dashboard
      </h1>
      <p className="text-slate-600 text-sm">
        Track and analyze your spending patterns
      </p>
    </div>

    {/* Summary */}
    <ExpenseSummary receipts={receipts} />

    {/* Chart */}
    <div className="mt-6">
      <SpendingChart receipts={receipts} />
    </div>

    {/* Recent Receipts */}
    <div className="mt-6 bg-gradient from-white to-stone-50 rounded-xl shadow-lg p-4 border border-stone-200">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">
        Recent Receipts
      </h2>

      {receipts.length === 0 ? (
        <div className="text-center py-6 text-slate-500 text-sm">
          No receipts yet.{" "}
          <a
            href="/"
            className="text-emerald-600 font-medium hover:underline"
          >
            Upload your first receipt
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {receipts.slice(0, 10).map((receipt, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center p-3 rounded-lg
                         bg-stone-100 hover:bg-stone-200/70
                         transition-all duration-200 text-sm"
            >
              {/* Left */}
              <div className="flex-1">
                <div className="font-medium text-slate-900 text-sm">
                  {receipt.merchant}
                </div>
                <div className="text-xs text-slate-500">
                  {receipt.date}
                </div>
              </div>

              {/* Right */}
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full">
                  {receipt.category}
                </span>

                <div className="text-base font-semibold text-slate-900">
                  ${receipt.total.toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
)
}
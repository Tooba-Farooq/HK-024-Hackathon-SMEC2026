'use client'

import { useState } from 'react'
import ReceiptUpload from '@/components/RecieptUpload'
import Dashboard from './dashboard/page'

export default function Home() {
  const [uploadedCount, setUploadedCount] = useState(0)
return (
  <div className="max-w-5xl mx-auto px-4 text-sm">

    {/* Header */}
    <div className="text-center mb-10">
      <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">
        Upload Your Receipts
      </h1>
      <p className="text-slate-600 max-w-2xl mx-auto text-sm">
        Scan and track your expenses automatically with
        <span className="text-emerald-600 font-medium"> AI-powered </span>
        receipt analysis
      </p>
    </div>

    {/* Upload Card */}
    <div className="bg-gradient from-white to-stone-50 rounded-xl shadow-lg p-6 mb-6 border border-stone-200">
      <ReceiptUpload
        onUploadSuccess={() => setUploadedCount((prev) => prev + 1)}
      />
    </div>

    {/* Dashboard */}
    <div className="mt-8">
      <Dashboard />
    </div>

  </div>
)
}
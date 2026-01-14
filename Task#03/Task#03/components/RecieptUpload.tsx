'use client'

import { useState, useRef } from 'react'
import { createWorker } from 'tesseract.js'

interface ReceiptUploadProps {
  onUploadSuccess: () => void
}

export default function ReceiptUpload({ onUploadSuccess }: ReceiptUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [ocrProgress, setOcrProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
    setError(null)
  }

  const performClientOCR = async (file: File): Promise<string> => {
    const worker = await createWorker('eng', 1, {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          setOcrProgress(Math.round(m.progress * 100))
        }
      }
    })
    
    try {
      const { data: { text } } = await worker.recognize(file)
      return text
    } finally {
      await worker.terminate()
    }
  }

  const handleUpload = async () => {
    if (!fileInputRef.current?.files?.[0]) {
      setError('Please select a file first')
      return
    }

    setUploading(true)
    setError(null)
    setOcrProgress(0)

    try {
      const file = fileInputRef.current.files[0]
      
      // Perform OCR on client side
      console.log('Starting OCR...')
      const extractedText = await performClientOCR(file)
      console.log('OCR completed:', extractedText)

      // Send extracted text to server for parsing
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text: extractedText,
          filename: file.name 
        })
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const result = await response.json()
      console.log('Receipt processed:', result)

      // Reset form
      setPreview(null)
      setOcrProgress(0)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      
      onUploadSuccess()
    } catch (err) {
      setError('Failed to process receipt. Please try again.')
      console.error('Upload error:', err)
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    
    if (file && file.type.startsWith('image/')) {
      if (fileInputRef.current) {
        const dataTransfer = new DataTransfer()
        dataTransfer.items.add(file)
        fileInputRef.current.files = dataTransfer.files
        
        const reader = new FileReader()
        reader.onload = (e) => {
          setPreview(e.target?.result as string)
        }
        reader.readAsDataURL(file)
        setError(null)
      }
    } else {
      setError('Please drop an image file')
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        {preview ? (
          <div className="space-y-4">
            <img src={preview} alt="Receipt preview" className="max-h-64 mx-auto rounded" />
            <p className="text-sm text-gray-600">Click to change image</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-4xl">📄</div>
            <p className="text-lg font-medium text-gray-700">
              Drop receipt image here or click to browse
            </p>
            <p className="text-sm text-gray-500">
              Supports JPG, PNG - OCR runs in your browser
            </p>
          </div>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {uploading && ocrProgress > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex justify-between text-sm text-blue-800 mb-2">
            <span>Processing receipt...</span>
            <span>{ocrProgress}%</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${ocrProgress}%` }}
            />
          </div>
        </div>
      )}

      {preview && (
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
        >
          {uploading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Processing...
            </span>
          ) : (
            'Upload & Scan Receipt'
          )}
        </button>
      )}
    </div>
  )
}
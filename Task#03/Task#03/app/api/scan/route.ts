import { NextResponse } from 'next/server'
import { parseReceipt } from '@/lib/parser'
import fs from 'fs/promises'
import path from 'path'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { text, filename } = body
    
    if (!text) {
      return NextResponse.json(
        { error: 'No text provided' },
        { status: 400 }
      )
    }

    console.log('Received OCR text:', text)
    
    // Parse receipt data
    const receipt = parseReceipt(text)

    // Save to receipts.json
    const dataPath = path.join(process.cwd(), 'data', 'receipts.json')
    
    // Ensure data directory exists
    const dataDir = path.join(process.cwd(), 'data')
    try {
      await fs.access(dataDir)
    } catch {
      await fs.mkdir(dataDir, { recursive: true })
    }

    // Read existing receipts or create new array
    let receipts = []
    try {
      const data = await fs.readFile(dataPath, 'utf-8')
      receipts = JSON.parse(data)
    } catch {
      // File doesn't exist yet
    }

    // Add new receipt
    receipts.push({
      ...receipt,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      rawText: text
    })

    // Save updated receipts
    await fs.writeFile(dataPath, JSON.stringify(receipts, null, 2))

    return NextResponse.json({
      success: true,
      receipt,
      message: 'Receipt processed successfully'
    })

  } catch (error) {
    console.error('Processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process receipt', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
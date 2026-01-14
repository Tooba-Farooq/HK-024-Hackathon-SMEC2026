import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const dataPath = path.join(process.cwd(), 'data', 'receipts.json')

// GET - Fetch all receipts
export async function GET(req: NextRequest) {
  try {
    // Ensure data directory exists
    const dataDir = path.join(process.cwd(), 'data')
    try {
      await fs.access(dataDir)
    } catch {
      await fs.mkdir(dataDir, { recursive: true })
      await fs.writeFile(dataPath, JSON.stringify([]))
    }

    // Read receipts
    let receipts = []
    try {
      const data = await fs.readFile(dataPath, 'utf-8')
      receipts = JSON.parse(data)
    } catch {
      // Return empty array if file doesn't exist
      await fs.writeFile(dataPath, JSON.stringify([]))
    }

    return NextResponse.json(receipts)
  } catch (error) {
    console.error('Error reading receipts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch receipts' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a receipt
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Receipt ID required' },
        { status: 400 }
      )
    }

    const data = await fs.readFile(dataPath, 'utf-8')
    let receipts = JSON.parse(data)
    
    receipts = receipts.filter((r: any) => r.id !== id)
    
    await fs.writeFile(dataPath, JSON.stringify(receipts, null, 2))

    return NextResponse.json({ success: true, message: 'Receipt deleted' })
  } catch (error) {
    console.error('Error deleting receipt:', error)
    return NextResponse.json(
      { error: 'Failed to delete receipt' },
      { status: 500 }
    )
  }
}
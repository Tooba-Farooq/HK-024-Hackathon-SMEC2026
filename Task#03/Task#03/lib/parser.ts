import { Receipt } from './types'

export function parseReceipt(text: string): Omit<Receipt, 'id' | 'timestamp'> {
  const lines = text.split('\n').filter(line => line.trim())
  
  // Extract date
  const date = extractDate(text)
  
  // Extract total
  const total = extractTotal(text)
  
  // Extract merchant
  const merchant = extractMerchant(lines)
  
  // Extract items
  const items = extractItems(text)
  
  // Categorize
  const category = categorizeReceipt(text)
  
  return {
    date,
    total,
    merchant,
    items,
    category
  }
}

function extractDate(text: string): string {
  // Try various date formats
  const patterns = [
    /(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/,           // MM-DD-YYYY or DD-MM-YYYY
    /(\d{4}[-/]\d{1,2}[-/]\d{1,2})/,             // YYYY-MM-DD
    /(\w+ \d{1,2},? \d{4})/,                     // Month DD, YYYY
    /(\d{1,2} \w+ \d{4})/                        // DD Month YYYY
  ]
  
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      return match[1]
    }
  }
  
  return new Date().toLocaleDateString()
}

function extractTotal(text: string): number {
  // Look for total amount
  const patterns = [
    /total[:\s]*\$?(\d+[.,]\d{2})/i,
    /amount[:\s]*\$?(\d+[.,]\d{2})/i,
    /balance[:\s]*\$?(\d+[.,]\d{2})/i,
    /\$(\d+[.,]\d{2})\s*$/m
  ]
  
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      return parseFloat(match[1].replace(',', '.'))
    }
  }
  
  // Fallback: find largest dollar amount
  const amounts = text.match(/\$?(\d+[.,]\d{2})/g)
  if (amounts && amounts.length > 0) {
    const numbers = amounts.map(a => parseFloat(a.replace(/[$,]/g, '')))
    return Math.max(...numbers)
  }
  
  return 0
}

function extractMerchant(lines: string[]): string {
  // Usually the merchant name is in the first few lines
  const firstLine = lines[0]?.trim()
  if (firstLine && firstLine.length > 2 && firstLine.length < 50) {
    return firstLine
  }
  
  // Look for common merchant indicators
  for (const line of lines.slice(0, 5)) {
    if (line.length > 3 && line.length < 40 && !/\d{2}[/-]\d{2}/.test(line)) {
      return line.trim()
    }
  }
  
  return 'Unknown Merchant'
}

function extractItems(text: string): string[] {
  const lines = text.split('\n')
  const items: string[] = []
  
  for (const line of lines) {
    // Look for lines with item and price pattern
    const itemPattern = /^(.+?)\s+\$?(\d+[.,]\d{2})$/
    const match = line.trim().match(itemPattern)
    
    if (match && match[1].length > 2 && match[1].length < 50) {
      items.push(match[1].trim())
    }
  }
  
  return items.slice(0, 10) // Limit to 10 items
}

function categorizeReceipt(text: string): string {
  const textLower = text.toLowerCase()
  
  const categories: Record<string, string[]> = {
    'Groceries': ['grocery', 'supermarket', 'market', 'food', 'produce', 'walmart', 'target', 'costco'],
    'Dining': ['restaurant', 'cafe', 'coffee', 'pizza', 'burger', 'dining', 'bar', 'grill'],
    'Transport': ['gas', 'fuel', 'uber', 'lyft', 'taxi', 'parking', 'station'],
    'Shopping': ['store', 'shop', 'retail', 'amazon', 'ebay', 'mall'],
    'Healthcare': ['pharmacy', 'medical', 'clinic', 'hospital', 'health', 'cvs', 'walgreens'],
    'Entertainment': ['cinema', 'movie', 'theater', 'game', 'ticket', 'concert'],
    'Utilities': ['electric', 'water', 'internet', 'phone', 'utility', 'bill']
  }
  
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => textLower.includes(keyword))) {
      return category
    }
  }
  
  return 'Other'
}
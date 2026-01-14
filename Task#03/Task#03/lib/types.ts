export interface Receipt {
  id: string
  date: string
  merchant: string
  total: number
  items: string[]
  category: string
  timestamp: string
  rawText?: string
}
import { createWorker } from 'tesseract.js'

export async function performOCR(imageBuffer: Buffer): Promise<string> {
  let worker;
  try {
    // Convert Buffer to base64 data URL
    const base64 = imageBuffer.toString('base64')
    const mimeType = detectMimeType(imageBuffer)
    const dataUrl = `data:${mimeType};base64,${base64}`
    
  
    worker = await createWorker('eng', 1, {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`)
        }
      },
      cachePath: '.',
      gzip: false,
    })
    
    const { data: { text } } = await worker.recognize(dataUrl)
    
    await worker.terminate()
    
    return text
  } catch (error) {
    if (worker) {
      await worker.terminate().catch(() => {})
    }
    console.error('OCR Error:', error)
    throw new Error('Failed to perform OCR on image')
  }
}

// Detect image mime type from buffer
function detectMimeType(buffer: Buffer): string {
  const signatures: Record<string, string> = {
    'ffd8ff': 'image/jpeg',
    '89504e': 'image/png',
    '474946': 'image/gif',
    '424d': 'image/bmp',
  }
  
  const hex = buffer.toString('hex', 0, 3)
  for (const [signature, mimeType] of Object.entries(signatures)) {
    if (hex.startsWith(signature)) {
      return mimeType
    }
  }
  
  return 'image/jpeg' // default
}

export async function performClientOCR(imageFile: File): Promise<string> {
  const worker = await createWorker('eng')
  
  try {
    const { data: { text } } = await worker.recognize(imageFile)
    return text
  } finally {
    await worker.terminate()
  }
}
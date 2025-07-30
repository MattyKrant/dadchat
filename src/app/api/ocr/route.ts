import { NextRequest, NextResponse } from 'next/server'
import Tesseract from 'tesseract.js'

export async function POST(request: NextRequest) {
  try {
    const { fileUrl, fileType, claimId } = await request.json()

    if (!fileUrl || !fileType || !claimId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    let extractedText = ''

    if (fileType.startsWith('image/')) {
      // Process image with Tesseract
      const { data: { text } } = await Tesseract.recognize(fileUrl, 'eng', {
        logger: m => console.log(m) // Optional: log progress
      })
      extractedText = text
    } else if (fileType === 'application/pdf') {
      // For PDF processing, we'd typically need pdf-parse or similar
      // For now, return an error asking user to convert to image
      return NextResponse.json(
        { error: 'PDF processing not yet implemented. Please upload an image of your claim document.' },
        { status: 400 }
      )
    } else {
      return NextResponse.json(
        { error: 'Unsupported file type' },
        { status: 400 }
      )
    }

    // Extract structured data from the text
    const extractedData = extractClaimData(extractedText)

    return NextResponse.json({
      success: true,
      extractedText,
      extractedData
    })
  } catch (error: any) {
    console.error('OCR processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process document' },
      { status: 500 }
    )
  }
}

function extractClaimData(text: string) {
  const data: any = {}
  
  // Extract patient name
  const nameMatch = text.match(/(?:patient|member|name)[:\s]+([A-Za-z\s]+)/i)
  if (nameMatch) {
    data.patientName = nameMatch[1].trim()
  }

  // Extract claim number
  const claimMatch = text.match(/(?:claim|reference|id)[#:\s]+([A-Z0-9-]+)/i)
  if (claimMatch) {
    data.claimNumber = claimMatch[1].trim()
  }

  // Extract insurance company
  const insuranceMatch = text.match(/(?:insurance|insurer|company)[:\s]+([A-Za-z\s&]+)/i)
  if (insuranceMatch) {
    data.insuranceCompany = insuranceMatch[1].trim()
  }

  // Extract denial reason
  const denialMatch = text.match(/(?:denied|rejection|reason)[:\s]+([A-Za-z\s,.-]+)/i)
  if (denialMatch) {
    data.denialReason = denialMatch[1].trim()
  }

  // Extract procedure code
  const procedureMatch = text.match(/(?:procedure|cpt|code)[:\s]+([0-9-]+)/i)
  if (procedureMatch) {
    data.procedureCode = procedureMatch[1].trim()
  }

  // Extract date
  const dateMatch = text.match(/(\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2})/i)
  if (dateMatch) {
    data.date = dateMatch[1].trim()
  }

  // If we couldn't extract specific fields, try to get general information
  if (Object.keys(data).length === 0) {
    // Extract first few meaningful lines as fallback
    const lines = text.split('\n').filter(line => line.trim().length > 10)
    if (lines.length > 0) {
      data.extractedText = lines.slice(0, 5).join(' ')
    }
  }

  return data
}
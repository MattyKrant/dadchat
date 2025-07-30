import { NextRequest, NextResponse } from 'next/server'
import jsPDF from 'jspdf'

export async function POST(request: NextRequest) {
  try {
    const { content, fileName } = await request.json()

    if (!content) {
      return NextResponse.json(
        { error: 'Missing content' },
        { status: 400 }
      )
    }

    // Create new PDF document
    const doc = new jsPDF()
    
    // Set font and size
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(12)
    
    // Split content into lines that fit the page width
    const lines = doc.splitTextToSize(content, 180) // 180mm width
    
    // Add text to PDF with proper line spacing
    let yPosition = 20
    const lineHeight = 7
    const pageHeight = 280 // A4 height minus margins
    
    for (let i = 0; i < lines.length; i++) {
      if (yPosition > pageHeight) {
        doc.addPage()
        yPosition = 20
      }
      
      doc.text(lines[i], 15, yPosition)
      yPosition += lineHeight
    }
    
    // Generate PDF as buffer
    const pdfBuffer = doc.output('arraybuffer')
    
    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName || 'appeal-letter.pdf'}"`,
      },
    })
  } catch (error: any) {
    console.error('PDF generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
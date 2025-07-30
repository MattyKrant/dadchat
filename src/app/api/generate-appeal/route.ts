import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { claimId, extractedData } = await request.json()

    if (!claimId || !extractedData) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Create a structured prompt for the appeal letter
    const prompt = createAppealPrompt(extractedData)

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a professional medical insurance appeal letter writer. Create formal, persuasive appeal letters that follow industry best practices. The letter should be professional, well-structured, and compelling while remaining factual and respectful.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.7,
    })

    const appealLetter = completion.choices[0]?.message?.content

    if (!appealLetter) {
      throw new Error('No response from OpenAI')
    }

    return NextResponse.json({
      success: true,
      appealLetter
    })
  } catch (error: any) {
    console.error('Letter generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate appeal letter' },
      { status: 500 }
    )
  }
}

function createAppealPrompt(extractedData: any): string {
  const {
    patientName = '[Patient Name]',
    claimNumber = '[Claim Number]',
    denialReason = '[Denial Reason]',
    insuranceCompany = '[Insurance Company]',
    date = '[Date]',
    procedureCode = '[Procedure Code]',
    procedureDescription = '[Procedure Description]',
    extractedText = ''
  } = extractedData

  return `
Please write a professional health insurance appeal letter with the following information:

Patient Name: ${patientName}
Claim Number: ${claimNumber}
Insurance Company: ${insuranceCompany}
Date of Service: ${date}
Procedure Code: ${procedureCode}
Procedure Description: ${procedureDescription}
Denial Reason: ${denialReason}
Additional Context: ${extractedText}

The letter should include:
1. A formal header with date and recipient information
2. Clear identification of the claim being appealed
3. A professional but assertive tone requesting reconsideration
4. Medical necessity justification (if applicable)
5. Request for specific action (claim approval and payment)
6. Professional closing with contact information placeholder
7. Proper formatting and structure

Make the letter compelling and professional, focusing on the medical necessity and any errors in the original denial decision. If specific medical information is limited, use general language about the importance of the treatment and request for reconsideration based on medical necessity.
`
}
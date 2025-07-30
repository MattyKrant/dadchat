'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import FileUpload from '@/components/FileUpload'

interface ClaimData {
  patientName?: string
  claimNumber?: string
  denialReason?: string
  insuranceCompany?: string
  date?: string
  procedureCode?: string
  procedureDescription?: string
  [key: string]: any
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [currentClaim, setCurrentClaim] = useState<any>(null)
  const [appealLetter, setAppealLetter] = useState<string>('')
  const [extractedData, setExtractedData] = useState<ClaimData>({})
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/signin')
        return
      }
      setUser(user)
      setLoading(false)
    }

    getUser()
  }, [router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleUploadComplete = async (fileUrl: string, fileName: string, fileType: string) => {
    if (!user) return

    try {
      // Save claim to database
      const { data, error } = await supabase
        .from('claims')
        .insert({
          user_id: user.id,
          file_name: fileName,
          file_url: fileUrl,
          file_type: fileType,
          status: 'uploaded'
        })
        .select()
        .single()

      if (error) throw error

      setCurrentClaim(data)
      
      // Start OCR processing
      await processOCR(fileUrl, fileType, data.id)
    } catch (error: any) {
      alert('Error saving claim: ' + error.message)
    }
  }

  const processOCR = async (fileUrl: string, fileType: string, claimId: string) => {
    setProcessing(true)
    
    try {
      const response = await fetch('/api/ocr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileUrl,
          fileType,
          claimId
        }),
      })

      if (!response.ok) {
        throw new Error('OCR processing failed')
      }

      const result = await response.json()
      setExtractedData(result.extractedData)
      
      // Update claim with OCR data
      await supabase
        .from('claims')
        .update({
          ocr_data: result.extractedData,
          status: 'processing'
        })
        .eq('id', claimId)

    } catch (error: any) {
      alert('Error processing OCR: ' + error.message)
      await supabase
        .from('claims')
        .update({ status: 'error' })
        .eq('id', claimId)
    } finally {
      setProcessing(false)
    }
  }

  const generateAppealLetter = async () => {
    if (!currentClaim || !extractedData) return

    setProcessing(true)
    
    try {
      const response = await fetch('/api/generate-appeal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          claimId: currentClaim.id,
          extractedData
        }),
      })

      if (!response.ok) {
        throw new Error('Letter generation failed')
      }

      const result = await response.json()
      setAppealLetter(result.appealLetter)
      
      // Update claim with generated letter
      await supabase
        .from('claims')
        .update({
          appeal_letter: result.appealLetter,
          status: 'completed'
        })
        .eq('id', currentClaim.id)

    } catch (error: any) {
      alert('Error generating appeal letter: ' + error.message)
    } finally {
      setProcessing(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(appealLetter)
      alert('Appeal letter copied to clipboard!')
    } catch (error) {
      alert('Failed to copy to clipboard')
    }
  }

  const downloadAsPDF = async () => {
    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: appealLetter,
          fileName: `appeal-letter-${currentClaim?.id || 'document'}.pdf`
        }),
      })

      if (!response.ok) {
        throw new Error('PDF generation failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `appeal-letter-${currentClaim?.id || 'document'}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error: any) {
      alert('Error generating PDF: ' + error.message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">ClaimAppeal AI</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Welcome, {user?.email}</span>
              <button
                onClick={handleSignOut}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Upload Section */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Upload Denied Claim Document
                </h3>
                <FileUpload
                  onUploadComplete={handleUploadComplete}
                  onUploadStart={() => setProcessing(true)}
                />
                
                {processing && (
                  <div className="mt-4 text-center">
                    <div className="inline-flex items-center px-4 py-2 border border-transparent text-sm leading-5 font-medium rounded-md text-blue-700 bg-blue-100">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing document...
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Extracted Data Section */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Extracted Information
                </h3>
                {Object.keys(extractedData).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(extractedData).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="font-medium text-gray-700 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}:
                        </span>
                        <span className="text-gray-900">{value as string}</span>
                      </div>
                    ))}
                    <button
                      onClick={generateAppealLetter}
                      disabled={processing || !!appealLetter}
                      className="w-full mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md font-medium"
                    >
                      {processing ? 'Generating...' : 'Generate Appeal Letter'}
                    </button>
                  </div>
                ) : (
                  <p className="text-gray-500">Upload a document to extract information</p>
                )}
              </div>
            </div>
          </div>

          {/* Appeal Letter Section */}
          {appealLetter && (
            <div className="mt-6 bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Generated Appeal Letter
                  </h3>
                  <div className="space-x-2">
                    <button
                      onClick={copyToClipboard}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Copy to Clipboard
                    </button>
                    <button
                      onClick={downloadAsPDF}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Download PDF
                    </button>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                  <pre className="whitespace-pre-wrap text-sm text-gray-900 font-mono">
                    {appealLetter}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
'use client'

import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface FileUploadProps {
  onUploadComplete: (fileUrl: string, fileName: string, fileType: string) => void
  onUploadStart: () => void
}

export default function FileUpload({ onUploadComplete, onUploadStart }: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const file = files[0]
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `claims/${fileName}`

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a PDF or image file (JPG, PNG)')
      return
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB')
      return
    }

    setUploading(true)
    onUploadStart()

    try {
      const { data, error } = await supabase.storage
        .from('claim-documents')
        .upload(filePath, file)

      if (error) {
        throw error
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('claim-documents')
        .getPublicUrl(filePath)

      onUploadComplete(publicUrl, file.name, file.type)
    } catch (error: any) {
      alert(error.message)
    } finally {
      setUploading(false)
    }
  }, [onUploadComplete, onUploadStart])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }, [handleFiles])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files)
    }
  }, [handleFiles])

  return (
    <div className="w-full">
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 ${
          dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        } transition-colors`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleChange}
          accept=".pdf,.jpg,.jpeg,.png"
          disabled={uploading}
        />
        
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="mt-4">
            <label htmlFor="file-upload" className="cursor-pointer">
              <span className="mt-2 block text-sm font-medium text-gray-900">
                {uploading ? 'Uploading...' : 'Upload your denied claim document'}
              </span>
              <span className="mt-2 block text-xs text-gray-500">
                PDF, JPG, PNG up to 10MB
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
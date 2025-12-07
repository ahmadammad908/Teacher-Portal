'use client'

import FileUpload from '../components/FileUpload'
import { CheckCircle, AlertCircle } from 'lucide-react'
import ProtectedRoute from '../components/ProtectedRoute'
import { useState } from 'react'

export default function UploadPage() {
  const [uploadSuccess, setUploadSuccess] = useState(false)

  const handleUploadComplete = () => {
    setUploadSuccess(true)
    setTimeout(() => setUploadSuccess(false), 5000)
  }

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Upload Documents</h1>
          <p className="text-gray-600">
            Upload PDFs, presentations, documents, and images. 
            Files are securely stored and accessible from anywhere.
          </p>
        </div>

        {uploadSuccess && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            File uploaded successfully!
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <FileUpload onUploadComplete={handleUploadComplete} />
        </div>

        <div className="mt-8 p-6 bg-blue-50 rounded-xl">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900 mb-2">Upload Guidelines</h3>
              <ul className="text-blue-800 space-y-1 list-disc pl-5">
                <li>Maximum file size: 50MB</li>
                <li>Supported formats: PDF, PPT, PPTX, DOC, DOCX, TXT, Images</li>
                <li>Files are encrypted during transfer</li>
                <li>You can delete files anytime</li>
                <li>Download count is unlimited</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
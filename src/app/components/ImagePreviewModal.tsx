'use client'

import { useState, useEffect } from 'react'
import { Document } from '../../../types/index'
import { X, Maximize2, Minimize2, Download, ExternalLink, RotateCw } from 'lucide-react'

interface PDFViewerModalProps {
  document: Document
  onClose: () => void
}

export default function PDFViewerModal({ document, onClose }: PDFViewerModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [loading, setLoading] = useState(true)
  
  // Generate Google Docs viewer URL
  const getGoogleDocsUrl = () => {
    return `https://docs.google.com/viewer?url=${encodeURIComponent(document.download_url)}&embedded=true`
  }

  // Generate Microsoft Office viewer URL
  const getOfficeViewerUrl = () => {
    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(document.download_url)}`
  }

  // Get appropriate viewer based on file type
  const getViewerUrl = () => {
    if (document.file_type.includes('pdf')) {
      return getGoogleDocsUrl()
    } else if (document.file_type.includes('presentation') || document.file_type.includes('powerpoint')) {
      return getOfficeViewerUrl()
    } else if (document.file_type.includes('word') || document.file_type.includes('msword')) {
      return getOfficeViewerUrl()
    } else if (document.file_type.includes('excel') || document.file_type.includes('spreadsheet')) {
      return getOfficeViewerUrl()
    }
    return document.download_url
  }

  const viewerUrl = getViewerUrl()

  const handleDownload = async () => {
    try {
      const response = await fetch(document.download_url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = globalThis.document.createElement('a')
      link.href = url
      link.download = document.file_name
      globalThis.document.body.appendChild(link)
      link.click()
      window.URL.revokeObjectURL(url)
      globalThis.document.body.removeChild(link)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  const toggleFullscreen = () => {
    if (!globalThis.document.fullscreenElement) {
      globalThis.document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      if (globalThis.document.exitFullscreen) {
        globalThis.document.exitFullscreen()
      }
      setIsFullscreen(false)
    }
  }

  // Handle escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className={`bg-white rounded-lg shadow-2xl flex flex-col w-full h-full max-w-7xl
        ${isFullscreen ? 'rounded-none' : ''}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="bg-red-100 p-2 rounded-lg flex-shrink-0">
              <span className="text-red-600 font-bold text-sm">PDF</span>
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-sm sm:text-base truncate" title={document.file_name}>
                {document.file_name}
              </h3>
              <p className="text-xs text-gray-500 truncate">
                Live Preview • Click outside to close
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            <button
              onClick={() => setRotation(prev => (prev + 90) % 360)}
              className="p-2 hover:bg-gray-100 rounded-md"
              title="Rotate"
            >
              <RotateCw className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2 hover:bg-gray-100 rounded-md"
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <Maximize2 className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </button>
            <button
              onClick={handleDownload}
              className="p-2 hover:bg-gray-100 rounded-md"
              title="Download"
            >
              <Download className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-md"
              title="Close"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 overflow-hidden bg-gray-100 relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-600">Loading document preview...</p>
              </div>
            </div>
          )}

          <div className="h-full w-full">
            <iframe
              src={viewerUrl}
              title={`${document.file_name} - Live Preview`}
              className="w-full h-full border-0"
              onLoad={() => setLoading(false)}
              style={{ transform: `rotate(${rotation}deg)` }}
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              allow="fullscreen"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t bg-gray-50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="text-xs text-gray-500">
              <span className="hidden sm:inline">Tip: </span>
              Use the toolbar in the viewer for navigation, zoom, and search
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => window.open(document.download_url, '_blank')}
                className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Open in new tab
              </button>
              <div className="text-xs text-gray-400">
                Press ESC to close
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
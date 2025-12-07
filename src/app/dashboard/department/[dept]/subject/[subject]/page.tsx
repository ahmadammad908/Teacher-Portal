// app/dashboard/department/[dept]/subject/[subject]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '../../../../../../../lib/supabase/client'
import { 
  Building, BookOpen, Hash, File, Download, ChevronLeft, Search, 
  Calendar, User, Tag, Eye, ExternalLink, Filter, Clock, CheckCircle
} from 'lucide-react'
import PDFViewerModal from '../../../../../components/ImagePreviewModal'

interface Document {
  id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  file_extension: string;
  lecture_no: number;
  lecture_order: number;
  department: string;
  subject_name: string;
  teacher_name: string;
  uploaded_at: string;
  download_url: string;
  tags: string[];
  department_order: number;
  subject_order: number;
  full_sequence: string;
}

interface LectureGroup {
  number: number;
  count: number;
  documents: Document[];
}

// Inline LoadingSpinner component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-4 text-gray-600 font-medium">Loading subject details...</p>
    </div>
  </div>
)

export default function SubjectPage() {
  const params = useParams()
  const router = useRouter()
  const department = decodeURIComponent(params.dept as string)
  const subject = decodeURIComponent(params.subject as string)
  
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [teacher, setTeacher] = useState('')
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    if (department && subject) {
      fetchSubjectDocuments()
    }
  }, [department, subject])

  const fetchSubjectDocuments = async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .eq('department', department)
        .eq('subject_name', subject)
        .order('lecture_order', { ascending: true })

      if (error) throw error
      setDocuments(data || [])
      
      // Extract teacher from first document
      if (data && data.length > 0) {
        setTeacher(data[0].teacher_name || '')
      }
      
    } catch (error) {
      console.error('Error fetching documents:', error)
    } finally {
      setLoading(false)
    }
  }

  // Group documents by lecture number
  const lectures: LectureGroup[] = Array.from(new Set(documents.map(doc => doc.lecture_no)))
    .sort((a, b) => a - b)
    .map(lectureNo => {
      const lectureDocs = documents.filter(doc => doc.lecture_no === lectureNo)
      return {
        number: lectureNo,
        count: lectureDocs.length,
        documents: lectureDocs.sort((a, b) => a.lecture_order - b.lecture_order)
      }
    })

  // Filter lectures based on search
  const filteredLectures = lectures.filter(lecture => 
    lecture.number.toString().includes(searchTerm) ||
    lecture.documents.some(doc => 
      doc.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  )

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    const iconMap: { [key: string]: string } = {
      'pdf': '📕', 'ppt': '📊', 'pptx': '📊', 'doc': '📄', 'docx': '📄',
      'txt': '📝', 'png': '🖼️', 'jpg': '🖼️', 'jpeg': '🖼️', 'gif': '🖼️',
      'xls': '📊', 'xlsx': '📊', 'zip': '📦', 'rar': '📦', 'mp4': '🎬',
      'mp3': '🎵', 'wav': '🎵', 'csv': '📊', 'html': '🌐', 'js': '📜',
      'ts': '📜', 'json': '📜'
    }
    return iconMap[ext || ''] || '📎'
  }

  // Check if file is previewable
  const isPreviewable = (fileType: string) => {
    if (!fileType) return false
    const previewableTypes = [
      'application/pdf',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/png',
      'image/jpeg',
      'image/gif'
    ]
    return previewableTypes.some(type => fileType.includes(type))
  }

  const handlePreview = (doc: Document) => {
    setSelectedDocument(doc)
    setShowPreview(true)
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile Navigation Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 lg:hidden">
        <div className="px-4 py-3">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.push(`/dashboard/department/${encodeURIComponent(department)}`)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <Building className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{department}</span>
              </div>
              <h1 className="text-sm font-semibold text-gray-900 truncate">{subject}</h1>
            </div>
            {teacher && (
              <div className="flex items-center space-x-1 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                <User className="h-3 w-3 flex-shrink-0" />
                <span className="truncate max-w-[80px]">{teacher}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Navigation Bar */}
      <div className="hidden lg:block sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push(`/dashboard/department/${encodeURIComponent(department)}`)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <ChevronLeft className="h-5 w-5" />
                <span className="text-sm font-medium">Back to Department</span>
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Building className="h-4 w-4" />
                <span>{department}</span>
                <ChevronLeft className="h-3 w-3 rotate-180" />
                <BookOpen className="h-4 w-4" />
                <span className="font-medium">{subject}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        {/* Header Section - Mobile */}
        <div className="lg:hidden mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex flex-col space-y-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">{subject}</h1>
                <div className="flex flex-wrap gap-2">
                  {teacher && (
                    <div className="flex items-center space-x-1 text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
                      <User className="h-4 w-4" />
                      <span className="text-sm font-medium">{teacher}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1 text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
                    <Building className="h-4 w-4" />
                    <span className="text-sm font-medium">{department}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Header Section - Desktop */}
        <div className="hidden lg:block mb-8">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm">
              <BookOpen className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{subject}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {teacher && (
                  <div className="flex items-center space-x-2 text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
                    <User className="h-4 w-4" />
                    <span className="text-sm font-medium">{teacher}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2 text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
                  <Building className="h-4 w-4" />
                  <span className="text-sm font-medium">{department}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6 lg:mb-8">
          <div className="bg-white rounded-xl lg:rounded-2xl shadow-sm border border-gray-200 p-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search lectures, files, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg lg:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Lectures Count */}
        <div className="mb-4 lg:mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg lg:text-xl font-bold text-gray-900">Lectures</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>{filteredLectures.length} lecture{filteredLectures.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>

        {/* Lectures Section */}
        <div className="space-y-4 lg:space-y-6">
          {filteredLectures.length > 0 ? (
            filteredLectures.map((lecture) => (
              <div key={lecture.number} className="bg-white rounded-xl lg:rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Lecture Header */}
                <div className="bg-gradient-to-r from-gray-50 to-blue-50/50 px-4 lg:px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 lg:space-x-4">
                      <div className="p-2 lg:p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg lg:rounded-xl shadow-sm">
                        <Hash className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-base lg:text-lg font-bold text-gray-900">
                          Lecture {lecture.number.toString().padStart(2, '0')}
                        </h3>
                        <p className="text-xs lg:text-sm text-gray-600 mt-0.5">
                          {lecture.count} file{lecture.count !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    
                    <div className="hidden lg:block text-right">
                      <div className="text-sm font-medium text-gray-500">Sequence</div>
                      <div className="text-sm font-semibold text-gray-900">
                        {lecture.documents[0]?.full_sequence || 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Files List */}
                <div className="divide-y divide-gray-100">
                  {lecture.documents.map((doc, idx) => (
                    <div key={doc.id} className="px-4 lg:px-6 py-4 hover:bg-gray-50/50 transition-colors duration-150">
                      {/* Mobile Layout */}
                      <div className="lg:hidden space-y-3">
                        {/* Top Row: Icon + File Name + Actions */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1 min-w-0">
                            <div className="text-2xl pt-1">
                              {getFileIcon(doc.file_name)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 text-sm mb-1 truncate">
                                {doc.file_name}
                              </h4>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            {/* Preview Button Mobile */}
                            {isPreviewable(doc.file_type) && (
                              <button
                                onClick={() => handlePreview(doc)}
                                className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                                title="Preview"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            )}
                            {/* Download Button Mobile */}
                            <a
                              href={doc.download_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                              title="Download"
                            >
                              <Download className="h-4 w-4" />
                            </a>
                          </div>
                        </div>

                        {/* File Details */}
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                          <div className="flex items-center space-x-1">
                            <File className="h-3 w-3" />
                            <span>{formatFileSize(doc.file_size)}</span>
                          </div>
                          <div className="text-right">
                            <span className="bg-gray-100 px-2 py-1 rounded font-medium">
                              {doc.file_extension?.toUpperCase() || 'FILE'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1 col-span-2">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(doc.uploaded_at)}</span>
                          </div>
                        </div>

                        {/* Tags */}
                        {doc.tags && doc.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-2">
                            {doc.tags.slice(0, 2).map((tag, tagIdx) => (
                              <span 
                                key={tagIdx}
                                className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                            {doc.tags.length > 2 && (
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                +{doc.tags.length - 2} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Desktop Layout */}
                      <div className="hidden lg:flex lg:items-start lg:justify-between lg:space-x-4">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="text-2xl pt-1">
                            {getFileIcon(doc.file_name)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-900 text-base mb-2 truncate">
                                  {doc.file_name}
                                </h4>
                                
                                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-3">
                                  <span className="flex items-center space-x-1">
                                    <File className="h-3.5 w-3.5" />
                                    <span>{formatFileSize(doc.file_size)}</span>
                                  </span>
                                  <span className="bg-gray-100 px-2.5 py-1 rounded-lg font-medium">
                                    {doc.file_extension?.toUpperCase() || 'UNKNOWN'}
                                  </span>
                                  <span className="flex items-center space-x-1">
                                    <Calendar className="h-3.5 w-3.5" />
                                    <span>{formatDateTime(doc.uploaded_at)}</span>
                                  </span>
                                </div>
                                
                                {doc.tags && doc.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-2">
                                    {doc.tags.slice(0, 4).map((tag, tagIdx) => (
                                      <span 
                                        key={tagIdx}
                                        className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg font-medium"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                    {doc.tags.length > 4 && (
                                      <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg font-medium">
                                        +{doc.tags.length - 4} more
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {/* Preview Button Desktop */}
                          {isPreviewable(doc.file_type) && (
                            <button
                              onClick={() => handlePreview(doc)}
                              className="px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-medium flex items-center space-x-2 transition-all duration-200 shadow-sm hover:shadow"
                              title="Preview File"
                            >
                              <Eye className="h-4 w-4" />
                              <span>Preview</span>
                            </button>
                          )}
                          
                          {/* Download Button Desktop */}
                          <a
                            href={doc.download_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-medium flex items-center space-x-2 transition-all duration-200 shadow-sm hover:shadow"
                            title="Download File"
                          >
                            <Download className="h-4 w-4" />
                            <span>Download</span>
                          </a>
                          
                          {/* Open in New Tab Desktop */}
                          <a
                            href={doc.download_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl flex items-center justify-center transition-colors duration-200"
                            title="Open in New Tab"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl lg:rounded-2xl shadow-sm border border-gray-200 p-8 lg:p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="p-4 bg-gray-100 rounded-xl inline-flex mb-4 lg:mb-6">
                  <Hash className="h-8 w-8 lg:h-12 lg:w-12 text-gray-400" />
                </div>
                <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2">
                  {searchTerm ? 'No matching lectures found' : 'No lectures available'}
                </h3>
                <p className="text-sm lg:text-base text-gray-600 mb-6">
                  {searchTerm 
                    ? 'Try adjusting your search terms'
                    : 'This subject does not have any lectures uploaded yet.'}
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg lg:rounded-xl font-medium hover:bg-blue-700 transition-colors duration-200"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* PDF Preview Modal */}
      {showPreview && selectedDocument && (
        <PDFViewerModal
          document={{
            ...selectedDocument,
            user_id: selectedDocument.user_id || '',
            file_path: selectedDocument.file_path || selectedDocument.download_url || ''
          }}
          onClose={() => {
            setShowPreview(false)
            setSelectedDocument(null)
          }}
        />
      )}
    </div>
  )
}
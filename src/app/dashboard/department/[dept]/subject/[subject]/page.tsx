// app/dashboard/department/[dept]/subject/[subject]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '../../../../../../../lib/supabase/client'
import { 
  Building, BookOpen, Hash, File, Download, ChevronLeft, Search, 
  Calendar, User, Tag, Eye, ExternalLink 
} from 'lucide-react'
import PDFViewerModal from '../../../../../components/ImagePreviewModal'

export default function SubjectPage() {
  const params = useParams()
  const router = useRouter()
  const department = decodeURIComponent(params.dept as string)
  const subject = decodeURIComponent(params.subject as string)
  
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [teacher, setTeacher] = useState('')
  const [selectedDocument, setSelectedDocument] = useState<any>(null)
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
  const lectures = Array.from(new Set(documents.map(doc => doc.lecture_no)))
    .sort((a, b) => a - b)
    .map(lectureNo => {
      const lectureDocs = documents.filter(doc => doc.lecture_no === lectureNo)
      return {
        number: lectureNo,
        count: lectureDocs.length,
        documents: lectureDocs
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    const iconMap: { [key: string]: string } = {
      'pdf': '📕', 'ppt': '📊', 'pptx': '📊', 'doc': '📄', 'docx': '📄',
      'txt': '📝', 'png': '🖼️', 'jpg': '🖼️', 'jpeg': '🖼️', 'gif': '🖼️',
      'xls': '📊', 'xlsx': '📊', 'zip': '📦', 'rar': '📦'
    }
    return iconMap[ext || ''] || '📎'
  }

  // Check if file is previewable
  const isPreviewable = (fileType: string) => {
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
    return previewableTypes.some(type => fileType?.includes(type))
  }

  const handlePreview = (doc: any) => {
    setSelectedDocument(doc)
    setShowPreview(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push(`/dashboard/department/${encodeURIComponent(department)}`)}
                className="p-2 hover:bg-green-700 rounded-lg transition-colors"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <div>
                <div className="flex items-center space-x-2">
                  <Building className="h-5 w-5 text-green-200" />
                  <span className="text-green-200">{department}</span>
                  <ChevronLeft className="h-4 w-4 rotate-180 text-green-200" />
                  <BookOpen className="h-5 w-5 text-green-200" />
                </div>
                <h1 className="text-3xl font-bold mt-2">{subject}</h1>
                {teacher && (
                  <p className="text-green-100 mt-1 flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    {teacher}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats and Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{documents.length}</div>
                <div className="text-sm text-gray-600">Total Files</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{lectures.length}</div>
                <div className="text-sm text-gray-600">Lectures</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(documents.reduce((acc, doc) => acc + doc.file_size, 0) / (1024 * 1024 * documents.length) || 0)}
                </div>
                <div className="text-sm text-gray-600">Avg Size (MB)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {new Set(documents.map(d => d.file_extension)).size}
                </div>
                <div className="text-sm text-gray-600">File Types</div>
              </div>
            </div>
            
            <div className="md:w-1/3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search lectures or files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lectures List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="space-y-6">
          {filteredLectures.map((lecture) => (
            <div key={lecture.number} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              {/* Lecture Header */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Hash className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">
                        Lecture {lecture.number.toString().padStart(2, '0')}
                      </h3>
                      <p className="text-gray-600">
                        {lecture.count} file{lecture.count !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-purple-600">
                      Sequence: {
                        lecture.documents[0]?.full_sequence || 
                        `${documents[0]?.department_order || 0}_${documents[0]?.subject_order || 0}_${lecture.number}`
                      }
                    </div>
                  </div>
                </div>
              </div>

              {/* Files List */}
              <div className="divide-y divide-gray-100">
                {lecture.documents.map((doc, idx) => (
                  <div key={doc.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start space-x-4">
                      <div className="text-3xl pt-1">
                        {getFileIcon(doc.file_name)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-800">{doc.file_name}</h4>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                              <span className="flex items-center">
                                <File className="h-4 w-4 mr-1" />
                                {formatFileSize(doc.file_size)}
                              </span>
                              <span className="bg-gray-100 px-2 py-1 rounded">
                                {doc.file_extension?.toUpperCase() || 'FILE'}
                              </span>
                              <span className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {formatDate(doc.uploaded_at)}
                              </span>
                            </div>
                            
                            {doc.tags && doc.tags.length > 0 && (
                              <div className="flex items-center mt-3">
                                <Tag className="h-4 w-4 text-gray-400 mr-2" />
                                <div className="flex flex-wrap gap-2">
                                  {doc.tags.slice(0, 3).map((tag: string, tagIdx: number) => (
                                    <span 
                                      key={tagIdx}
                                      className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                  {doc.tags.length > 3 && (
                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                      +{doc.tags.length - 3} more
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex space-x-2">
                            {/* Preview Button */}
                            {isPreviewable(doc.file_type) && (
                              <button
                                onClick={() => handlePreview(doc)}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                                title="Preview File"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Preview
                              </button>
                            )}
                            
                            {/* Download Button */}
                            <a
                              href={doc.download_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                              title="Download File"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </a>
                            
                            {/* Open in New Tab */}
                            <a
                              href={doc.download_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center"
                              title="Open in New Tab"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {filteredLectures.length === 0 && (
          <div className="text-center py-12">
            <Hash className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700">No lectures found</h3>
            <p className="text-gray-600 mt-2">
              {searchTerm ? 'Try a different search term' : 'No lectures available for this subject'}
            </p>
          </div>
        )}
      </div>

      {/* PDF Preview Modal */}
      {showPreview && selectedDocument && (
        <PDFViewerModal
          document={selectedDocument}
          onClose={() => {
            setShowPreview(false)
            setSelectedDocument(null)
          }}
        />
      )}
    </div>
  )
}
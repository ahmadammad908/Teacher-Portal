// app/dashboard/department/[dept]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '../../../../../lib/supabase/client'
import { BookOpen, ChevronLeft, Search, User, FileText } from 'lucide-react'
import Link from 'next/link'

export default function DepartmentPage() {
  const params = useParams()
  const router = useRouter()
  const department = decodeURIComponent(params.dept as string)
  
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (department) {
      fetchDepartmentDocuments()
    }
  }, [department])

  const fetchDepartmentDocuments = async () => {
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
        .order('subject_order', { ascending: true })
        .order('lecture_order', { ascending: true })

      if (error) throw error
      setDocuments(data || [])
      
    } catch (error) {
      console.error('Error fetching documents:', error)
    } finally {
      setLoading(false)
    }
  }

  // Get unique subjects in this department
  const subjects = Array.from(new Set(documents.map(doc => doc.subject_name)))
    .map(subject => {
      const subjectDocs = documents.filter(doc => doc.subject_name === subject)
      const teacher = subjectDocs[0]?.teacher_name || ''
      const lectures = Array.from(new Set(subjectDocs.map(doc => doc.lecture_no)))
        .filter(lecture => lecture !== null && !isNaN(lecture))
        .sort((a, b) => a - b) as number[]
      
      return {
        name: subject,
        teacher,
        count: subjectDocs.length,
        lectures
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name))

  // Filter subjects based on search
  const filteredSubjects = subjects.filter(subject => 
    subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.teacher.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Helper function to format lecture range
  const getLectureRange = (lectures: number[]) => {
    if (lectures.length === 0) return 'No lectures'
    if (lectures.length === 1) return `Lecture ${lectures[0]}`
    return `Lecture ${Math.min(...lectures)} - ${Math.max(...lectures)}`
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
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Go back"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 truncate max-w-[200px] sm:max-w-none">
                  {department}
                </h1>
                <p className="text-sm text-gray-500 truncate">
                  {subjects.length} {subjects.length === 1 ? 'subject' : 'subjects'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Search Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search subjects or teachers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 text-base placeholder-gray-500 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <span className="text-sm text-gray-500 hover:text-gray-700">
                  Clear
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Summary */}
        <div className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Subjects</p>
                  <p className="text-2xl font-bold text-gray-900">{subjects.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <FileText className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Files</p>
                  <p className="text-2xl font-bold text-gray-900">{documents.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <User className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Teachers</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Array.from(new Set(subjects.map(s => s.teacher).filter(Boolean))).length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Subjects Grid */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Subjects {searchTerm && `(${filteredSubjects.length} found)`}
          </h2>
          
          {filteredSubjects.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredSubjects.map((subject, index) => (
                <Link 
                  href={`/dashboard/department/${encodeURIComponent(department)}/subject/${encodeURIComponent(subject.name)}`}
                  key={index}
                  className="block group"
                >
                  <div className="bg-white rounded-lg border border-gray-200 p-5 hover:border-blue-300 hover:shadow-md transition-all duration-200 h-full">
                    <div className="flex flex-col h-full">
                      {/* Subject Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-3 flex-1 min-w-0">
                          <div className="flex-shrink-0">
                            <div className="p-2.5 bg-blue-50 rounded-lg">
                              <BookOpen className="h-5 w-5 text-blue-600" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 text-lg leading-tight truncate">
                              {subject.name}
                            </h3>
                            {subject.teacher && (
                              <p className="text-sm text-gray-600 truncate mt-1">
                                <span className="font-medium">Teacher:</span> {subject.teacher}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Subject Details */}
                      <div className="space-y-4 flex-1">
                        {/* Lecture Range */}
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 font-medium">Lecture Range:</span>
                          <span className="font-semibold text-purple-700">
                            {getLectureRange(subject.lectures)}
                          </span>
                        </div>

                        {/* Files Count */}
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 font-medium">Total Files:</span>
                          <span className="font-semibold text-blue-700">
                            {subject.count} {subject.count === 1 ? 'file' : 'files'}
                          </span>
                        </div>

                        {/* Available Lectures */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600 font-medium">
                              Available Lectures:
                            </span>
                            <span className="text-xs text-gray-500">
                              {subject.lectures.length} total
                            </span>
                          </div>
                          {subject.lectures.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {subject.lectures.slice(0, 6).map(lecture => (
                                <span 
                                  key={lecture}
                                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                                >
                                  {lecture}
                                </span>
                              ))}
                              {subject.lectures.length > 6 && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  +{subject.lectures.length - 6}
                                </span>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 italic">No lectures available</p>
                          )}
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="pt-4 mt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">
                            Click to view details
                          </span>
                          <div className="flex items-center text-blue-600 text-sm font-medium group-hover:text-blue-700">
                            View
                            <ChevronLeft className="h-4 w-4 ml-1 rotate-180 transform group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No subjects found
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {searchTerm 
                  ? `No subjects matching "${searchTerm}" were found. Try a different search term.`
                  : 'No subjects are available in this department.'
                }
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Back to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-4 right-4 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors z-20"
        aria-label="Scroll to top"
      >
        <ChevronLeft className="h-5 w-5 rotate-90" />
      </button>
    </div>
  )
}
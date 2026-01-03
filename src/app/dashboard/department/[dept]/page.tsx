// app/dashboard/department/[dept]/page.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '../../../../../lib/supabase/client'
import { BookOpen, ChevronLeft, Search, User, FileText, X, ArrowRight, Trash2, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function DepartmentPage() {
  const params = useParams()
  const router = useRouter()
  const department = decodeURIComponent(params.dept as string)
  
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const subjectRefs = useRef<{[key: string]: HTMLDivElement | null}>({})

  // Fetch current user on component mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)
    }
    fetchCurrentUser()
  }, [])

  useEffect(() => {
    if (department) {
      fetchDepartmentDocuments()
    }
  }, [department])

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Scroll to selected subject when it changes
  useEffect(() => {
    if (selectedSubject && subjectRefs.current[selectedSubject]) {
      const element = subjectRefs.current[selectedSubject]
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center'
        })
        
        element.classList.add('ring-2', 'ring-blue-500', 'ring-offset-2')
        
        setTimeout(() => {
          element.classList.remove('ring-2', 'ring-blue-500', 'ring-offset-2')
          setSelectedSubject(null)
        }, 2000)
      }
    }
  }, [selectedSubject])

  const fetchDepartmentDocuments = async () => {
    try {
      setLoading(true)
      const supabase = createClient()

      // First check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser()
      
      // If user exists, set current user
      if (user) {
        setCurrentUser(user)
      }

      // Fetch documents for the department (without user filter)
      const { data, error } = await supabase
        .from('documents')
        .select('*')
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

  // Delete subject and all its documents
  const handleDeleteSubject = async (subjectName: string) => {
    if (!currentUser) {
      alert('You must be logged in to delete subjects.')
      return
    }

    try {
      setIsDeleting(subjectName)
      const supabase = createClient()

      // Double-check user authentication before delete
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert('Session expired. Please login again.')
        router.push('/login')
        return
      }

      // First, fetch all documents for this subject to verify ownership
      const { data: subjectDocs, error: fetchError } = await supabase
        .from('documents')
        .select('id, user_id')
        .eq('subject_name', subjectName)
        .eq('department', department)

      if (fetchError) throw fetchError

      // Check if user owns any of these documents
      const userOwnedDocs = subjectDocs?.filter(doc => doc.user_id === user.id) || []
      
      if (userOwnedDocs.length === 0) {
        alert('You can only delete subjects that you have uploaded documents to.')
        return
      }

      // Delete all documents for this subject (only those owned by user)
      const { error: deleteError } = await supabase
        .from('documents')
        .delete()
        .in('id', userOwnedDocs.map(doc => doc.id))

      if (deleteError) throw deleteError

      // Refresh the documents list
      fetchDepartmentDocuments()
      setShowDeleteConfirm(null)
      alert(`Subject "${subjectName}" has been deleted successfully.`)
      
    } catch (error) {
      console.error('Error deleting subject:', error)
      alert('Failed to delete subject. Please try again.')
    } finally {
      setIsDeleting(null)
    }
  }

  // Get unique subjects in this department
  const subjects = Array.from(new Set(documents.map(doc => doc.subject_name)))
    .map(subject => {
      const subjectDocs = documents.filter(doc => doc.subject_name === subject)
      const teacher = subjectDocs[0]?.teacher_name || ''
      
      // Get unique user IDs who uploaded documents for this subject
      const uploaderIds = Array.from(new Set(subjectDocs.map(doc => doc.user_id)))
      
      // Convert lecture numbers properly
      const lectures = Array.from(new Set(subjectDocs.map(doc => {
        const lectureNo = doc.lecture_no;
        const num = parseInt(lectureNo);
        return isNaN(num) ? 0 : num;
      })))
      .filter(lecture => lecture > 0)
      .sort((a, b) => a - b) as number[]
      
      return {
        name: subject,
        teacher,
        count: subjectDocs.length,
        lectures,
        uploaderIds // Track who uploaded documents for this subject
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name))

  // Filter subjects based on search
  const filteredSubjects = subjects.filter(subject => 
    subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.teacher.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Check if current user can delete a specific subject
  const canDeleteSubject = (subject: typeof subjects[0]) => {
    if (!currentUser) return false
    // User can delete if they have uploaded any document for this subject
    return subject.uploaderIds.includes(currentUser.id)
  }

  // Generate search suggestions with type
  const getSearchSuggestions = () => {
    if (!searchTerm.trim()) return []
    
    const suggestions: Array<{
      text: string;
      type: 'subject' | 'teacher';
      subjectName?: string;
    }> = []
    
    subjects.forEach(subject => {
      // Add subject name matches
      if (subject.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        suggestions.push({
          text: subject.name,
          type: 'subject',
          subjectName: subject.name
        })
      }
      
      // Add teacher name matches
      if (subject.teacher && subject.teacher.toLowerCase().includes(searchTerm.toLowerCase())) {
        suggestions.push({
          text: subject.teacher,
          type: 'teacher',
          subjectName: subject.name
        })
      }
    })
    
    // Remove duplicates
    const uniqueSuggestions = suggestions.filter((suggestion, index, self) =>
      index === self.findIndex((s) => 
        s.text === suggestion.text && s.subjectName === suggestion.subjectName
      )
    )
    
    return uniqueSuggestions.slice(0, 6)
  }

  const suggestions = getSearchSuggestions()

  // Helper function to format lecture range
  const getLectureRange = (lectures: number[]) => {
    if (lectures.length === 0) return 'No lectures'
    if (lectures.length === 1) return `Lecture ${lectures[0]}`
    return `Lecture ${Math.min(...lectures)} - ${Math.max(...lectures)}`
  }

  // Handle search input focus
  const handleSearchFocus = () => {
    if (searchTerm && suggestions.length > 0) {
      setShowSuggestions(true)
    }
  }

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    if (value.trim() && suggestions.length > 0) {
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }
  }

  // Select a suggestion and scroll to subject
  const handleSuggestionClick = (suggestion: { text: string; type: 'subject' | 'teacher'; subjectName?: string }) => {
    if (suggestion.subjectName) {
      setSearchTerm(suggestion.text)
      setShowSuggestions(false)
      setSelectedSubject(suggestion.subjectName)
    }
  }

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm('')
    setShowSuggestions(false)
    setSelectedSubject(null)
  }

  // Set ref for subject card
  const setSubjectRef = (subjectName: string, element: HTMLDivElement | null) => {
    subjectRefs.current[subjectName] = element
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen ">
      {/* Header */}
      <header className="sticky top-0 z-10 ">
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
            {currentUser && (
              <div className="text-sm text-gray-600">
                Logged in as: <span className="font-medium">{currentUser.email}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Search Section */}
      <div className="">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div ref={searchRef} className="relative max-w-2xl mx-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search subjects or teachers..."
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={handleSearchFocus}
                className="block w-full pl-10 pr-10 py-3 text-base placeholder-gray-500 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              />
              {searchTerm && (
                <button
                  onClick={handleClearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
            
            {/* Search Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                <div className="py-1">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Quick Suggestions
                  </div>
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left px-4 py-3 hover:bg-blue-50 flex items-center justify-between group transition-colors duration-150"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-1.5 rounded ${suggestion.type === 'subject' ? 'bg-blue-100' : 'bg-green-100'}`}>
                          {suggestion.type === 'subject' ? (
                            <BookOpen className="h-4 w-4 text-blue-600" />
                          ) : (
                            <User className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                        <div className="text-left">
                          <span className="text-gray-700 group-hover:text-blue-600 font-medium">
                            {suggestion.text}
                          </span>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {suggestion.type === 'subject' ? 'Subject' : `Teacher - ${suggestion.subjectName}`}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-transform" />
                    </button>
                  ))}
                </div>
              </div>
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
                <div
                  key={index}
                  ref={(el) => setSubjectRef(subject.name, el)}
                  className="transition-all duration-300 relative group"
                >
                  {/* Delete Icon - Only show if user is logged in AND can delete this subject */}
                  {currentUser && canDeleteSubject(subject) && (
                    <div className="absolute top-4 right-4 z-10">
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setShowDeleteConfirm(subject.name)
                        }}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete subject"
                        aria-label={`Delete ${subject.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  
                  <Link 
                    href={`/dashboard/department/${encodeURIComponent(department)}/subject/${encodeURIComponent(subject.name)}`}
                    className="block"
                  >
                    <div className={`bg-white rounded-lg border border-gray-200 p-5 hover:border-blue-300 hover:shadow-md transition-all duration-200 h-full ${selectedSubject === subject.name ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}>
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

                  {/* Delete Confirmation Modal */}
                  {showDeleteConfirm === subject.name && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                      <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="p-2 bg-red-100 rounded-lg">
                            <AlertTriangle className="h-6 w-6 text-red-600" />
                          </div>
                          <h3 className="text-lg font-bold text-gray-900">Delete Subject</h3>
                        </div>
                        
                        <p className="text-gray-600 mb-2">
                          Are you sure you want to delete <span className="font-semibold">"{subject.name}"</span>?
                        </p>
                        <p className="text-sm text-gray-500 mb-6">
                          This will permanently delete all {subject.count} files you uploaded for this subject.
                          Other users' files will remain unaffected.
                        </p>
                        
                        <div className="flex justify-end space-x-3">
                          <button
                            onClick={() => setShowDeleteConfirm(null)}
                            disabled={isDeleting === subject.name}
                            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleDeleteSubject(subject.name)}
                            disabled={isDeleting === subject.name}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center space-x-2"
                          >
                            {isDeleting === subject.name ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Deleting...</span>
                              </>
                            ) : (
                              <>
                                <Trash2 className="h-4 w-4" />
                                <span>Delete</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
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
                  onClick={handleClearSearch}
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
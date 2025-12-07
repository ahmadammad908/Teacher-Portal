// app/dashboard/department/[dept]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '../../../../../lib/supabase/client'
import {  BookOpen,  ChevronLeft, Search,  } from 'lucide-react'
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
      return {
        name: subject,
        teacher,
        count: subjectDocs.length,
        lectures: Array.from(new Set(subjectDocs.map(doc => doc.lecture_no))).sort((a, b) => a - b)
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name))

  // Filter subjects based on search
  const filteredSubjects = subjects.filter(subject => 
    subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.teacher.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold">{department}</h1>
              <p className="text-blue-100 mt-2">
                Browse subjects in {department}
              </p>
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
                <div className="text-2xl font-bold text-green-600">{subjects.length}</div>
                <div className="text-sm text-gray-600">Subjects</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.max(...subjects.map(s => s.lectures.length), 0)}
                </div>
                <div className="text-sm text-gray-600">Max Lectures</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {subjects.reduce((acc, s) => acc + s.count, 0) / subjects.length || 0}
                </div>
                <div className="text-sm text-gray-600">Avg Files/Subject</div>
              </div>
            </div>
            
            <div className="md:w-1/3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search subjects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subjects Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredSubjects.map((subject, index) => (
            <Link 
              href={`/dashboard/department/${encodeURIComponent(department)}/subject/${encodeURIComponent(subject.name)}`}
              key={index}
            >
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <BookOpen className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-800 truncate">
                        {subject.name}
                      </h3>
                      <p className="text-sm text-gray-600 truncate">
                        {subject.teacher || 'No teacher specified'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-blue-600">
                      {subject.count} files
                    </div>
                    <div className="text-xs text-gray-500">
                      {subject.lectures.length} lectures
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Lecture Range:</span>
                    <span className="font-semibold text-purple-600">
                      {subject.lectures.length > 0 
                        ? `Lecture ${Math.min(...subject.lectures)} - ${Math.max(...subject.lectures)}`
                        : 'No lectures'
                      }
                    </span>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Available Lectures:</p>
                    <div className="flex flex-wrap gap-2">
                      {subject.lectures.slice(0, 8).map(lecture => (
                        <span 
                          key={lecture}
                          className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded"
                        >
                          Lecture {lecture}
                        </span>
                      ))}
                      {subject.lectures.length > 8 && (
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                          +{subject.lectures.length - 8} more
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Click to view lectures</span>
                      <div className="flex items-center text-blue-600 text-sm">
                        View Details
                        <ChevronLeft className="h-4 w-4 rotate-180 ml-1" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredSubjects.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700">No subjects found</h3>
            <p className="text-gray-600 mt-2">
              {searchTerm ? 'Try a different search term' : 'No subjects in this department'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
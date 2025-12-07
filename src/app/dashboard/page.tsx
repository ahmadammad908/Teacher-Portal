// app/dashboard/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '../../../lib/supabase/client'
import { Building, Search,  ChevronRight } from 'lucide-react'
import Link from 'next/link'

// Department categories
const DEPARTMENT_CATEGORIES = [
  { id: 'ADP-CS-3rd', name: 'ADP-CS-3rd', order: 1 },
  { id: 'BSAI-1st', name: 'BSAI-1st', order: 2 },
  { id: 'BSAI-3rd', name: 'BSAI-3rd', order: 3 },
  { id: 'BSCS-5th', name: 'BSCS-5th', order: 4 },
  { id: 'BSCS-1st', name: 'BSCS-1st', order: 5 },
  { id: 'BSCS-3rd', name: 'BSCS-3rd', order: 6 },
  { id: 'BSCS-7th', name: 'BSCS-7th', order: 7 },
  { id: 'BSCS-7th (5th Semester)', name: 'BSCS-7th (5th Semester)', order: 8 },
  { id: 'BSCS-8th (5th Semester)', name: 'BSCS-8th (5th Semester)', order: 9 },
  { id: 'BSIT-1st', name: 'BSIT-1st', order: 10 },
  { id: 'BSIT-7th', name: 'BSIT-7th', order: 11 }
] as const

export default function Dashboard() {
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentStats, setDepartmentStats] = useState<Record<string, number>>({})

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get all documents
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .order('department_order', { ascending: true })
        .order('subject_order', { ascending: true })
        .order('lecture_order', { ascending: true })

      if (error) throw error
      
      setDocuments(data || [])
      
      // Calculate department stats
      const stats: Record<string, number> = {}
      data?.forEach(doc => {
        stats[doc.department] = (stats[doc.department] || 0) + 1
      })
      setDepartmentStats(stats)
      
    } catch (error) {
      console.error('Error fetching documents:', error)
    } finally {
      setLoading(false)
    }
  }

  // Get unique departments
  const departments = Array.from(new Set(documents.map(doc => doc.department)))
    .sort((a, b) => {
      const deptA = DEPARTMENT_CATEGORIES.find(d => d.id === a)
      const deptB = DEPARTMENT_CATEGORIES.find(d => d.id === b)
      return (deptA?.order || 0) - (deptB?.order || 0)
    })

  // Filter departments based on search
  const filteredDepartments = departments.filter(dept => 
    dept.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-3xl font-bold">Lecture Materials</h1>
          <p className="text-blue-100 mt-2">
            Browse your uploaded lecture materials by department
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="bg-white rounded-lg shadow-lg p-4 mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search departments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-semibold">{documents.length}</span> total files
            </div>
          </div>
        </div>
      </div>

      {/* Departments Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDepartments.map((department) => {
            const deptInfo = DEPARTMENT_CATEGORIES.find(d => d.id === department)
            const count = departmentStats[department] || 0
            
            // Get unique subjects in this department
            const departmentSubjects = Array.from(
              new Set(
                documents
                  .filter(doc => doc.department === department)
                  .map(doc => doc.subject_name)
              )
            )
            
            return (
              <Link 
                href={`/dashboard/department/${encodeURIComponent(department)}`}
                key={department}
              >
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Building className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">{department}</h3>
                        <p className="text-sm text-gray-600">
                          {deptInfo ? `Order: ${deptInfo.order}` : ''}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Total Files:</span>
                      <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        {count} files
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Subjects:</span>
                      <span className="font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
                        {departmentSubjects.length} subjects
                      </span>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-600 mb-2">Subjects:</p>
                      <div className="flex flex-wrap gap-2">
                        {departmentSubjects.slice(0, 3).map((subject, idx) => (
                          <span 
                            key={idx}
                            className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                          >
                            {subject.length > 20 ? subject.substring(0, 20) + '...' : subject}
                          </span>
                        ))}
                        {departmentSubjects.length > 3 && (
                          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                            +{departmentSubjects.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {filteredDepartments.length === 0 && (
          <div className="text-center py-12">
            <Building className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700">No departments found</h3>
            <p className="text-gray-600 mt-2">
              {searchTerm ? 'Try a different search term' : 'No lecture materials uploaded yet'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
// app/dashboard/page.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '../../../lib/supabase/client'
import { Building, Search, ChevronRight, FileText, FolderOpen, BookOpen, Calendar, Users, ChevronDown, X } from 'lucide-react'
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
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
  const [isSelectOpen, setIsSelectOpen] = useState(false)
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchDocuments()
  }, [])

  useEffect(() => {
    // Close search suggestions when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
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

  // Filter departments based on search and selected department
  const filteredDepartments = departments.filter(dept => {
    const matchesSearch = dept.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSelected = selectedDepartment === 'all' || dept === selectedDepartment
    return matchesSearch && matchesSelected
  })

  // Get search suggestions
  const searchSuggestions = departments.filter(dept => 
    dept.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 5) // Limit to 5 suggestions

  // Get departments with files
  const departmentsWithFiles = departments.filter(dept => departmentStats[dept] > 0)

  // Statistics calculations
  const totalFiles = documents.length
  const totalSubjects = new Set(documents.map(doc => doc.subject_name)).size
  const totalDepartments = departments.length

  // Format date properly
  const formatDate = (dateString: string | Date | null | undefined) => {
    if (!dateString) return 'No recent files'
    
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return 'Invalid date'
      
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    } catch (error) {
      return 'Invalid date'
    }
  }

  // Get latest date for a department
  const getLatestDepartmentDate = (department: string) => {
    const departmentDocs = documents.filter(doc => doc.department === department)
    
    if (departmentDocs.length === 0) return null
    
    // Find the latest date from created_at or updated_at
    let latestDate: number | Date | null = null
    departmentDocs.forEach(doc => {
      const docDate = doc.updated_at || doc.created_at
      if (docDate) {
        const date = new Date(docDate)
        if (!latestDate || date > latestDate) {
          latestDate = date
        }
      }
    })
    
    return latestDate
  }

  // Handle department selection from dropdown
  const handleDepartmentSelect = (deptId: string) => {
    setSelectedDepartment(deptId)
    setIsSelectOpen(false)
    // Clear search when selecting a specific department
    if (deptId !== 'all') {
      setSearchTerm('')
    }
  }

  // Handle search suggestion click
  const handleSearchSuggestionClick = (department: string) => {
    setSelectedDepartment(department)
    setSearchTerm('')
    setShowSearchSuggestions(false)
    
    // Scroll to the selected department
    setTimeout(() => {
      const element = document.getElementById(`department-${department}`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        element.classList.add('ring-2', 'ring-blue-500', 'ring-offset-2')
        setTimeout(() => {
          element.classList.remove('ring-2', 'ring-blue-500', 'ring-offset-2')
        }, 2000)
      }
    }, 100)
  }

  // Get display name for selected department
  const getSelectedDepartmentName = () => {
    if (selectedDepartment === 'all') return 'All Departments'
    const deptInfo = DEPARTMENT_CATEGORIES.find(d => d.id === selectedDepartment)
    return deptInfo?.name || selectedDepartment
  }

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    
    if (value.length > 0) {
      setShowSearchSuggestions(true)
    } else {
      setShowSearchSuggestions(false)
      setSelectedDepartment('all')
    }
  }

  // Clear search
  const clearSearch = () => {
    setSearchTerm('')
    setSelectedDepartment('all')
    setShowSearchSuggestions(false)
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  // Handle search input focus
  const handleSearchFocus = () => {
    setSearchFocused(true)
    if (searchTerm.length > 0) {
      setShowSearchSuggestions(true)
    }
  }

  // Handle search input blur
  const handleSearchBlur = () => {
    setSearchFocused(false)
    // Delay hiding suggestions to allow for click
    setTimeout(() => {
      if (!searchFocused) {
        setShowSearchSuggestions(false)
      }
    }, 200)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading your lecture materials...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen ">
      {/* Header with Stats */}
      <div className=" ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Lecture Materials</h1>
              <p className="text-gray-600 mt-2">
                Manage and organize your lecture materials by department
              </p>
            </div>

            <div className="mt-4 lg:mt-0 flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <FolderOpen className="h-5 w-5 text-blue-500" />
                  <span className="text-sm font-medium text-gray-700">{totalDepartments} Departments</span>
                </div>
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium text-gray-700">{totalSubjects} Subjects</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-purple-500" />
                  <span className="text-sm font-medium text-gray-700">{totalFiles} Files</span>
                </div>
              </div>

              <button className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                <BookOpen className="h-4 w-4" />
                <span>Add New</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards - Mobile Responsive */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-4 md:p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-xs md:text-sm font-medium">Total Departments</p>
                <p className="text-2xl md:text-3xl font-bold mt-1 md:mt-2">{totalDepartments}</p>
              </div>
              <Building className="h-8 w-8 md:h-12 md:w-12 opacity-80" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl p-4 md:p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-xs md:text-sm font-medium">Total Subjects</p>
                <p className="text-2xl md:text-3xl font-bold mt-1 md:mt-2">{totalSubjects}</p>
              </div>
              <BookOpen className="h-8 w-8 md:h-12 md:w-12 opacity-80" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl p-4 md:p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-xs md:text-sm font-medium">Total Files</p>
                <p className="text-2xl md:text-3xl font-bold mt-1 md:mt-2">{totalFiles}</p>
              </div>
              <FileText className="h-8 w-8 md:h-12 md:w-12 opacity-80" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Select Filter Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* Search with Suggestions */}
            <div className="flex-1 relative" ref={searchRef}>
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <Search className="h-4 w-4 mr-2 text-blue-500" />
                  Search Departments:
                </label>
                
                <div className="relative">
                  <div className="relative">
                    <Search className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 md:h-5 md:w-5" />
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="Type to search departments..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                      onFocus={handleSearchFocus}
                      onBlur={handleSearchBlur}
                      className="w-full pl-10 md:pl-12 pr-8 md:pr-10 py-2 md:py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all text-sm md:text-base"
                    />
                    {searchTerm && (
                      <button
                        onClick={clearSearch}
                        className="absolute right-2 md:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4 md:h-5 md:w-5" />
                      </button>
                    )}
                  </div>

                  {/* Search Suggestions Dropdown */}
                  {showSearchSuggestions && searchSuggestions.length > 0 && (
                    <div className="absolute z-30 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
                      <div className="p-2">
                        <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Departments ({searchSuggestions.length})
                        </div>
                        {searchSuggestions.map((department) => {
                          const fileCount = departmentStats[department] || 0
                          return (
                            <button
                              key={department}
                              onClick={() => handleSearchSuggestionClick(department)}
                              className="w-full px-3 py-2 md:py-3 flex items-center justify-between hover:bg-gray-50 rounded-lg transition-colors group"
                            >
                              <div className="flex items-center space-x-2 md:space-x-3">
                                <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></div>
                                <span className="text-sm font-medium text-gray-700 text-left truncate">
                                  {department}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1 md:space-x-2 ml-2">
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded whitespace-nowrap">
                                  {fileCount} files
                                </span>
                                <ChevronRight className="h-3 w-3 md:h-4 md:w-4 text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0" />
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* No Results Message */}
                  {showSearchSuggestions && searchTerm && searchSuggestions.length === 0 && (
                    <div className="absolute z-30 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg">
                      <div className="p-4 text-center">
                        <Search className="h-6 w-6 md:h-8 md:w-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-600 text-sm md:text-base">No departments found matching "{searchTerm}"</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {searchTerm && (
                  <div className="text-xs md:text-sm text-gray-500">
                    <span className="font-medium">{searchSuggestions.length}</span> department{searchSuggestions.length !== 1 ? 's' : ''} found
                  </div>
                )}
              </div>
            </div>

            {/* Department Select Dropdown */}
            <div className="relative w-full md:w-auto">
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <FolderOpen className="h-4 w-4 mr-2 text-blue-500" />
                  Filter by Department:
                </label>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsSelectOpen(!isSelectOpen)}
                    className="w-full md:w-64 px-3 md:px-4 py-2 md:py-3 bg-white border border-gray-300 rounded-xl text-left flex items-center justify-between hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  >
                    <div className="flex items-center space-x-2 overflow-hidden">
                      <span className="font-medium text-gray-900 truncate text-sm md:text-base">
                        {getSelectedDepartmentName()}
                      </span>
                      {selectedDepartment !== 'all' && (
                        <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded-full whitespace-nowrap">
                          {departmentStats[selectedDepartment] || 0} files
                        </span>
                      )}
                    </div>
                    <ChevronDown className={`h-4 w-4 md:h-5 md:w-5 text-gray-500 transition-transform flex-shrink-0 ${isSelectOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {isSelectOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsSelectOpen(false)}
                      ></div>
                      <div className="absolute z-20 mt-2 w-full md:w-64 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 md:max-h-96 overflow-y-auto">
                        {/* All Departments Option */}
                        <div
                          onClick={() => handleDepartmentSelect('all')}
                          className={`px-3 md:px-4 py-2 md:py-3 flex items-center justify-between cursor-pointer transition-colors hover:bg-gray-50 ${selectedDepartment === 'all' ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'
                            }`}
                        >
                          <div className="flex items-center space-x-2 md:space-x-3">
                            <div className={`w-2 h-2 rounded-full ${selectedDepartment === 'all' ? 'bg-blue-500' : 'bg-gray-300'} flex-shrink-0`}></div>
                            <span className={`font-medium text-sm md:text-base ${selectedDepartment === 'all' ? 'text-blue-700' : 'text-gray-700'} truncate`}>
                              All Departments
                            </span>
                          </div>
                          <span className="text-xs font-medium bg-gray-100 text-gray-700 px-2 py-1 rounded whitespace-nowrap ml-2">
                            {totalFiles} files
                          </span>
                        </div>

                        <div className="border-t border-gray-100 my-1"></div>

                        {/* Department Options */}
                        {departments.map((department) => {
                          const deptInfo = DEPARTMENT_CATEGORIES.find(d => d.id === department)
                          const fileCount = departmentStats[department] || 0
                          const isSelected = selectedDepartment === department

                          return (
                            <div
                              key={department}
                              onClick={() => handleDepartmentSelect(department)}
                              className={`px-3 md:px-4 py-2 md:py-3 flex items-center justify-between cursor-pointer transition-colors hover:bg-gray-50 ${isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'
                                }`}
                            >
                              <div className="flex items-center space-x-2 md:space-x-3 overflow-hidden">
                                <div className={`w-2 h-2 rounded-full ${fileCount > 0 ? 'bg-green-500' : 'bg-gray-300'} flex-shrink-0`}></div>
                                <div className="flex flex-col min-w-0">
                                  <span className={`font-medium text-sm md:text-base ${isSelected ? 'text-blue-700' : 'text-gray-700'} truncate`}>
                                    {department}
                                  </span>
                                  <span className="text-xs text-gray-500 mt-0.5 truncate">
                                    Order: {deptInfo?.order}
                                  </span>
                                </div>
                              </div>
                              <span className={`text-xs font-medium px-2 py-1 rounded whitespace-nowrap ml-2 ${fileCount > 0
                                  ? isSelected ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                                  : 'bg-gray-100 text-gray-400'
                                }`}>
                                {fileCount} file{fileCount !== 1 ? 's' : ''}
                              </span>
                            </div>
                          )
                        })}

                        {/* Empty State */}
                        {departments.length === 0 && (
                          <div className="px-4 py-6 md:py-8 text-center">
                            <FolderOpen className="h-8 w-8 md:h-12 md:w-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 text-sm">No departments found</p>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="mt-4 md:mt-6 flex flex-wrap items-center gap-3 md:gap-4 text-xs md:text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <span className="font-medium">{filteredDepartments.length} departments showing</span>
              <span className="text-gray-400">•</span>
              <span>{totalFiles} total lecture files</span>
            </div>

            {selectedDepartment !== 'all' && (
              <div className="flex items-center space-x-2 bg-blue-50 text-blue-700 px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-xs md:text-sm">
                <FolderOpen className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                <span className="truncate">Viewing: <span className="font-semibold">{getSelectedDepartmentName()}</span></span>
                <button
                  onClick={() => handleDepartmentSelect('all')}
                  className="text-blue-600 hover:text-blue-800 font-medium ml-1 md:ml-2 whitespace-nowrap"
                >
                  Clear
                </button>
              </div>
            )}

            {searchTerm && (
              <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-700 px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-xs md:text-sm">
                <Search className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                <span className="truncate">Search: <span className="font-semibold">"{searchTerm}"</span></span>
                <button
                  onClick={clearSearch}
                  className="text-emerald-600 hover:text-emerald-800 font-medium ml-1 md:ml-2 whitespace-nowrap"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Departments Grid */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pb-8 md:pb-16">
        {filteredDepartments.length > 0 ? (
          <>
            {/* Grid Header */}
            <div className="mb-4 md:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 md:gap-4">
              <h2 className="text-lg md:text-xl font-bold text-gray-900">
                {selectedDepartment === 'all' ? 'All Departments' : getSelectedDepartmentName()}
                <span className="text-gray-600 text-base md:text-lg font-normal ml-1 md:ml-2">
                  ({filteredDepartments.length} {filteredDepartments.length === 1 ? 'department' : 'departments'})
                </span>
              </h2>

              {selectedDepartment !== 'all' && (
                <button
                  onClick={() => handleDepartmentSelect('all')}
                  className="text-xs md:text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1 self-start sm:self-center"
                >
                  <span>View all departments</span>
                  <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
                </button>
              )}
            </div>

            {/* Departments Grid - Mobile Responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
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
                
                // Get latest document date
                const latestDate = getLatestDepartmentDate(department)
                const formattedDate = formatDate(latestDate)

                return (
                  <div id={`department-${department}`} key={department} className="h-full">
                    <Link href={`/dashboard/department/${encodeURIComponent(department)}`}>
                      <div className="group bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-200 p-4 md:p-6 hover:shadow-md md:hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden relative h-full flex flex-col">
                        {/* Accent border on hover */}
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        
                        {/* Header Section */}
                        <div className="flex items-start justify-between mb-4 md:mb-5">
                          <div className="flex items-start space-x-3 md:space-x-4">
                            <div className="p-2 md:p-3 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg md:rounded-xl flex-shrink-0">
                              <Building className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-base md:text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                                {department}
                              </h3>
                              <div className="flex flex-wrap items-center mt-1 gap-1 md:gap-2">
                                <span className="text-xs font-medium bg-blue-50 text-blue-600 px-1.5 md:px-2 py-0.5 md:py-1 rounded">
                                  Order: {deptInfo?.order}
                                </span>
                                <span className="hidden md:inline text-sm text-gray-500">•</span>
                                <span className="text-xs md:text-sm text-gray-500 truncate">
                                  Updated: {formattedDate}
                                </span>
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 md:h-5 md:w-5 text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0 mt-1" />
                        </div>
                        
                        {/* Stats Section */}
                        <div className="space-y-4 md:space-y-5 flex-grow">
                          <div className="grid grid-cols-2 gap-3 md:gap-4">
                            <div className="bg-gray-50 rounded-lg p-2 md:p-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs md:text-sm text-gray-600">Files</span>
                                <FileText className="h-3 w-3 md:h-4 md:w-4 text-blue-500 flex-shrink-0" />
                              </div>
                              <p className="text-xl md:text-2xl font-bold text-gray-900 mt-1 md:mt-2">{count}</p>
                              <div className="h-1 w-full bg-gray-200 rounded-full mt-1 md:mt-2 overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                                  style={{ width: `${Math.min(count * 10, 100)}%` }}
                                ></div>
                              </div>
                            </div>
                            
                            <div className="bg-gray-50 rounded-lg p-2 md:p-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs md:text-sm text-gray-600">Subjects</span>
                                <BookOpen className="h-3 w-3 md:h-4 md:w-4 text-emerald-500 flex-shrink-0" />
                              </div>
                              <p className="text-xl md:text-2xl font-bold text-gray-900 mt-1 md:mt-2">{departmentSubjects.length}</p>
                              <div className="h-1 w-full bg-gray-200 rounded-full mt-1 md:mt-2 overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full"
                                  style={{ width: `${Math.min(departmentSubjects.length * 20, 100)}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Subjects Section */}
                          {departmentSubjects.length > 0 && (
                            <div className="pt-3 md:pt-4 border-t border-gray-100">
                              <div className="flex items-center justify-between mb-2 md:mb-3">
                                <p className="text-xs md:text-sm font-medium text-gray-700">Subjects:</p>
                                <span className="text-xs font-medium bg-blue-50 text-blue-600 px-1.5 md:px-2 py-0.5 md:py-1 rounded">
                                  {departmentSubjects.length} total
                                </span>
                              </div>
                              <div className="space-y-1.5 md:space-y-2">
                                {departmentSubjects.slice(0, 3).map((subject, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between p-1.5 md:p-2 hover:bg-gray-50 rounded-lg transition-colors group/item"
                                  >
                                    <span className="text-xs md:text-sm text-gray-700 truncate flex items-center min-w-0">
                                      <div className="h-1.5 w-1.5 rounded-full bg-blue-400 mr-2 md:mr-3 flex-shrink-0"></div>
                                      <span className="truncate">
                                        {subject.length > 20 ? subject.substring(0, 20) + '...' : subject}
                                      </span>
                                    </span>
                                    <span className="text-xs text-gray-500 bg-gray-100 px-1.5 md:px-2 py-0.5 rounded whitespace-nowrap ml-2">
                                      {documents.filter(doc => doc.department === department && doc.subject_name === subject).length} files
                                    </span>
                                  </div>
                                ))}
                                {departmentSubjects.length > 3 && (
                                  <div className="text-center pt-1 md:pt-2">
                                    <span className="text-xs md:text-sm text-blue-600 font-medium hover:text-blue-700">
                                      +{departmentSubjects.length - 3} more subjects
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {/* Button Section */}
                          <div className="pt-3 md:pt-4 border-t border-gray-100 mt-auto">
                            <button className="w-full py-2 md:py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all transform hover:-translate-y-0.5 text-xs md:text-sm">
                              View Department Details
                            </button>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                )
              })}
            </div>
          </>
        ) : (
          <div className="text-center py-12 md:py-16 bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="w-16 h-16 md:w-24 md:h-24 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4 md:mb-6">
              <Building className="h-8 w-8 md:h-12 md:w-12 text-gray-400" />
            </div>
            <h3 className="text-lg md:text-2xl font-bold text-gray-800 mb-2 md:mb-3">
              {selectedDepartment === 'all' ? 'No departments found' : 'No files in this department'}
            </h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6 md:mb-8 text-sm md:text-base px-4">
              {searchTerm
                ? `No departments matching "${searchTerm}" were found. Try a different search term.`
                : selectedDepartment === 'all'
                  ? 'Start by uploading lecture materials to organize them by department.'
                  : 'This department currently has no lecture materials.'}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4 px-4">
              <button
                onClick={() => handleDepartmentSelect('all')}
                className="px-4 md:px-6 py-2.5 md:py-3 bg-gray-200 text-gray-700 font-medium rounded-lg md:rounded-xl hover:bg-gray-300 transition-all text-sm md:text-base"
              >
                View All Departments
              </button>
              <button className="px-4 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg md:rounded-xl hover:shadow-lg transition-all text-sm md:text-base">
                Upload Lecture
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Stats */}
      <div className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 md:gap-0">
            <div className="text-center md:text-left">
              <p className="text-xs md:text-sm text-gray-600">
                Lecture Materials Dashboard • {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div className="mt-2 md:mt-0 flex items-center space-x-4 md:space-x-6">
              <div className="flex items-center space-x-1 md:space-x-2">
                <Users className="h-3 w-3 md:h-4 md:w-4 text-gray-400" />
                <span className="text-xs md:text-sm text-gray-600">Professional Education Portal</span>
              </div>
              <div className="hidden md:flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">Academic Year 2025</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
// app/dashboard/page.tsx
'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { createClient } from '../../../lib/supabase/client'
import Team from '../../app/../../public/images/Team.webp'
import {
  Building,
  Search,
  ChevronRight,
  FileText,
  FolderOpen,
  BookOpen,
  Users,
  ChevronDown,
  X,
  Upload,
  Filter,
  RefreshCw,
  BarChart3,
  TrendingUp,
  Download,
  MoreVertical,
  Bell,
  User,
  Settings,
  LogOut,
  Menu,
  Grid,
  List,
  Eye,
  Share2,
  Plus,
  Trash2,
  Clock,
  ChevronLeft,
  UserPlus
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

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

// Activity interface
interface ActivityLog {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  activity_type: 'upload' | 'update' | 'delete' | 'view' | 'download' | 'organize' | 'share';
  entity_type: string;
  entity_id: string;
  entity_name: string;
  department: string;
  subject_name: string;
  metadata: any;
  created_at: string;
}

// Document interface
interface Document {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  download_url: string;
  teacher_name: string;
  subject_name: string;
  lecture_no: string;
  lecture_title: string;
  department: string;
  lecture_type: string;
  uploaded_at: string;
  updated_at: string;
  department_order: number;
  subject_order: number;
  lecture_order: number;
}

export default function Dashboard() {
  const router = useRouter()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentStats, setDepartmentStats] = useState<Record<string, number>>({})
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
  const [isSelectOpen, setIsSelectOpen] = useState(false)
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const [totalCount, setTotalCount] = useState<number>(0)
  const [loadingProgress, setLoadingProgress] = useState({ current: 0, total: 0 })
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  const [user, setUser] = useState<any>(null)

  // Real-time activities states
  const [recentActivities, setRecentActivities] = useState<ActivityLog[]>([])
  const [activitiesLoading, setActivitiesLoading] = useState(true)
  const [totalActivities, setTotalActivities] = useState(0)

  // Pagination states
  const [activityPage, setActivityPage] = useState(1)
  const ACTIVITIES_PER_PAGE = 4

  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const notificationsRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const departmentGridRef = useRef<HTMLDivElement>(null)
  const mobileSearchInputRef = useRef<HTMLInputElement>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    checkUser()

    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const checkUser = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setMobileMenuOpen(false)

    router.push('/')
    router.refresh()
  }

  // Calculate paginated activities
  const paginatedActivities = useMemo(() => {
    const startIndex = (activityPage - 1) * ACTIVITIES_PER_PAGE
    const endIndex = startIndex + ACTIVITIES_PER_PAGE
    return recentActivities.slice(startIndex, endIndex)
  }, [recentActivities, activityPage])

  const totalActivityPages = Math.ceil(recentActivities.length / ACTIVITIES_PER_PAGE)

  // Check for mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false)
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Close sidebar when clicking outside on desktop
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close search suggestions
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchSuggestions(false)
      }

      // Close notifications
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }

      // Close user menu
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }

      // Close sidebar when clicking outside
      if (!isMobile &&
        !sidebarCollapsed &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest('button[data-sidebar-toggle]')) {
        setSidebarCollapsed(true)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [sidebarCollapsed, isMobile])

  // Focus mobile search input when popup opens
  useEffect(() => {
    if (showMobileSearch && mobileSearchInputRef.current) {
      setTimeout(() => {
        mobileSearchInputRef.current?.focus()
      }, 100)
    }
  }, [showMobileSearch])

  // Reset activity page when activities change
  useEffect(() => {
    setActivityPage(1)
  }, [recentActivities])

  // Fetch all documents with pagination
  const fetchAllDocuments = useCallback(async () => {
    try {
      setLoading(true)
      setLoadingProgress({ current: 0, total: 0 })

      const supabase = createClient()

      console.log('Starting to fetch all documents...')

      // First, get total count
      const { count, error: countError } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })

      if (countError) {
        console.error('Error counting documents:', countError)
      } else {
        console.log(`Total documents in database: ${count}`)
        setTotalCount(count || 0)
        setLoadingProgress({ current: 0, total: count || 0 })
      }

      // Fetch all documents with pagination
      let allDocuments: Document[] = []
      let start = 0
      const pageSize = 1000
      let hasMore = true

      while (hasMore) {
        console.log(`Fetching documents ${start + 1} to ${start + pageSize}...`)

        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .order('department_order', { ascending: true })
          .order('subject_order', { ascending: true })
          .order('lecture_order', { ascending: true })
          .range(start, start + pageSize - 1)

        if (error) {
          console.error('Error fetching documents:', error)
          break
        }

        if (data && data.length > 0) {
          allDocuments = [...allDocuments, ...data]
          start += pageSize

          // Update progress
          setLoadingProgress({
            current: allDocuments.length,
            total: count || allDocuments.length + pageSize
          })

          console.log(`Fetched ${data.length} documents, total so far: ${allDocuments.length}`)

          if (data.length < pageSize) {
            hasMore = false
            console.log(`Last batch received: ${data.length} documents`)
          }
        } else {
          hasMore = false
        }

        await new Promise(resolve => setTimeout(resolve, 50))
      }

      console.log(`✅ Total loaded: ${allDocuments.length} documents`)
      setDocuments(allDocuments)

      // Calculate department stats
      const stats: Record<string, number> = {}
      allDocuments.forEach(doc => {
        stats[doc.department] = (stats[doc.department] || 0) + 1
      })
      setDepartmentStats(stats)

    } catch (error) {
      console.error('Error fetching documents:', error)
    } finally {
      setLoading(false)
      setLoadingProgress({ current: 0, total: 0 })
    }
  }, [])

  // Fetch recent activities
  const fetchRecentActivities = useCallback(async () => {
    try {
      setActivitiesLoading(true)
      const supabase = createClient()

      // First get count
      const { count } = await supabase
        .from('activity_logs')
        .select('*', { count: 'exact', head: true })

      setTotalActivities(count || 0)

      // Then fetch activities
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error

      setRecentActivities(data || [])
    } catch (error) {
      console.error('Error fetching activities:', error)
    } finally {
      setActivitiesLoading(false)
    }
  }, [])

  // Setup real-time subscription for activities
  useEffect(() => {
    if (!loading) {
      fetchRecentActivities()
      const supabase = createClient()

      const channel = supabase
        .channel('activity-logs-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'activity_logs'
          },
          (payload) => {
            // Add new activity at the beginning
            setRecentActivities(prev => [payload.new as ActivityLog, ...prev.slice(0, 49)])

            // Update total count
            setTotalActivities(prev => prev + 1)

            // Show notification badge
            const notificationBadge = document.querySelector('.notification-badge')
            if (notificationBadge) {
              notificationBadge.classList.add('animate-ping')
              setTimeout(() => {
                notificationBadge.classList.remove('animate-ping')
              }, 1000)
            }
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [loading, fetchRecentActivities])

  // Initial data fetch
  useEffect(() => {
    fetchAllDocuments()
  }, [fetchAllDocuments])

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
  ).slice(0, 5)

  // Statistics calculations
  const totalFiles = documents.length
  const totalSubjects = new Set(documents.map(doc => doc.subject_name)).size
  const totalDepartments = departments.length

  // Calculate growth metrics based on recent activities
  const calculateGrowthMetrics = () => {
    const today = new Date()
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

    const recentUploads = recentActivities.filter(
      activity => activity.activity_type === 'upload' &&
        new Date(activity.created_at) > lastWeek
    ).length

    const totalUploads = recentActivities.filter(
      activity => activity.activity_type === 'upload'
    ).length

    const growthRate = totalUploads > 0 ? (recentUploads / totalUploads) * 100 : 0

    return {
      files: Math.min(growthRate, 24.7),
      departments: Math.min(growthRate * 0.67, 8.3),
      activity: Math.min(growthRate * 1.5, 24.7)
    }
  }

  const growthMetrics = calculateGrowthMetrics()

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

    let latestDate: Date | null = null
    departmentDocs.forEach(doc => {
      const docDate = doc.updated_at || doc.uploaded_at
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
    if (deptId !== 'all') {
      setSearchTerm('')
      setShowSearchSuggestions(false)

      // Scroll to the department after a delay
      setTimeout(() => {
        scrollToDepartment(deptId)
      }, 100)
    }
  }

  // Handle search suggestion click
  const handleSearchSuggestionClick = (department: string) => {
    setSelectedDepartment(department)
    setSearchTerm(department)
    setShowSearchSuggestions(false)
    setShowMobileSearch(false)

    setTimeout(() => {
      scrollToDepartment(department)
    }, 100)
  }

  // Scroll to department function
  const scrollToDepartment = (department: string) => {
    const element = document.getElementById(`department-${department}`)
    if (element) {
      const offset = 100
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })

      // Add highlight effect
      element.classList.add('ring-2', 'ring-blue-500', 'bg-blue-50')
      setTimeout(() => {
        element.classList.remove('ring-2', 'ring-blue-500', 'bg-blue-50')
      }, 2000)
    }
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
      setSelectedDepartment('all')
    } else {
      setShowSearchSuggestions(false)
      setSelectedDepartment('all')
    }
  }

  // Handle mobile search input change
  const handleMobileSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)

    if (value.length > 0) {
      setShowSearchSuggestions(true)
      setSelectedDepartment('all')
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

  // Clear mobile search
  const clearMobileSearch = () => {
    setSearchTerm('')
    setSelectedDepartment('all')
    setShowSearchSuggestions(false)
    if (mobileSearchInputRef.current) {
      mobileSearchInputRef.current.focus()
    }
  }

  // Handle search input focus
  const handleSearchFocus = () => {
    setSearchFocused(true)
    if (searchTerm.length > 0) {
      setShowSearchSuggestions(true)
    }
  }

  // Handle mobile search focus
  const handleMobileSearchFocus = () => {
    setSearchFocused(true)
    if (searchTerm.length > 0) {
      setShowSearchSuggestions(true)
    }
  }

  // Refresh data function
  const handleRefresh = async () => {
    setLoading(true)
    await fetchAllDocuments()
    await fetchRecentActivities()
  }

  // Handle key press in search
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchTerm && searchSuggestions.length > 0) {
      handleSearchSuggestionClick(searchSuggestions[0])
    }
  }

  // Handle mobile search key press
  const handleMobileSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchTerm && searchSuggestions.length > 0) {
      handleSearchSuggestionClick(searchSuggestions[0])
    }
  }

  // Open mobile search popup
  const openMobileSearch = () => {
    setShowMobileSearch(true)
  }

  // Close mobile search popup
  const closeMobileSearch = () => {
    setShowMobileSearch(false)
    setShowSearchSuggestions(false)
  }

  // Toggle sidebar with backdrop for mobile
  const toggleSidebar = () => {
    if (isMobile) {
      setMobileMenuOpen(!mobileMenuOpen)
    } else {
      setSidebarCollapsed(!sidebarCollapsed)
    }
  }

  // Activity helper functions
  const getActivityText = (activity: ActivityLog) => {
    const actionMap = {
      upload: 'uploaded',
      update: 'updated',
      delete: 'deleted',
      view: 'viewed',
      download: 'downloaded',
      organize: 'organized',
      share: 'shared'
    }

    const actionText = actionMap[activity.activity_type] || activity.activity_type
    return `${activity.user_name || 'User'} ${actionText} ${activity.entity_name}`
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'upload':
        return <Upload className="w-3.5 h-3.5 text-blue-600" />
      case 'update':
        return <RefreshCw className="w-3.5 h-3.5 text-green-600" />
      case 'delete':
        return <Trash2 className="w-3.5 h-3.5 text-red-600" />
      case 'download':
        return <Download className="w-3.5 h-3.5 text-purple-600" />
      case 'share':
        return <Share2 className="w-3.5 h-3.5 text-indigo-600" />
      case 'view':
        return <Eye className="w-3.5 h-3.5 text-amber-600" />
      default:
        return <FileText className="w-3.5 h-3.5 text-gray-600" />
    }
  }

  // Handle user logout
  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  // Handle activity pagination
  const handleNextPage = () => {
    if (activityPage < totalActivityPages) {
      setActivityPage(prev => prev + 1)
    }
  }

  const handlePrevPage = () => {
    if (activityPage > 1) {
      setActivityPage(prev => prev - 1)
    }
  }

  // Render loading skeleton for KPI cards
  const renderKPISkeleton = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="p-2 sm:p-3 bg-gray-200 rounded-lg animate-pulse">
              <div className="w-4 h-4 sm:w-6 sm:h-6 bg-gray-300 rounded"></div>
            </div>
            <div className="h-5 w-12 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
          <div className="h-7 sm:h-8 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
        </div>
      ))}
    </div>
  )

  // Render loading skeleton for departments
  const renderDepartmentsSkeleton = () => (
    <div>
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="h-6 w-40 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-4 sm:p-6 animate-pulse">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-200 rounded-lg"></div>
                <div>
                  <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 w-24 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
            </div>
            <div className="space-y-2 sm:space-y-3">
              {[1, 2].map((j) => (
                <div key={j} className="flex items-center justify-between p-2">
                  <div className="h-3 w-32 bg-gray-200 rounded"></div>
                  <div className="h-3 w-16 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-100">
              <div className="h-4 w-20 bg-gray-200 rounded"></div>
              <div className="flex space-x-2">
                <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Top Navigation Skeleton */}
        <nav className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50">
          <div className="h-full px-4 sm:px-6 flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="hidden md:block w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="hidden md:block w-24 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </nav>

        {/* Main Content Skeleton */}
        <main className="pt-16">
          <div className="p-4 sm:p-6">
            {/* Header Skeleton */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 sm:mb-8">
              <div>
                <div className="h-7 w-64 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-96 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3 mt-4 lg:mt-0">
                <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="w-40 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="w-32 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
            </div>

            {/* KPI Cards Skeleton */}
            {renderKPISkeleton()}

            {/* Departments Grid Skeleton */}
            {renderDepartmentsSkeleton()}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50">
        <div className="h-full px-4 sm:px-6 flex items-center justify-between">
          {/* Left side */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Desktop Sidebar Toggle */}
            <button
              data-sidebar-toggle
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors hidden md:block"
            >
              {sidebarCollapsed ? (
                <Menu className="w-5 h-5 text-gray-600" />
              ) : (
                <X className="w-5 h-5 text-gray-600" />
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors md:hidden"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-gray-600" />
              ) : (
                <Menu className="w-5 h-5 text-gray-600" />
              )}
            </button>

            <div className="flex items-center">
              <Building className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mr-2" />
              <span className="text-base sm:text-lg font-semibold text-gray-900">EduPortal</span>
              <span className="hidden sm:inline text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded ml-2">PRO</span>
            </div>
          </div>

          {/* Center - Search (Desktop Only) */}
          <div className="flex-1 max-w-lg mx-4 hidden md:block" ref={searchRef}>
            <div className="relative">
              <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                ref={inputRef}
                type="search"
                placeholder="Search departments..."
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={handleSearchFocus}
                onKeyPress={handleSearchKeyPress}
                className="w-full pl-9 sm:pl-12 pr-10 py-2.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all text-sm"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Search Suggestions */}
              {showSearchSuggestions && searchTerm.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg sm:rounded-xl shadow-lg border border-gray-200 z-40 max-h-60 overflow-y-auto">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-xs font-medium text-gray-500">DEPARTMENTS</p>
                  </div>
                  {searchSuggestions.map((department) => (
                    <button
                      key={department}
                      onClick={() => handleSearchSuggestionClick(department)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <Building className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-medium text-gray-900">{department}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {departmentStats[department] || 0} files
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>
                  ))}
                  {searchSuggestions.length === 0 && (
                    <div className="px-4 py-3 text-center text-gray-500">
                      No departments found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors hidden md:block"
              title="Refresh data"
            >
              <RefreshCw className="w-5 h-5 text-gray-600" />
            </button>

            {/* Mobile Search Icon */}
            <button
              onClick={openMobileSearch}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors md:hidden"
            >
              <Search className="w-5 h-5 text-gray-600" />
            </button>

            {/* Upload Button - Desktop */}
            <Link href="/upload" className="hidden md:block">
              <button className="flex items-center space-x-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Upload className="w-4 h-4" />
                <span className="text-sm font-medium">Upload</span>
              </button>
            </Link>

            {/* Notifications */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg hover:bg-gray-100 relative transition-colors"
              >
                <Bell className="w-5 h-5 text-gray-600" />

                {/* Notification Badge with Count */}
                {recentActivities.length > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-5 bg-red-500 text-white text-xs flex items-center justify-center px-1 rounded-full 
    animate-heartbeat hover:animate-none transition-all duration-300">
                    {recentActivities.length > 9 ? '9+' : recentActivities.length}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-40">
                  <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-gray-900">Recent Activity</h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {totalActivities} total
                      </span>
                      <button
                        onClick={fetchRecentActivities}
                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                        disabled={activitiesLoading}
                      >
                        <RefreshCw className={`w-3 h-3 text-gray-500 ${activitiesLoading ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto custom-scrollbar">
                    {activitiesLoading ? (
                      <div className="px-4 py-6 text-center">
                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <p className="text-sm text-gray-500 mt-2">Loading activities...</p>
                      </div>
                    ) : recentActivities.length > 0 ? (
                      recentActivities.slice(0, 10).map((activity) => (
                        <div key={activity.id} className="px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0">
                          <div className="flex items-start space-x-3">
                            <div className="p-2 bg-blue-50 rounded-lg flex-shrink-0">
                              {getActivityIcon(activity.activity_type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-900">
                                {getActivityText(activity)}
                              </p>
                              <div className="flex items-center justify-between mt-1">
                                <p className="text-xs text-gray-500">
                                  {activity.department} • {getTimeAgo(activity.created_at)}
                                </p>
                                {activity.activity_type === 'upload' && activity.metadata?.file_size && (
                                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                    {(activity.metadata.file_size / 1024 / 1024).toFixed(1)} MB
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-6 text-center text-gray-500">
                        <Clock className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">No recent activity</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              {user ? (
                <>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 p-1 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <img src={Team.src} alt="Team" className="w-10 h-10 object-cover rounded-full" />
                  </button>
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-40">
                      <div className="px-3 py-2">
                        <p className="text-sm font-medium text-gray-900">Zeeshan Ahmad</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      <div className="border-t border-gray-100 my-2"></div>
                      <button
                        onClick={handleLogout}
                        className="w-full px-3 py-2 text-left text-sm  flex items-center space-x-2 text-red-600 hover:text-red-500"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign out</span>
                      </button>
                    </div>
                  )}
                </>

              ) : (
                <>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 p-1 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >

                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                    </div>


                  </button>
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-40">
                      <div className="px-3 py-2">
                        <p className="text-sm font-medium text-gray-900">Admin Access</p>
                        <p className="text-xs text-gray-500">Sign in to continue</p>

                      </div>
                      <div className="border-t border-gray-100 my-2"></div>

                      <button
                        onClick={() => router.push('/login')}
                        className="w-full px-3 py-2 text-left text-sm  hover:bg-gray-50 flex items-center space-x-2 text-red-600 hover:text-red-500"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign in</span>
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Search Popup */}
      {showMobileSearch && (
        <div className="fixed inset-0 bg-white z-50 md:hidden">
          <div className="h-16 px-4 flex items-center justify-between border-b border-gray-200">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                ref={mobileSearchInputRef}
                type="search"
                placeholder="Search departments..."
                value={searchTerm}
                onChange={handleMobileSearchChange}
                onFocus={handleMobileSearchFocus}
                onKeyPress={handleMobileSearchKeyPress}
                className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all text-base"
                autoFocus
              />
              {searchTerm && (
                <button
                  onClick={clearMobileSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            <button
              onClick={closeMobileSearch}
              className="ml-3 px-3 py-2 text-blue-600 font-medium"
            >
              Cancel
            </button>
          </div>

          {/* Search Suggestions in Mobile Popup */}
          <div className="flex-1 overflow-y-auto">
            {searchSuggestions.length > 0 ? (
              <div className="py-2">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-500">DEPARTMENTS</p>
                </div>
                {searchSuggestions.map((department) => (
                  <button
                    key={department}
                    onClick={() => handleSearchSuggestionClick(department)}
                    className="w-full px-4 py-4 text-left hover:bg-gray-50 transition-colors flex items-center justify-between border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <Building className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="text-left">
                        <p className="text-base font-medium text-gray-900">{department}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {departmentStats[department] || 0} files
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                ))}
              </div>
            ) : searchTerm.length > 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <Building className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg mb-2">No departments found</p>
                <p className="text-gray-400 text-sm text-center">
                  No departments matching "{searchTerm}"
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <Search className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg mb-2">Search Departments</p>
                <p className="text-gray-400 text-sm text-center">
                  Type department name to search
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Desktop Sidebar Backdrop (when sidebar is open) */}
      {!sidebarCollapsed && !isMobile && (
        <div
          className="fixed inset-0 backdrop-blur-sm bg-opacity-50 z-30 transition-opacity duration-300 md:block hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      {/* Desktop Sidebar */}
      <aside
        ref={sidebarRef}
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 shadow-xl transform transition-transform duration-300 ease-in-out hidden md:block ${sidebarCollapsed ? '-translate-x-full' : 'translate-x-0'
          } z-40`}
        style={{ width: '280px' }}
      >
        <div className="h-full flex flex-col">
          {/* Navigation */}
          <div className="py-6 px-4">
            <nav className="space-y-1">
              <Link href="/dashboard">
                <button
                  onClick={() => setSidebarCollapsed(true)}
                  className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg justify-start bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                >
                  <Grid className="w-5 h-5" />
                  <span className="text-sm font-medium">Dashboard</span>
                </button>
              </Link>

              <Link href="/analytics">
                <button
                  onClick={() => setSidebarCollapsed(true)}
                  className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg justify-start hover:bg-gray-50 text-gray-700 transition-colors"
                >
                  <BarChart3 className="w-5 h-5" />
                  <span className="text-sm font-medium">Analytics</span>
                </button>
              </Link>

              <Link href="/upload">
                <button
                  onClick={() => setSidebarCollapsed(true)}
                  className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg justify-start hover:bg-gray-50 text-gray-700 transition-colors"
                >
                  <Upload className="w-5 h-5" />
                  <span className="text-sm font-medium">Upload</span>
                </button>
              </Link>

              <Link href="/users">
                <button
                  onClick={() => setSidebarCollapsed(true)}
                  className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg justify-start hover:bg-gray-50 text-gray-700 transition-colors"
                >
                  <Users className="w-5 h-5" />
                  <span className="text-sm font-medium">Users</span>
                </button>
              </Link>

              <Link href="/settings">
                <button
                  onClick={() => setSidebarCollapsed(true)}
                  className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg justify-start hover:bg-gray-50 text-gray-700 transition-colors"
                >
                  <Settings className="w-5 h-5" />
                  <span className="text-sm font-medium">Settings</span>
                </button>
              </Link>
            </nav>
          </div>

          {/* Recent Activity in Sidebar */}
          <div className="flex-1 overflow-hidden px-4">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Recent Activity</h3>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={fetchRecentActivities}
                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                    disabled={activitiesLoading}
                    title="Refresh activities"
                  >
                    <RefreshCw className={`w-3 h-3 text-gray-400 ${activitiesLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {activitiesLoading ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-2"></div>
                    <p className="text-xs text-gray-500">Loading activities...</p>
                  </div>
                ) : paginatedActivities.length > 0 ? (
                  <div className="space-y-2">
                    {paginatedActivities.map((activity) => (
                      <div
                        key={activity.id}
                        className="bg-gray-50 rounded-lg p-3 hover:bg-blue-50 transition-colors cursor-pointer group border border-gray-100"
                        onClick={() => {
                          if (activity.department) {
                            handleSearchSuggestionClick(activity.department)
                            setSidebarCollapsed(true)
                          }
                        }}
                        title={`Click to view ${activity.department} department`}
                      >
                        <div className="flex items-start space-x-2">
                          <div className={`p-1.5 rounded-md flex-shrink-0 mt-0.5 ${activity.activity_type === 'upload' ? 'bg-blue-100' :
                            activity.activity_type === 'update' ? 'bg-green-100' :
                              activity.activity_type === 'delete' ? 'bg-red-100' :
                                activity.activity_type === 'view' ? 'bg-amber-100' :
                                  activity.activity_type === 'download' ? 'bg-purple-100' :
                                    'bg-gray-100'
                            }`}>
                            {getActivityIcon(activity.activity_type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <p className="text-xs font-medium text-gray-900 truncate">
                                {activity.entity_name || 'Activity'}
                              </p>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ml-2 flex-shrink-0 ${activity.activity_type === 'upload' ? 'bg-blue-100 text-blue-800' :
                                activity.activity_type === 'update' ? 'bg-green-100 text-green-800' :
                                  activity.activity_type === 'delete' ? 'bg-red-100 text-red-800' :
                                    activity.activity_type === 'view' ? 'bg-amber-100 text-amber-800' :
                                      activity.activity_type === 'download' ? 'bg-purple-100 text-purple-800' :
                                        'bg-gray-100 text-gray-800'
                                }`}>
                                {activity.activity_type}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                              {getActivityText(activity)}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-gray-500">
                                {getTimeAgo(activity.created_at)}
                              </span>
                              {activity.department && (
                                <span className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded truncate max-w-[100px]">
                                  {activity.department}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-xs text-gray-500">No recent activity</p>
                  </div>
                )}

                {/* Pagination Controls */}
                {recentActivities.length > ACTIVITIES_PER_PAGE && (
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={handlePrevPage}
                          disabled={activityPage === 1}
                          className="p-1 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Previous page"
                        >
                          <ChevronLeft className="w-4 h-4 text-gray-500" />
                        </button>
                        <span className="text-xs text-gray-600 mx-2">
                          {activityPage} / {totalActivityPages}
                        </span>
                        <button
                          onClick={handleNextPage}
                          disabled={activityPage >= totalActivityPages}
                          className="p-1 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Next page"
                        >
                          <ChevronRight className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                      <span className="text-xs text-gray-500">
                        {recentActivities.length} activities
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="px-4 py-4 border-t border-gray-200">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Summary</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="flex items-center">
                  <FileText className="w-4 h-4 text-blue-600 mr-2" />
                  <span className="text-xs text-gray-600">Files</span>
                </div>
                <span className="text-lg font-bold text-gray-900 block mt-1">{totalFiles.toLocaleString()}</span>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <div className="flex items-center">
                  <Building className="w-4 h-4 text-green-600 mr-2" />
                  <span className="text-xs text-gray-600">Departments</span>
                </div>
                <span className="text-lg font-bold text-gray-900 block mt-1">{totalDepartments}</span>
              </div>
              <div className="bg-purple-50 rounded-lg p-3">
                <div className="flex items-center">
                  <BookOpen className="w-4 h-4 text-purple-600 mr-2" />
                  <span className="text-xs text-gray-600">Subjects</span>
                </div>
                <span className="text-lg font-bold text-gray-900 block mt-1">{totalSubjects}</span>
              </div>
              <div className="bg-amber-50 rounded-lg p-3">
                <div className="flex items-center">
                  <Bell className="w-4 h-4 text-amber-600 mr-2" />
                  <span className="text-xs text-gray-600">Activities</span>
                </div>
                <span className="text-lg font-bold text-gray-900 block mt-1">{totalActivities.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* User Profile at Bottom */}
          {
            user ? (
              <>
                <div className="p-4 border-t border-gray-200">
                  <div className="flex items-center space-x-3">
                    <img src={Team.src} alt="Team" className="w-10 h-10 object-cover rounded-full" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">Zeeshan Ahmad</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Sign out"
                    >
                      <LogOut className="w-4 h-4 text-red-600 hover:text-red-500" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="p-4 border-t border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">Admin Access</p>
                      <p className="text-xs text-gray-500 truncate">Sign in to continue</p>
                    </div>
                    <button
                      onClick={() => router.push('/login')}
                      className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Sign out"
                    >
                      <UserPlus className="w-4 h-4 text-red-600 hover:text-red-500" />
                    </button>
                  </div>
                </div>
              </>
            )
          }
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          {/* Backdrop with blur effect */}
          <div className="absolute inset-0 backdrop-blur-sm transition-opacity duration-300"></div>

          {/* Sidebar */}
          <aside
            className="fixed left-0 top-0 h-full w-72 bg-white z-50 transform transition-transform duration-300 ease-in-out shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-full flex flex-col">
              {/* Header with close button */}
              <div className="px-4 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Building className="w-6 h-6 text-blue-600" />
                    <span className="text-lg font-semibold text-gray-900">EduPortal</span>
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">PRO</span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Navigation */}
              <div className="py-4 px-4">
                <nav className="space-y-1">
                  <Link href="/dashboard">
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg justify-start bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                    >
                      <Grid className="w-5 h-5" />
                      <span className="text-sm font-medium">Dashboard</span>
                    </button>
                  </Link>

                  <Link href="/analytics">
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg justify-start hover:bg-gray-50 text-gray-700 transition-colors"
                    >
                      <BarChart3 className="w-5 h-5" />
                      <span className="text-sm font-medium">Analytics</span>
                    </button>
                  </Link>

                  <Link href="/upload">
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg justify-start hover:bg-gray-50 text-gray-700 transition-colors"
                    >
                      <Upload className="w-5 h-5" />
                      <span className="text-sm font-medium">Upload</span>
                    </button>
                  </Link>

                  <Link href="/users">
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg justify-start hover:bg-gray-50 text-gray-700 transition-colors"
                    >
                      <Users className="w-5 h-5" />
                      <span className="text-sm font-medium">Users</span>
                    </button>
                  </Link>

                  <Link href="/settings">
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg justify-start hover:bg-gray-50 text-gray-700 transition-colors"
                    >
                      <Settings className="w-5 h-5" />
                      <span className="text-sm font-medium">Settings</span>
                    </button>
                  </Link>
                </nav>
              </div>

              {/* Recent Activity in Mobile Sidebar */}
              <div className="flex-1 overflow-hidden px-4">
                <div className="h-full flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Recent Activity</h3>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={fetchRecentActivities}
                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                        disabled={activitiesLoading}
                      >
                        <RefreshCw className={`w-3 h-3 text-gray-400 ${activitiesLoading ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto">
                    {activitiesLoading ? (
                      <div className="flex flex-col items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-2"></div>
                        <p className="text-xs text-gray-500">Loading activities...</p>
                      </div>
                    ) : paginatedActivities.length > 0 ? (
                      <div className="space-y-2">
                        {paginatedActivities.map((activity) => (
                          <div
                            key={activity.id}
                            className="bg-gray-50 rounded-lg p-3 hover:bg-blue-50 transition-colors cursor-pointer group border border-gray-100"
                            onClick={() => {
                              if (activity.department) {
                                handleSearchSuggestionClick(activity.department)
                                setMobileMenuOpen(false)
                              }
                            }}
                          >
                            <div className="flex items-start space-x-2">
                              <div className={`p-1.5 rounded-md flex-shrink-0 mt-0.5 ${activity.activity_type === 'upload' ? 'bg-blue-100' :
                                activity.activity_type === 'update' ? 'bg-green-100' :
                                  activity.activity_type === 'delete' ? 'bg-red-100' :
                                    activity.activity_type === 'view' ? 'bg-amber-100' :
                                      activity.activity_type === 'download' ? 'bg-purple-100' :
                                        'bg-gray-100'
                                }`}>
                                {getActivityIcon(activity.activity_type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                  <p className="text-xs font-medium text-gray-900 truncate">
                                    {activity.entity_name || 'Activity'}
                                  </p>
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ml-2 flex-shrink-0 ${activity.activity_type === 'upload' ? 'bg-blue-100 text-blue-800' :
                                    activity.activity_type === 'update' ? 'bg-green-100 text-green-800' :
                                      activity.activity_type === 'delete' ? 'bg-red-100 text-red-800' :
                                        activity.activity_type === 'view' ? 'bg-amber-100 text-amber-800' :
                                          activity.activity_type === 'download' ? 'bg-purple-100 text-purple-800' :
                                            'bg-gray-100 text-gray-800'
                                    }`}>
                                    {activity.activity_type}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                  {getActivityText(activity)}
                                </p>
                                <div className="flex items-center justify-between mt-2">
                                  <span className="text-xs text-gray-500">
                                    {getTimeAgo(activity.created_at)}
                                  </span>
                                  {activity.department && (
                                    <span className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded truncate max-w-[100px]">
                                      {activity.department}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Clock className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-xs text-gray-500">No recent activity</p>
                      </div>
                    )}

                    {/* Pagination Controls for Mobile */}
                    {recentActivities.length > ACTIVITIES_PER_PAGE && (
                      <div className="mt-4 pt-3 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={handlePrevPage}
                              disabled={activityPage === 1}
                              className="p-1 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <ChevronLeft className="w-4 h-4 text-gray-500" />
                            </button>
                            <span className="text-xs text-gray-600 mx-2">
                              {activityPage} / {totalActivityPages}
                            </span>
                            <button
                              onClick={handleNextPage}
                              disabled={activityPage >= totalActivityPages}
                              className="p-1 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <ChevronRight className="w-4 h-4 text-gray-500" />
                            </button>
                          </div>
                          <span className="text-xs text-gray-500">
                            {recentActivities.length} activities
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Mobile User Profile */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Admin User</p>
                    <p className="text-xs text-gray-500">Administrator</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      {!showMobileSearch && (
        <main className={`pt-16 transition-all duration-300`}>
          <div className="p-4 sm:p-6">
            {/* Header with Actions */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 sm:mb-8">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Lecture Materials Dashboard</h1>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage and organize academic resources across departments</p>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3 mt-4 lg:mt-0 justify-end">
                <button
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                  title={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
                >
                  {viewMode === 'grid' ? (
                    <List className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <Grid className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </button>

                <div className="relative">
                  <button
                    onClick={() => setIsSelectOpen(!isSelectOpen)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-left flex items-center justify-between hover:border-gray-300 transition-colors gap-3"
                  >
                    <Filter className="w-4 h-4" />
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {getSelectedDepartmentName()}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </button>
                  {isSelectOpen && (
                    <div className="absolute right-0 mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 z-30">
                      <div className="max-h-64 overflow-y-auto py-2">
                        <button
                          onClick={() => handleDepartmentSelect('all')}
                          className={`w-full px-4 py-2 text-left hover:bg-gray-50 text-sm ${selectedDepartment === 'all' ? 'bg-blue-50 text-blue-600' : ''}`}
                        >
                          All Departments
                        </button>
                        {departments.map((dept) => (
                          <button
                            key={dept}
                            onClick={() => handleDepartmentSelect(dept)}
                            className={`w-full px-4 py-2 text-left hover:bg-gray-50 text-sm flex items-center justify-between ${selectedDepartment === dept ? 'bg-blue-50 text-blue-600' : ''}`}
                          >
                            <span>{dept}</span>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {departmentStats[dept] || 0}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <Link href="/upload">
                  <button className="flex items-center space-x-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Plus className="w-4 h-4" />
                    <span className="text-sm font-medium hidden sm:inline">New Upload</span>
                    <span className="text-sm font-medium sm:hidden">Upload</span>
                  </button>
                </Link>
              </div>
            </div>

            {/* KPI Cards */}
            {loading ? renderKPISkeleton() : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
                <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="p-2 sm:p-3 bg-blue-50 rounded-lg">
                      <FolderOpen className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-green-600 bg-green-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                      +{growthMetrics.departments.toFixed(1)}%
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{totalDepartments}</h3>
                  <p className="text-gray-600 text-xs sm:text-sm">Departments</p>
                </div>

                <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="p-2 sm:p-3 bg-emerald-50 rounded-lg">
                      <BookOpen className="w-4 h-4 sm:w-6 sm:h-6 text-emerald-600" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-green-600 bg-green-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                      +{growthMetrics.activity.toFixed(1)}%
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{totalSubjects}</h3>
                  <p className="text-gray-600 text-xs sm:text-sm">Active Subjects</p>
                </div>

                <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="p-2 sm:p-3 bg-purple-50 rounded-lg">
                      <FileText className="w-4 h-4 sm:w-6 sm:h-6 text-purple-600" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-green-600 bg-green-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                      +{growthMetrics.files.toFixed(1)}%
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{totalFiles.toLocaleString()}</h3>
                  <p className="text-gray-600 text-xs sm:text-sm">Total Files</p>
                </div>

                <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="p-2 sm:p-3 bg-amber-50 rounded-lg">
                      <TrendingUp className="w-4 h-4 sm:w-6 sm:h-6 text-amber-600" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-green-600 bg-green-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                      98.2%
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{totalActivities.toLocaleString()}</h3>
                  <p className="text-gray-600 text-xs sm:text-sm">Activities</p>
                </div>
              </div>
            )}

            {/* Departments Grid/List */}
            <div ref={departmentGridRef}>
              {loading ? renderDepartmentsSkeleton() : (
                <>
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                      {selectedDepartment === 'all' ? 'All Departments' : getSelectedDepartmentName()}
                      <span className="text-gray-600 font-normal ml-2">({filteredDepartments.length})</span>
                    </h2>
                    <div className="text-xs sm:text-sm text-gray-600">
                      {filteredDepartments.length} of {departments.length}
                    </div>
                  </div>

                  {filteredDepartments.length > 0 ? (
                    viewMode === 'grid' ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {filteredDepartments.map((department) => {
                          const count = departmentStats[department] || 0;
                          const subjects = Array.from(
                            new Set(documents.filter(doc => doc.department === department).map(doc => doc.subject_name))
                          );

                          return (
                            <div
                              id={`department-${department}`}
                              key={department}
                              className="bg-white rounded-lg sm:rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 group"
                            >
                              <Link href={`/dashboard/department/${encodeURIComponent(department)}`}>
                                <div className="p-4 sm:p-6">
                                  <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                      <div className="p-2 bg-blue-50 rounded-lg flex-shrink-0">
                                        <Building className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base group-hover:text-blue-600 transition-colors truncate">
                                          {department}
                                        </h3>
                                        <p className="text-xs sm:text-sm text-gray-500 mt-1 truncate">
                                          {count} files • {subjects.length} subjects
                                        </p>
                                      </div>
                                    </div>
                                    <button className="p-1 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
                                      <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                                    </button>
                                  </div>

                                  <div className="space-y-2 sm:space-y-3">
                                    {subjects.slice(0, 2).map((subject, idx) => (
                                      <div key={idx} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                                        <span className="text-xs sm:text-sm text-gray-700 truncate flex-1 mr-2">
                                          {subject}
                                        </span>
                                        <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
                                          {documents.filter(doc => doc.department === department && doc.subject_name === subject).length} files
                                        </span>
                                      </div>
                                    ))}
                                    {subjects.length > 2 && (
                                      <div className="text-center pt-1">
                                        <span className="text-xs sm:text-sm text-blue-600 hover:text-blue-700">
                                          +{subjects.length - 2} more subjects
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex items-center justify-between mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-100">
                                    <button className="flex items-center space-x-2 text-xs sm:text-sm text-blue-600 hover:text-blue-700">
                                      <Eye className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                      <span>View Details</span>
                                    </button>
                                    <div className="flex items-center space-x-1 sm:space-x-2">
                                      <button className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                        <Share2 className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                                      </button>
                                      <button className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                        <Download className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </Link>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full min-w-[640px]">
                            <thead>
                              <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-gray-900 w-1/4">Department</th>
                                <th className="text-center py-3 px-9 text-xs sm:text-sm font-semibold text-gray-900 w-1/4">Files</th>
                                <th className="text-center py-3 px-4 text-xs sm:text-sm font-semibold text-gray-900 w-1/4">Subjects</th>
                                <th className="text-center py-3 px-4 text-xs sm:text-sm font-semibold text-gray-900 w-[150px] truncate">Last Updated</th>
                                <th className="text-center py-3 px-4 text-xs sm:text-sm font-semibold text-gray-900 w-1/5">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredDepartments.map((department) => {
                                const count = departmentStats[department] || 0;
                                const subjects = Array.from(
                                  new Set(documents.filter(doc => doc.department === department).map(doc => doc.subject_name))
                                );
                                const latestDate = getLatestDepartmentDate(department);

                                return (
                                  <tr
                                    id={`department-${department}`}
                                    key={department}
                                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                                  >
                                    {/* Department Column - Left aligned */}
                                    <td className="py-3 px-4">
                                      <div className="flex items-center space-x-2 sm:space-x-3">
                                        <div className="p-2 bg-blue-50 rounded-lg flex-shrink-0">
                                          <Building className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div className="min-w-0">
                                          <span className="font-medium text-gray-900 text-sm sm:text-base block truncate">
                                            {department}
                                          </span>
                                        </div>
                                      </div>
                                    </td>

                                    {/* Files Column - Centered */}
                                    <td className="py-3 px-4 text-center align-middle">
                                      <div className="flex items-center justify-center">
                                        <span className="inline-flex items-center justify-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-blue-100 text-blue-800 whitespace-nowrap min-w-[60px]">
                                          {count} files
                                        </span>
                                      </div>
                                    </td>

                                    {/* Subjects Column - Centered */}
                                    <td className="py-3 px-4 text-center align-middle">
                                      <span className="text-gray-700 text-sm sm:text-base font-medium">
                                        {subjects.length}
                                      </span>
                                    </td>

                                    {/* Last Updated Column - Centered */}
                                    <td className="py-3 px-4 text-center align-middle">
                                      <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                                        {formatDate(latestDate)}
                                      </span>
                                    </td>

                                    {/* Actions Column - Centered */}
                                    <td className="py-3 px-4 text-center align-middle ">
                                      <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                                        <Link href={`/dashboard/department/${encodeURIComponent(department)}`}>
                                          <button className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap min-w-[60px]">
                                            View
                                          </button>
                                        </Link>

                                      </div>

                                    </td>

                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-8 sm:p-12 text-center">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                        <Building className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No departments found</h3>
                      <p className="text-gray-600 max-w-md mx-auto mb-4 sm:mb-6 text-sm sm:text-base">
                        {searchTerm
                          ? `No departments matching "${searchTerm}"`
                          : 'Start by uploading lecture materials'}
                      </p>
                      <div className="flex items-center justify-center space-x-2 sm:space-x-3">
                        <button
                          onClick={clearSearch}
                          className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                        >
                          Clear Filters
                        </button>
                        <Link href="/upload">
                          <button className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                            Upload Files
                          </button>
                        </Link>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </main>
      )}

      {/* Mobile Upload FAB */}
      <Link href="/upload" className="md:hidden">
        <button className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center z-40">
          <Upload className="w-6 h-6" />
        </button>
      </Link>
    </div>
  )
}
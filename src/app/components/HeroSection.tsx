// app/abstract-hero/page.tsx
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import {
    ArrowRight, Sparkles, Zap, Shield, Users, ChevronRight, Play, Menu, X, Search, Bell, User, LogOut,
    Settings, HelpCircle, FolderOpen, BookOpen, FileText, TrendingUp
} from 'lucide-react'
import { createClient } from '../../../lib/supabase/client'
import { useRouter } from 'next/navigation'
import Team from '../../app/../../public/images/Team.webp'

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

// Skeleton Loader Component
const StatSkeleton = () => {
    return (
        <div className="bg-white/40 rounded-2xl p-6 border border-gray-200/50 animate-pulse">
            <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-gray-200 rounded-xl w-12 h-12" />
            </div>
            <div className="h-8 w-20 bg-gray-200 rounded mx-auto mb-2" />
            <div className="h-4 w-28 bg-gray-200 rounded mx-auto" />
        </div>
    )
}

export default function AbstractHero() {
    const router = useRouter()

    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isScrolled, setIsScrolled] = useState(false)
    const [showUserMenu, setShowUserMenu] = useState(false)
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [documents, setDocuments] = useState<Document[]>([])
    const [loadingProgress, setLoadingProgress] = useState({ current: 0, total: 0 })
    const [departmentStats, setDepartmentStats] = useState<Record<string, number>>({})
    const [totalCount, setTotalCount] = useState<number>(0)
    const userMenuRef = useRef<HTMLDivElement>(null)

    // Calculate stats from documents
    const departments = Array.from(new Set(documents.map(doc => doc.department)))
        .sort((a, b) => {
            const deptA = DEPARTMENT_CATEGORIES.find(d => d.id === a)
            const deptB = DEPARTMENT_CATEGORIES.find(d => d.id === b)
            return (deptA?.order || 0) - (deptB?.order || 0)
        })

    const totalDepartments = departments.length
    const totalSubjects = new Set(documents.map(doc => doc.subject_name)).size
    const totalFiles = documents.length

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

    useEffect(() => {
        fetchAllDocuments()
    }, [fetchAllDocuments])

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

        router.push('/login')
        router.refresh()
    }

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY })
        }

        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20)
        }

        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('scroll', handleScroll)

        handleScroll()

        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('scroll', handleScroll)
        }
    }, [])

    return (
        <div className="relative min-h-screen overflow-hidden">
            <div className="absolute inset-0">
                <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-gray-200/50 ${isScrolled
                    ? 'backdrop-blur-md '
                    : 'backdrop-blur-sm '
                    }`}>
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16 lg:h-20">
                            <div className="flex items-center space-x-2">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                                    <Sparkles className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    EduPortal
                                </span>
                            </div>

                            <nav className="hidden lg:flex items-center space-x-8">
                                {[
                                    { name: 'Home', path: '/' },
                                    { name: 'Upload Files', path: '/upload' },
                                    { name: 'Dashboard', path: '/dashboard' },
                                    { name: 'Privacy Policy', path: '/privacy-policy' },
                                    { name: 'Help', path: 'help' }
                                ].map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.path}
                                        className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300"
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                            </nav>

                            <div className="flex items-center space-x-4">
                                {/* Desktop Profile Icon */}
                                <div className="hidden lg:flex items-center space-x-4">
                                    <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors relative">
                                        <Bell className="w-5 h-5" />
                                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                                    </button>

                                    {/* Profile Icon - Desktop */}
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
                                                            onClick={handleSignOut}
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
                                                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-600 to-purple-600  rounded-full flex items-center justify-center">
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

                                {/* Mobile Icons - Always visible */}
                                <div className="lg:hidden flex items-center space-x-3">
                                    <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors relative">
                                        <Bell className="w-5 h-5" />
                                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                                    </button>
                                    {/* Mobile Profile Icon - Always visible */}
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
                                                            onClick={handleSignOut}
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
                                                    <div className="w-7 h-7 sm:w-8 sm:h-8  bg-gradient-to-br from-blue-600 to-purple-600  rounded-full flex items-center justify-center">
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

                                    {/* Hamburger Menu Button */}
                                    <button
                                        className="p-2 text-gray-700"
                                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    >
                                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Professional Mobile Menu with Backdrop Filter */}
                        {isMenuOpen && (
                            <div className="lg:hidden">
                                {/* Backdrop Overlay */}
                                <div
                                    className="fixed inset-0 top-16  backdrop-blur-sm animate-fadeIn"
                                    onClick={() => setIsMenuOpen(false)}
                                />

                                {/* Mobile Menu Panel */}
                                <div className="fixed inset-x-0 top-16 bg-white/95 backdrop-blur-lg border-t border-gray-200/50 shadow-2xl animate-slideDown">
                                    <div className="container mx-auto px-6 py-8">
                                        {/* Navigation Links */}
                                        <div className="space-y-1 mb-6">
                                            {[
                                                { name: 'Home', path: '/' },
                                                { name: 'Upload Files', path: '/upload' },
                                                { name: 'Dashboard', path: '/dashboard' },
                                                { name: 'Pricing', path: '/pricing' },
                                                { name: 'Privacy Policy', path: '/privacy-policy' },
                                                { name: 'Help', path: '/help' }
                                            ].map((item) => (
                                                <Link
                                                    key={item.name}
                                                    href={item.path}
                                                    className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50/80 transition-all duration-200 group"
                                                    onClick={() => setIsMenuOpen(false)}
                                                >
                                                    <span className="text-gray-800 font-medium group-hover:text-blue-600">
                                                        {item.name}
                                                    </span>
                                                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-transform" />
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </header>

                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="gradient-blue" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.15" />
                            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.05" />
                        </linearGradient>
                        <linearGradient id="gradient-purple" x1="100%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.15" />
                            <stop offset="100%" stopColor="#EC4899" stopOpacity="0.05" />
                        </linearGradient>

                        <filter id="blur-large">
                            <feGaussianBlur stdDeviation="40" />
                        </filter>

                        <pattern id="circles" width="60" height="60" patternUnits="userSpaceOnUse">
                            <circle cx="30" cy="30" r="1" fill="rgba(59, 130, 246, 0.1)" />
                        </pattern>
                    </defs>

                    <rect width="100%" height="100%" fill="url(#circles)" />

                    <g>
                        <path
                            d="M-100 200 Q 150 100 400 300 Q 650 500 900 200 Q 1150 -100 1400 300 L 1400 800 L -100 800 Z"
                            fill="url(#gradient-blue)"
                            filter="url(#blur-large)"
                        />

                        <path
                            d="M1200 -100 Q 1000 200 800 100 Q 600 0 400 200 Q 200 400 0 200 L 0 -100 Z"
                            fill="url(#gradient-purple)"
                            filter="url(#blur-large)"
                        />

                        <g opacity="0.1">
                            {Array.from({ length: 15 }).map((_, i) => (
                                <line
                                    key={`h-${i}`}
                                    x1="0"
                                    y1={i * 100}
                                    x2="100%"
                                    y2={i * 100}
                                    stroke="#3B82F6"
                                    strokeWidth="1"
                                />
                            ))}
                            {Array.from({ length: 20 }).map((_, i) => (
                                <line
                                    key={`v-${i}`}
                                    x1={i * 100}
                                    y1="0"
                                    x2={i * 100}
                                    y2="100%"
                                    stroke="#8B5CF6"
                                    strokeWidth="1"
                                />
                            ))}
                        </g>

                        <g>
                            {Array.from({ length: 8 }).map((_, i) => {
                                const x = 100 + i * 200
                                const y = 150 + (i % 3) * 200
                                return (
                                    <path
                                        key={i}
                                        d={`M${x} ${y} L${x + 80} ${y - 40} L${x + 160} ${y} Z`}
                                        fill={`rgba(139, 92, 246, ${0.05 + i * 0.02})`}
                                    />
                                )
                            })}
                        </g>

                        <g opacity="0.3">
                            {Array.from({ length: 12 }).map((_, i) => {
                                const x = 50 + (i % 4) * 300
                                const y = 100 + Math.floor(i / 4) * 300
                                return (
                                    <g key={i}>
                                        <circle cx={x} cy={y} r="4" fill="#3B82F6" />
                                        {i < 11 && (
                                            <line
                                                x1={x}
                                                y1={y}
                                                x2={50 + ((i + 1) % 4) * 300}
                                                y2={100 + Math.floor((i + 1) / 4) * 300}
                                                stroke="#3B82F6"
                                                strokeWidth="1"
                                                strokeDasharray="5,5"
                                            />
                                        )}
                                    </g>
                                )
                            })}
                        </g>

                        <g>
                            {Array.from({ length: 6 }).map((_, i) => {
                                const size = 100 + i * 40
                                return (
                                    <circle
                                        key={i}
                                        cx="50%"
                                        cy="50%"
                                        r={size}
                                        fill="none"
                                        stroke={`rgba(59, 130, 246, ${0.1 - i * 0.015})`}
                                        strokeWidth="2"
                                        strokeDasharray="10,10"
                                    >
                                        <animateTransform
                                            attributeName="transform"
                                            type="rotate"
                                            from={`0 50% 50%`}
                                            to={`360 50% 50%`}
                                            dur={`${20 + i * 5}s`}
                                            repeatCount="indefinite"
                                        />
                                    </circle>
                                )
                            })}
                        </g>
                    </g>
                </svg>
            </div>

            <div className="absolute inset-0">
                {Array.from({ length: 40 }).map((_, i) => (
                    <div
                        key={i}
                        className="absolute rounded-full animate-float-slow"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            width: `${2 + Math.random() * 4}px`,
                            height: `${2 + Math.random() * 4}px`,
                            background: `radial-gradient(circle, rgba(59, 130, 246, ${0.3 + Math.random() * 0.3}) 0%, rgba(139, 92, 246, ${0.1 + Math.random() * 0.2}) 100%)`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${5 + Math.random() * 10}s`,
                        }}
                    />
                ))}
            </div>

            <div className="relative z-10">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-11  pb-24">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="pt-16 lg:pt-20">
                            <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-6 py-2 rounded-full border border-gray-200 shadow-lg mb-2">
                                <Sparkles className="w-4 h-4 text-blue-600" />
                                <span className="text-sm font-semibold text-gray-700">Powerful CMS Hub</span>
                                <ChevronRight className="w-4 h-4 text-gray-500" />
                            </div>

                            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-8" style={{ lineHeight: '1.2' }}>
                                <span className="block bg-gradient-to-r from-gray-900 via-blue-700 to-purple-600 bg-clip-text text-transparent">
                                    From Creation to Publishing
                                </span>
                                <span className="block text-gray-700 mt-4">Manage All Your Content in One Place</span>
                            </h1>

                            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
                                A modern content management system that helps you create, manage, and publish content with ease. Built for speed, security, and scalability, this platform empowers teams to collaborate efficiently and deliver consistent digital experiences across all channels.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                                <button className="group relative px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 cursor-pointer" onClick={() => router.push('/dashboard')}>
                                    <div className="flex items-center space-x-3">
                                        <span>Get Started</span>
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                                    </div>
                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 blur-xl opacity-50 group-hover:opacity-70 transition-opacity -z-10"></div>
                                </button>

                                {/* <button className="group px-10 py-4 bg-white/80 backdrop-blur-sm text-gray-900 font-semibold rounded-2xl border-2 border-gray-300/50 hover:border-blue-400 transition-all duration-300 shadow-xl hover:shadow-2xl">
                                    <div className="flex items-center space-x-3">
                                        <Play className="w-5 h-5" />
                                        <span>Watch Demo</span>
                                    </div>
                                </button> */}
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 ">
                                {/* Show skeleton loaders while loading, actual stats when loaded */}
                                {loading ? (
                                    // Show 4 skeleton loaders
                                    Array.from({ length: 4 }).map((_, index) => (
                                        <StatSkeleton key={index} />
                                    ))
                                ) : (
                                    // Show actual stats when documents are loaded
                                    [
                                        { value: totalDepartments, label: "Departments", icon: <FolderOpen className="w-5 h-5" /> },
                                        { value: totalSubjects, label: "Active Subjects", icon: <BookOpen className="w-5 h-5" /> },
                                        { value: totalFiles, label: "Total Files", icon: <FileText className="w-5 h-5" /> },
                                        { value: "12", label: "Activities", icon: <TrendingUp className="w-5 h-5" /> }
                                    ].map((state, index) => (
                                        <div
                                            key={index}
                                            className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 hover:border-blue-300/50 transition-all duration-300 hover:scale-105"
                                        >
                                            <div className="flex items-center justify-center mb-4">
                                                <div className="p-3 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl">
                                                    <div className="text-blue-600">{state.icon}</div>
                                                </div>
                                            </div>
                                            <div className="text-3xl font-bold text-gray-900 mb-1">{state.value}</div>
                                            <div className="text-gray-600">{state.label}</div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{` 
                @keyframes float-slow {
                    0%, 100% {
                        transform: translateY(0) translateX(0);
                        opacity: 0.5;
                    }
                    25% {
                        transform: translateY(-30px) translateX(20px);
                        opacity: 0.8;
                    }
                    50% {
                        transform: translateY(0) translateX(40px);
                        opacity: 0.5;
                    }
                    75% {
                        transform: translateY(30px) translateX(20px);
                        opacity: 0.3;
                    }
                }
                .animate-float-slow {
                    animation: float-slow infinite ease-in-out;
                }
                
                .animate-pulse {
                    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
                
                @keyframes pulse {
                    0%, 100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.5;
                    }
                }
            `}</style>
        </div>
    )
}
'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '../../../lib/supabase/client'
import {
  Upload,
  Home,
  User,
  LogOut,
  LogIn,
  Menu,
  X,
  FileText,
  ChevronDown,
  Shield,
  Flag
} from 'lucide-react'

export default function Navigation() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    checkUser()

    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false)
      }
    }

    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'unset'
    }
  }, [mobileMenuOpen])

  // Close menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
    setUserDropdownOpen(false)
  }, [pathname])

  const checkUser = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    setLoading(false)
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setMobileMenuOpen(false)
    setUserDropdownOpen(false)
    router.push('/')
    router.refresh()
  }

  // Desktop navigation items
  const navItems = user ? [
    { href: '/', label: 'Home', icon: Home },
    { href: '/upload', label: 'Upload', icon: Upload },
    { href: '/privacy-policy', label: 'Privacy Policy', icon: Shield },
    { href: '/report', label: 'Report', icon: Flag },
  ] : [
    { href: '/', label: 'Home', icon: Home },
    { href: '/privacy-policy', label: 'Privacy Policy', icon: Shield },
    { href: '/report', label: 'Report', icon: Flag },
  ]

  if (loading) {
    return (
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg animate-pulse"></div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  DocUpload
                </span>
              </div>
            </div>
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <>
      {/* Backdrop for mobile menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)} />
      )}

      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">

            {/* Logo */}
            <div className="flex items-center flex-1">
              <Link
                href="/"
                className="flex items-center space-x-2 sm:space-x-3 group"
              >
                <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                  <FileText className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                </div>
                <div>
                  <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    DocUpload
                  </span>
                  <p className="hidden xs:block text-xs text-gray-500">Academic Resources</p>
                </div>
              </Link>
             

            </div>

            {/* Desktop Navigation - Medium screens and up */}
            <div className="hidden md:flex items-center space-x-1 flex-1 justify-center">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center space-x-2 px-3 lg:px-4 py-2 rounded-lg transition-all duration-200
                      ${isActive
                        ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-blue-500' : 'text-gray-400'}`} />
                    <span className="font-medium text-sm lg:text-base whitespace-nowrap">
                      {item.label}
                    </span>
                  </Link>
                )
              })}
            </div>

            {/* Desktop User Menu */}
            <div className="hidden md:flex items-center space-x-4 flex-1 justify-end">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all duration-200 active:scale-95"
                  >
                    <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {user.email?.[0].toUpperCase()}
                    </div>
                    <div className="hidden lg:block text-left">
                      <p className="text-sm font-medium text-gray-900 truncate max-w-[140px]">
                        {user.email?.split('@')[0]}
                      </p>
                      <p className="text-xs text-gray-500 truncate max-w-[140px]">
                        {user.email}
                      </p>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {userDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setUserDropdownOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-200/80 py-2 z-20 animate-fade-in">
                        {/* User Info Section */}
                        <div className="px-5 py-4 border-b border-gray-100">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                              <span className="text-white font-semibold text-base">
                                {user.email?.[0].toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {user.email?.split('@')[0]}
                              </p>
                              <p className="text-xs text-gray-500 truncate">{user.email}</p>
                            </div>
                          </div>
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-medium text-gray-700">Account Status</p>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <span className="h-2 w-2 rounded-full bg-green-500 mr-1.5"></span>
                                Active
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Sign Out Button */}
                        <div className="px-5 py-3">
                          <button
                            onClick={handleSignOut}
                            className="flex items-center space-x-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 group"
                          >
                            <div className="h-9 w-9 rounded-lg bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-all duration-200">
                              <LogOut className="h-4 w-4 text-red-500" />
                            </div>
                            <div className="text-left flex-1">
                              <p className="font-medium text-sm text-red-600">Sign Out</p>
                              <p className="text-xs text-red-400 group-hover:text-red-500">Log out from this device</p>
                            </div>
                            <svg
                              className="h-4 w-4 text-red-300 group-hover:text-red-400 transition-colors duration-200"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    href="/login"
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200 hover:bg-gray-50 rounded-lg whitespace-nowrap"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/login"
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-sm hover:shadow-md transition-all duration-200 active:scale-95 whitespace-nowrap"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button and auth state */}
            <div className="md:hidden flex items-center space-x-3">
              {user ? (
                <Link
                  href="/upload"
                  className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-sm active:scale-95 transition-transform"
                >
                  <Upload className="h-5 w-5" />
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-lg active:scale-95 transition-transform whitespace-nowrap"
                >
                  Login
                </Link>
              )}

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors duration-200 active:scale-95"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div
          ref={mobileMenuRef}
          className={`
            md:hidden fixed top-16 left-0 right-0 h-[calc(100vh-4rem)] 
            bg-white transform transition-transform duration-300 ease-in-out z-40
            overflow-y-auto
            ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
          `}
        >
          <div className="px-4 pt-6 pb-8 space-y-1">
            {/* User Info */}
            {user && (
              <div className="px-4 py-3 mb-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                    {user.email?.[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {user.email?.split('@')[0]}
                    </p>
                    <p className="text-sm text-gray-600 truncate">{user.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Links */}
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href

                // Agar user nahi hai aur item Upload hai to skip karo
                if (!user && item.href === '/upload') return null

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center space-x-4 px-4 py-3.5 rounded-xl transition-all duration-200
                      ${isActive
                        ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-600 shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50'
                      }
                    `}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? 'text-blue-500' : 'text-gray-400'}`} />
                    <span className="font-medium flex-1">{item.label}</span>
                    {isActive && (
                      <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                    )}
                  </Link>
                )
              })}
            </div>

            {/* Bottom Section */}
            <div className="pt-6 border-t border-gray-100">
              {user ? (
                <>
                  {/* Sign Out button */}
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center space-x-2 px-6 py-3.5 bg-gradient-to-r from-red-50 to-red-100 text-red-600 font-medium rounded-xl hover:from-red-100 hover:to-red-200 transition-all duration-200 active:scale-95 mb-3"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Sign Out</span>
                  </button>

                  {/* Additional info */}
                  <p className="text-center text-xs text-gray-500 px-4">
                    Signed in as {user.email?.split('@')[0]}
                  </p>
                </>
              ) : (
                <div className="space-y-3">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-center px-6 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-sm transition-all duration-200 active:scale-95"
                  >
                    Sign In
                  </Link>
                  <p className="text-center text-xs text-gray-500 px-4">
                    Sign in to upload and manage documents
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}
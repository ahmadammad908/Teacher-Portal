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


  


  return (
    <>
     
     
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">

            

       

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

            
           
          </div>
        </div>

     
   
    </>
  )
}
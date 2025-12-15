'use client'

import { useState } from 'react'
import { createClient } from '../../../lib/supabase/client'
import { Mail, Lock, User, Eye, EyeOff, AlertCircle, Mail as MailIcon, Shield,  HelpCircle, ShieldCheck, ArrowRight, CheckCircle } from 'lucide-react'

type AuthMode = 'signin' | 'signup'

export default function AuthForm() {
  const [mode, setMode] = useState<AuthMode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin')
    setEmail('')
    setPassword('')
    setFullName('')
    setMessage(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const supabase = createClient()

      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })

        if (error) throw error

        if (data.user && data.user.identities?.length === 0) {
          setMessage({
            type: 'error',
            text: 'User already exists with this email'
          })
          return
        }

        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (signInError) throw signInError

        setMessage({
          type: 'success',
          text: 'Account created successfully! Redirecting...'
        })

        setTimeout(() => {
          window.location.href = '/'
        }, 1000)

      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            setMessage({
              type: 'error',
              text: 'Invalid email or password'
            })
          } else {
            setMessage({
              type: 'error',
              text: error.message || 'Login failed'
            })
          }
          return
        }

        window.location.href = '/'
      }
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Authentication failed'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    // Fixed mobile layout with no shifting
    <div className="min-h-screen ">
      {/* Desktop Layout: Side by side */}
      <div className="hidden lg:flex min-h-screen">
        {/* Left Side - Login Form (Desktop) */}
        <div className="w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              {/* Header Section */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-lg">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Admin Portal</h2>
                  </div>
                  <div className="text-xs text-blue-100 bg-blue-800/30 px-3 py-1 rounded-full">
                    {mode === 'signin' ? 'Sign In' : 'Sign Up'}
                  </div>
                </div>
              </div>
              
              <div className="p-8">
                {/* Welcome Text */}
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {mode === 'signin' ? 'Welcome Back!' : 'Create Account'}
                  </h1>
                  <p className="text-gray-600">
                    {mode === 'signin' 
                      ? 'Sign in to access your admin dashboard' 
                      : 'Register for admin access'}
                  </p>
                </div>

                {/* Message Alerts */}
                {message && (
                  <div className={`rounded-lg p-4 mb-6 ${
                    message.type === 'success' 
                      ? 'bg-green-50 border border-green-200 text-green-800' 
                      : 'bg-red-50 border border-red-200 text-red-800'
                  }`}>
                    <div className="flex items-start">
                      {message.type === 'success' ? (
                        <CheckCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0 text-green-500" />
                      ) : (
                        <AlertCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0 text-red-500" />
                      )}
                      <span className="text-sm">{message.text}</span>
                    </div>
                  </div>
                )}

                {/* Login Form */}
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="space-y-5">
                    {mode === 'signup' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="w-5 h-5 text-gray-400" />
                          </div>
                          <input
                            id="fullName"
                            name="fullName"
                            type="text"
                            required={mode === 'signup'}
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                            placeholder="Enter your full name"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                          placeholder="admin@example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Password
                        </label>
                        
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          autoComplete={mode === 'signin' ? "current-password" : "new-password"}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-10 pr-10 py-3 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                          placeholder="Enter your password"
                          minLength={6}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                          ) : (
                            <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {mode === 'signin' && (
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="remember-me" className="ml-2 text-sm text-gray-700">
                        Remember me for 30 days
                      </label>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm hover:shadow flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {mode === 'signin' ? 'Signing in...' : 'Creating account...'}
                      </>
                    ) : (
                      <>
                        {mode === 'signin' ? 'Sign In' : 'Create Account'}
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {/* Mode Toggle */}
                  {/* <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={toggleMode}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {mode === 'signin' 
                        ? "Don't have an account? Sign up" 
                        : "Already have an account? Sign in"}
                    </button>
                  </div> */}
                </form>

                {/* Security Info */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                    <ShieldCheck className="w-4 h-4 text-green-500" />
                    <span>Secure & encrypted connection</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Information (Desktop) */}
        <div className="w-1/2 bg-gradient-to-br from-slate-900 to-gray-900 text-white p-12 flex items-center justify-center rounded-2xl">
          <div className="w-full max-w-md mx-auto">
            {/* Main Header */}
            <div className="mb-8 text-center">
              <div className="inline-flex items-center gap-2 bg-blue-900/30 text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-4">
                <Shield className="w-4 h-4" />
                Admin Access Portal
              </div>
              
              <h1 className="text-4xl font-bold mb-4 leading-tight">
                Secure Content Management
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                  Dashboard
                </span>
              </h1>
              
              <p className="text-lg text-gray-300">
                Exclusive access required for platform control, user management, and sensitive settings.
              </p>
            </div>

            {/* Important Notice */}
            <div className="bg-gradient-to-r from-red-900/30 to-red-800/20 border border-red-700/30 rounded-xl p-6 mb-8 shadow-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-lg text-red-200 mb-2">ACCESS RESTRICTION</h3>
                  <p className="text-red-100 text-sm">
                    This portal is <span className="font-semibold text-white">strictly restricted to authorized personnel only</span>. 
                    You must use valid, assigned admin credentials. 
                    All login attempts and activities are monitored for security.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Contact Info */}
            <div className="text-center pt-4 border-t border-gray-700/50">
                <p className="text-gray-400 text-sm mb-2">
                    <HelpCircle className="w-4 h-4 inline-block mr-1 text-cyan-400" /> 
                    Need Access or Support?
                </p>
                <a 
                    href="mailto:xeeshan.shani@gmail.com" 
                    className="text-cyan-300 hover:text-white font-medium text-sm transition-colors"
                >
                    xeeshan.shani@gmail.com
                </a>
            </div>

            {/* Footer Note */}
            <div className="mt-6 pt-4 border-t border-gray-700/50">
              <p className="text-center text-gray-400 text-xs">
                System monitored | 256-bit SSL encryption.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout: Stacked with fixed positioning */}
      <div className="lg:hidden">
        {/* Top Info Banner (Mobile) */}
        <div className="w-full bg-gradient-to-r from-slate-900 to-gray-900 text-white p-6 rounded-2xl">
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-2 bg-blue-900/30 text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Shield className="w-4 h-4" />
              Admin Access Portal
            </div>
            
            <h1 className="text-2xl font-bold mb-2 leading-tight">
              Secure Content Management
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                Dashboard
              </span>
            </h1>
            
            <p className="text-gray-300 text-sm">
              Exclusive access required for platform control and management.
            </p>
          </div>

          {/* Mobile Warning */}
          <div className="bg-gradient-to-r from-red-900/30 to-red-800/20 border border-red-700/30 rounded-xl p-4 mb-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-base text-red-200 mb-1">ACCESS RESTRICTION</h3>
                <p className="text-red-100 text-xs">
                  Strictly restricted to authorized personnel only. Valid admin credentials required.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Login Form (Mobile) - Fixed at bottom */}
      <div className="w-full p-4 pb-8">
  <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
    {/* Header Section */}
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 sm:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg">
            <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white">Admin Portal</h2>
        </div>
        <div className="text-xs text-blue-100 bg-blue-800/30 px-3 py-1 rounded-full">
          {mode === 'signin' ? 'Sign In' : 'Sign Up'}
        </div>
      </div>
    </div>
    
    <div className="p-4 sm:p-6">
      {/* Welcome Text */}
      <div className="text-center mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
          {mode === 'signin' ? 'Welcome Back!' : 'Create Account'}
        </h1>
        <p className="text-gray-600 text-xs sm:text-sm">
          {mode === 'signin' 
            ? 'Sign in to access admin dashboard' 
            : 'Register for admin access'}
        </p>
      </div>

      {/* Message Alerts */}
      {message && (
        <div className={`rounded-lg p-3 sm:p-4 mb-4 ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <div className="flex items-start">
            {message.type === 'success' ? (
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 mt-0.5 flex-shrink-0 text-green-500" />
            ) : (
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 mt-0.5 flex-shrink-0 text-red-500" />
            )}
            <span className="text-xs sm:text-sm leading-relaxed">{message.text}</span>
          </div>
        </div>
      )}

      {/* Login Form */}
      <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-3 sm:space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                </div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required={mode === 'signup'}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-4 py-3 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                  placeholder="Enter your full name"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-4 py-3 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                placeholder="admin@example.com"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs sm:text-sm font-medium text-gray-700">
                Password
              </label>
             
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete={mode === 'signin' ? "current-password" : "new-password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-10 py-3 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                placeholder="Enter your password"
                minLength={6}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
          </div>
        </div>

        {mode === 'signin' && (
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 text-xs sm:text-sm text-gray-700">
              Remember me for 30 days
            </label>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm hover:shadow flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {mode === 'signin' ? 'Signing in...' : 'Creating account...'}
            </>
          ) : (
            <>
              {mode === 'signin' ? 'Sign In' : 'Create Account'}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Mode Toggle (Commented out) */}
        {/* <div className="text-center pt-2">
          <button
            type="button"
            onClick={toggleMode}
            className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            {mode === 'signin' 
              ? "Don't have an account? Sign up" 
              : "Already have an account? Sign in"}
          </button>
        </div> */}
      </form>

      {/* Security Info & Contact */}
      <div className="mt-4 sm:mt-6 pt-4 border-t border-gray-200 space-y-3">
        <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-gray-600">
          <ShieldCheck className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
          <span>Secure & encrypted connection</span>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 px-2">
            Need access? Contact: <a href="mailto:xeeshan.shani@gmail.com" className="text-blue-600">xeeshan.shani@gmail.com</a>
          </p>
        </div>
      </div>
    </div>
  </div>
</div>
      </div>
    </div>
  )
}
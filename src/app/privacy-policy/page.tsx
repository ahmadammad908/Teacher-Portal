// app/privacy-policy/page.tsx
import { Shield, Clock, Lock, FileText, CheckCircle, AlertCircle, Users, Globe } from 'lucide-react'
import Link from 'next/link'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header with Gradient - Mobile Optimized */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between">
            <div className="flex items-start space-x-4 mb-8 lg:mb-0 w-full lg:w-auto">
              <div className="h-14 w-14 sm:h-16 sm:w-16 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="inline-flex items-center px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full mb-3">
                  <Clock className="h-3 w-3 text-white mr-1" />
                  <span className="text-white text-xs font-medium">COMING SOON</span>
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 break-words">
                  Privacy Policy
                </h1>
                <p className="text-blue-100 text-sm sm:text-base lg:text-lg">
                  Building comprehensive privacy guidelines for your security
                </p>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20 w-full lg:w-auto">
              <div className="flex items-center space-x-3 mb-3">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                <span className="text-white font-semibold text-sm sm:text-base">Estimated Completion</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">January 2026</p>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full w-3/4 bg-gradient-to-r from-green-400 to-blue-400"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Mobile Responsive */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 -mt-4 sm:-mt-8">
        {/* Main Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-2xl border border-gray-200 overflow-hidden mb-8 sm:mb-12">
          <div className="p-6 sm:p-8 md:p-10">
            <div className="flex flex-col lg:flex-row items-start justify-between mb-8 sm:mb-10">
              <div className="flex-1 mb-6 lg:mb-0 lg:pr-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                  Building Trust Through Transparency
                </h2>
                <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
                  We're meticulously developing a privacy policy that reflects our unwavering commitment to data protection, 
                  security, and user privacy. Our goal is to create a document that's not only compliant with global regulations 
                  but also easy to understand and transparent in its approach.
                </p>
              </div>
              <div className="hidden lg:flex items-center justify-center h-24 w-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg flex-shrink-0">
                <Lock className="h-10 w-10 text-white" />
              </div>
            </div>

            {/* Current Protections Grid */}
            <div className="mb-8 sm:mb-10">
              <div className="flex items-start space-x-3 mb-6">
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Current Security Measures</h3>
                  <p className="text-gray-500 text-sm sm:text-base">Protections already in place</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {[
                  {
                    icon: Lock,
                    title: 'End-to-End Encryption',
                    description: 'All data is encrypted using AES-256 both in transit and at rest',
                    color: 'from-blue-500 to-blue-600'
                  },
                  {
                    icon: Users,
                    title: 'Strict Access Controls',
                    description: 'Role-based access management with multi-factor authentication',
                    color: 'from-green-500 to-green-600'
                  },
                  {
                    icon: Globe,
                    title: 'GDPR & CCPA Compliance',
                    description: 'Adherence to international data protection regulations',
                    color: 'from-purple-500 to-purple-600'
                  },
                  {
                    icon: AlertCircle,
                    title: 'Regular Security Audits',
                    description: 'Third-party security assessments and penetration testing',
                    color: 'from-orange-500 to-orange-600'
                  },
                ].map((feature, index) => (
                  <div key={index} className="bg-gradient-to-br from-gray-50 to-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className={`h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-3 sm:mb-4`}>
                      <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <h4 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{feature.title}</h4>
                    <p className="text-gray-600 text-sm sm:text-base">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline Section - Mobile Responsive */}
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">Development Progress</h3>
              <div className="relative">
                {/* Progress Line - Hidden on small mobile, shown on sm+ */}
                <div className="hidden sm:block absolute left-0 right-0 top-1/2 h-1 bg-gray-200 -translate-y-1/2"></div>
                <div className="hidden sm:block absolute left-0 w-3/4 h-1 bg-gradient-to-r from-blue-500 to-purple-600 -translate-y-1/2 top-1/2"></div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                  {[
                    { 
                      step: 'Research', 
                      status: 'completed',
                      date: '5 Dec 2025',
                      description: 'Market analysis & regulation study'
                    },
                    { 
                      step: 'Drafting', 
                      status: 'completed',
                      date: '7 Dec 2025',
                      description: 'Initial policy framework creation'
                    },
                    { 
                      step: 'Legal Review', 
                      status: 'current',
                      date: '10 Dec 2025',
                      description: 'Compliance verification'
                    },
                    { 
                      step: 'Publication', 
                      status: 'pending',
                      date: 'Jan 2026',
                      description: 'Final release & implementation'
                    },
                  ].map((item, index) => (
                    <div key={index} className="relative z-10">
                      <div className="flex flex-col sm:items-center">
                        {/* Mobile: Row layout, Desktop: Column layout */}
                        <div className="flex items-center sm:flex-col">
                          <div className={`
                            h-12 w-12 sm:h-16 sm:w-16 rounded-xl sm:rounded-2xl flex items-center justify-center mb-0 sm:mb-4 mr-4 sm:mr-0
                            shadow-lg border-2 flex-shrink-0
                            ${item.status === 'completed' 
                              ? 'bg-gradient-to-br from-green-500 to-green-600 border-green-600 text-white' 
                              : item.status === 'current' 
                              ? 'bg-gradient-to-br from-blue-500 to-blue-600 border-blue-600 text-white animate-pulse' 
                              : 'bg-white border-gray-300 text-gray-400'
                            }
                          `}>
                            {item.status === 'completed' ? (
                              <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                            ) : (
                              <span className="text-lg sm:text-xl font-bold">{index + 1}</span>
                            )}
                          </div>
                          
                          <div className="flex-1 sm:text-center">
                            <div className="flex items-center sm:justify-center mb-2">
                              <span className={`
                                px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-semibold
                                ${item.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                  item.status === 'current' ? 'bg-blue-100 text-blue-800' : 
                                  'bg-gray-100 text-gray-600'
                                }
                              `}>
                                {item.status.toUpperCase()}
                              </span>
                            </div>
                            <h4 className="font-bold text-gray-900 text-sm sm:text-base mb-1">{item.step}</h4>
                            <p className="text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2">{item.date}</p>
                            <p className="text-xs text-gray-600 hidden sm:block">{item.description}</p>
                          </div>
                        </div>
                        {/* Description for mobile (below the row) */}
                        <p className="text-xs text-gray-600 mt-2 sm:hidden">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer of Card */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 border-t border-gray-200 px-6 sm:px-10 py-6 sm:py-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
              <div className="mb-4 md:mb-0 md:mr-6">
                <h4 className="font-bold text-gray-900 text-sm sm:text-base mb-2">Need Immediate Assistance?</h4>
                <p className="text-gray-600 text-sm">
                  Contact our privacy team for any urgent concerns or questions
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Link
                  href="#"
                  className="px-6 py-3 sm:px-8 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 text-center text-sm sm:text-base"
                >
                  Contact Privacy Team
                </Link>
                <Link
                  href="/"
                  className="px-6 py-3 sm:px-8 sm:py-3 bg-white text-gray-700 font-semibold rounded-xl border border-gray-300 hover:bg-gray-50 shadow-md hover:shadow-lg transition-all duration-300 text-center text-sm sm:text-base"
                >
                  Return to Home
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info Cards - Mobile Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Commitment Card */}
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl p-6 sm:p-8 border border-blue-100 shadow-lg">
            <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
              <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">Our Commitment</h4>
            <p className="text-gray-600 text-sm sm:text-base mb-4">
              We believe in building products with privacy by design. Your data security is fundamental to our mission.
            </p>
            <ul className="space-y-2">
              {['No hidden tracking', 'Clear data usage', 'User-first approach', 'Regular updates'].map((item, i) => (
                <li key={i} className="flex items-center text-gray-700 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Updates Card */}
          <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl p-6 sm:p-8 border border-purple-100 shadow-lg">
            <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
              <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">Stay Updated</h4>
            <p className="text-gray-600 text-sm sm:text-base mb-4">
              We'll notify all users when our privacy policy is officially published and ready for review.
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Email notifications</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">In-app announcements</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">Ready</span>
              </div>
            </div>
          </div>

          {/* Resources Card */}
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-lg">
            <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
              <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">Resources</h4>
            <p className="text-gray-600 text-sm sm:text-base mb-6">
              Access helpful resources about data protection and digital privacy.
            </p>
            <div className="space-y-3 sm:space-y-4">
              <a href="#" className="block text-blue-600 hover:text-blue-700 font-medium hover:underline text-sm sm:text-base">
                Data Protection Guide →
              </a>
              <a href="#" className="block text-blue-600 hover:text-blue-700 font-medium hover:underline text-sm sm:text-base">
                Security Best Practices →
              </a>
              <a href="#" className="block text-blue-600 hover:text-blue-700 font-medium hover:underline text-sm sm:text-base">
                FAQ Section →
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Note */}
        <div className="mt-8 sm:mt-12 text-center">
          <p className="text-gray-500 text-xs sm:text-sm">
            Last updated: December 2025 • Version: Draft 2.1 • Document ID: PP-DRAFT-2024-001
          </p>
        </div>
      </div>
    </div>
  )
}
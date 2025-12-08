// app/report/page.tsx
'use client'

import { useState } from 'react'
import { Flag, AlertTriangle, Send, Clock, Shield, CheckCircle, MessageSquare, User, Mail, FileText, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function ReportPage() {
  const [reportType, setReportType] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false)

  const reportTypes = [
    { id: 'content', label: 'Inappropriate Content', description: 'Report offensive or inappropriate material' },
    { id: 'bug', label: 'Technical Issue', description: 'Report bugs or functionality problems' },
    { id: 'privacy', label: 'Privacy Concern', description: 'Report data privacy or security issues' },
    { id: 'abuse', label: 'User Abuse', description: 'Report harassment or abusive behavior' },
    { id: 'copyright', label: 'Copyright Issue', description: 'Report copyright infringement' },
    { id: 'other', label: 'Other Issue', description: 'Report any other concerns' }
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulate form submission
    setIsSubmitted(true)
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false)
      setReportType('')
      setDescription('')
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 via-orange-600 to-red-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
            <div className="flex items-start space-x-4 mb-6 sm:mb-0">
              <div className="h-12 w-12 sm:h-16 sm:w-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                <Flag className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <div>
                <div className="inline-flex items-center px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full mb-2">
                  <AlertTriangle className="h-3 w-3 text-white mr-1" />
                  <span className="text-white text-xs font-medium">REPORT CENTER</span>
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
                  Report an Issue
                </h1>
                <p className="text-red-100 text-sm sm:text-base max-w-2xl">
                  Help us maintain a safe and functional platform by reporting issues you encounter
                </p>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 w-full sm:w-auto">
              <div className="flex items-center space-x-3 mb-2">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                <span className="text-white font-semibold text-sm sm:text-base">Response Time</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-white">24-48 Hours</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Alert Banner */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500 rounded-r-xl p-4 flex items-start">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <p className="text-blue-800 font-medium mb-1">Your Report is Confidential</p>
              <p className="text-blue-700 text-sm">
                All reports are handled with strict confidentiality. We review every submission within 24-48 hours.
              </p>
            </div>
          </div>
        </div>

        {/* Report Form / Success Message */}
        {isSubmitted ? (
          <div className="bg-white rounded-2xl shadow-xl border border-green-200 overflow-hidden mb-8">
            <div className="p-8 text-center">
              <div className="h-16 w-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Report Submitted Successfully!</h2>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Thank you for helping us improve our platform. Our team will review your report and take appropriate action.
              </p>
              <div className="bg-green-50 rounded-xl p-6 max-w-md mx-auto">
                <div className="flex items-center justify-center space-x-3 mb-3">
                  <Clock className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">What happens next?</span>
                </div>
                <ul className="text-left space-y-2 text-sm">
                  <li className="flex items-center text-green-700">
                    <div className="h-2 w-2 bg-green-500 rounded-full mr-3"></div>
                    Review within 24-48 hours
                  </li>
                  <li className="flex items-center text-green-700">
                    <div className="h-2 w-2 bg-green-500 rounded-full mr-3"></div>
                    Confidential investigation
                  </li>
                  <li className="flex items-center text-green-700">
                    <div className="h-2 w-2 bg-green-500 rounded-full mr-3"></div>
                    Appropriate action taken
                  </li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden mb-8">
            <div className="p-6 sm:p-8">
              {/* Form Header */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Submit Your Report</h2>
                <p className="text-gray-600">
                  Please provide detailed information about the issue you're reporting. The more information you provide, 
                  the better we can address your concerns.
                </p>
              </div>

              {/* Report Type Selection */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="h-5 w-5 text-blue-600 mr-2" />
                  Type of Report
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {reportTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setReportType(type.id)}
                      className={`
                        p-4 rounded-xl border-2 text-left transition-all duration-200
                        ${reportType === type.id 
                          ? 'border-blue-500 bg-blue-50 shadow-sm' 
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }
                      `}
                    >
                      <div className="flex items-start">
                        <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center mr-3 flex-shrink-0
                          ${reportType === type.id ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}
                        `}>
                          {reportType === type.id && (
                            <div className="h-2 w-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 mb-1">{type.label}</p>
                          <p className="text-xs text-gray-500">{type.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Description Input */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <MessageSquare className="h-5 w-5 text-blue-600 mr-2" />
                    Detailed Description
                  </h3>
                  <span className="text-xs text-gray-500">
                    {description.length}/1000 characters
                  </span>
                </div>
                <div className="relative">
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Please provide as much detail as possible about the issue. Include relevant URLs, usernames, screenshots, or other evidence if applicable."
                    className="w-full h-48 p-4 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none"
                    maxLength={1000}
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                    Required
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  <p>• Be specific and objective in your description</p>
                  <p>• Include relevant details like timestamps or URLs</p>
                  <p>• Avoid personal opinions, focus on facts</p>
                </div>
              </div>

              {/* Contact Information (Optional) */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Mail className="h-5 w-5 text-blue-600 mr-2" />
                  Contact Information (Optional)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Name
                    </label>
                    <input
                      type="text"
                      className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                      placeholder="Optional"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                      placeholder="Optional - for follow-up"
                    />
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Providing contact information allows us to follow up with you regarding your report.
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-gray-200">
                <div className="mb-4 sm:mb-0">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Note:</span> False reporting may result in account suspension.
                  </p>
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={!reportType || !description.trim()}
                  className={`
                    px-8 py-3 rounded-xl font-semibold text-white transition-all duration-300
                    flex items-center justify-center space-x-2 w-full sm:w-auto
                    ${!reportType || !description.trim()
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                    }
                  `}
                >
                  <Send className="h-5 w-5" />
                  <span>Submit Report</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Additional Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-8">
          {/* Process Information */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Shield className="h-6 w-6 text-blue-600 mr-2" />
              Our Review Process
            </h3>
            <div className="space-y-4">
              {[
                { step: '1. Submission Review', desc: 'Our team reviews each report within 24 hours' },
                { step: '2. Investigation', desc: 'We conduct a thorough investigation of the issue' },
                { step: '3. Action Taken', desc: 'Appropriate measures are implemented based on findings' },
                { step: '4. Follow-up', desc: 'We may contact you for additional information if needed' },
              ].map((item, index) => (
                <div key={index} className="flex items-start">
                  <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-blue-600 font-bold">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 mb-1">{item.step}</p>
                    <p className="text-sm text-gray-600">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Guidelines */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-lg">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <AlertTriangle className="h-6 w-6 text-orange-400 mr-2" />
              Report Guidelines
            </h3>
            <ul className="space-y-3">
              {[
                'Provide accurate and truthful information',
                'Include specific details and evidence',
                'Avoid reporting personal disputes',
                'Do not abuse the reporting system',
                'Respect others\' privacy',
                'Allow reasonable time for investigation'
              ].map((guideline, index) => (
                <li key={index} className="flex items-start">
                  <div className="h-5 w-5 bg-orange-500/20 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    <div className="h-1.5 w-1.5 bg-orange-400 rounded-full"></div>
                  </div>
                  <span className="text-gray-200">{guideline}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 p-4 bg-white/10 rounded-xl">
              <p className="text-sm text-gray-300">
                <span className="font-semibold">Emergency:</span> For immediate threats or dangerous situations, 
                contact local authorities first.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h3>
          <div className="space-y-4">
            {[
              {
                q: 'How long does it take to review a report?',
                a: 'We aim to review all reports within 24-48 hours. Complex cases may take longer.'
              },
              {
                q: 'Will I receive updates about my report?',
                a: 'If you provide contact information, we may follow up for additional details or to inform you of actions taken.'
              },
              {
                q: 'Is my report anonymous?',
                a: 'Yes, unless you choose to provide contact information. All reports are handled confidentially.'
              },
              {
                q: 'What happens after I submit a report?',
                a: 'Our team investigates, takes appropriate action, and may update our systems to prevent similar issues.'
              }
            ].map((faq, index) => (
              <div key={index} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                <h4 className="font-semibold text-gray-900 mb-2">{faq.q}</h4>
                <p className="text-gray-600 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <Link
            href="/"
            className="flex items-center space-x-2 px-6 py-3 text-gray-700 hover:text-gray-900 font-medium mb-4 sm:mb-0"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Home</span>
          </Link>
          <div className="text-center sm:text-right">
            <p className="text-sm text-gray-600 mb-2">Need immediate assistance?</p>
            <a 
              href="mailto:support@docupload.com" 
              className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
            >
              support@docupload.com
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
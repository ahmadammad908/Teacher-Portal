'use client'

import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Loader2, BookOpen, Hash, Building, ListOrdered, Calendar } from 'lucide-react'
import { createClient } from '../../../lib/supabase/client'

interface FileUploadProps {
  onUploadComplete?: () => void
  maxSize?: number // in bytes
}

// Department categories WITH ORDER
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

type DepartmentCategory = typeof DEPARTMENT_CATEGORIES[number]['id']

// Subject data for each department WITH ORDER
const SUBJECTS_BY_DEPARTMENT: Record<DepartmentCategory, Array<{id: string, name: string, order: number}>> = {
  'ADP-CS-3rd': [
    { id: 'cs-3rd-1', name: 'Civics & Community Engagement - Dr. Adeel Mumtaz', order: 1 },
    { id: 'cs-3rd-2', name: 'Computer Organization — Theory - Mr. Zeeshan Ahmed', order: 2 },
    { id: 'cs-3rd-3', name: 'Data Structures & Algorithms — Theory - Ms. Arooj Fatima', order: 3 },
    { id: 'cs-3rd-4', name: 'Pre-Calculus (Spring -2025) - Mr. Mohsin', order: 4 },
    { id: 'cs-3rd-5', name: 'Software Engineering - Dr. Sameen Aziz', order: 5 },
    { id: 'cs-3rd-6', name: 'Web Technologies - Dr. Sameen Aziz', order: 6 }
  ],
  'BSAI-1st': [
    { id: 'ai-1st-1', name: 'AICT – Theory - Mr. Hafiz Tasawar Hussain', order: 1 },
    { id: 'ai-1st-2', name: 'Applied Physics – Theory - Mr. Usman Ghani', order: 2 },
    { id: 'ai-1st-3', name: 'Discrete Structures - Mr. Haseeb', order: 3 },
    { id: 'ai-1st-4', name: 'Fehm-e-Quran – 1 - Dr. Shafique', order: 4 },
    { id: 'ai-1st-5', name: 'Functional English - Mr. Zahid Majeed', order: 5 },
    { id: 'ai-1st-6', name: 'Ideology and Constitution of Pakistan - Mr. Atta', order: 6 },
    { id: 'ai-1st-7', name: 'Leading with Character - Mr. Saeed Mushtaq', order: 7 }
  ],
  'BSAI-3rd': [
    { id: 'ai-3rd-1', name: 'Artificial Intelligence — Theory Mr. Zeeshan Ahmed', order: 1 },
    { id: 'ai-3rd-2', name: 'Data Structures — Theory Ms. Arooj Fatima', order: 2 },
    { id: 'ai-3rd-3', name: 'Ideology & Constitution Mr. Atta', order: 3 },
    { id: 'ai-3rd-4', name: 'Multivariable Calculus Mr. Mohsin Malik', order: 4 },
    { id: 'ai-3rd-5', name: 'Software Engineering Dr. Sameen Aziz', order: 5 }
  ],
  'BSCS-5th': [
    { id: 'cs-5th-1', name: 'Computer Networks — Theory Mr. Waqas Ahmad', order: 1 },
    { id: 'cs-5th-2', name: 'Digital Image Processing Ms. Arooj Fatima', order: 2 },
    { id: 'cs-5th-3', name: 'Islamic Studies / Ethics Mr. Atta', order: 3 },
    { id: 'cs-5th-4', name: 'Software Engineering Dr. Sameen Aziz', order: 4 },
    { id: 'cs-5th-5', name: 'Technical & Business Writing Mr. Ali Bukhari', order: 5 },
    { id: 'cs-5th-6', name: 'Web App Development Mr. Waqas Ahmad', order: 6 }
  ],
  'BSCS-1st': [
    { id: 'cs-1st-1', name: 'AICT – Theory Mr. Hafiz Tasawar Hussain', order: 1 },
    { id: 'cs-1st-2', name: 'Applied Physics - Theory Mr. Usman Ghani', order: 2 },
    { id: 'cs-1st-3', name: 'Discrete Structures Mr. Haseeb', order: 3 },
    { id: 'cs-1st-4', name: 'Fehm-e-Quran – 1 Dr. Shafique', order: 4 },
    { id: 'cs-1st-5', name: 'Functional English Mr. Zahid Majeed', order: 5 },
    { id: 'cs-1st-6', name: 'Functional English Mr. Zahid Majeed', order: 6 },
    { id: 'cs-1st-7', name: 'Islamic Studies Dr. Shafique', order: 7 },
    { id: 'cs-1st-8', name: 'Leading with Character Dr. Adeel Mumtaz', order: 8 }
  ],
  'BSCS-3rd': [
    { id: 'cs-3rd-1', name: 'Computer Organization — Theory Mr. Zeeshan Ahmed', order: 1 },
    { id: 'cs-3rd-2', name: 'Data Structures & Algorithms — Theory Ms. Arooj Fatima', order: 2 },
    { id: 'cs-3rd-3', name: 'Digital Marketing Mr. Abdul Karim', order: 3 },
    { id: 'cs-3rd-4', name: 'Ideology and Constitution of Pakistan Mr. Atta', order: 4 },
    { id: 'cs-3rd-5', name: 'Linear Algebra Mr. Mohsin Hassan', order: 5 },
    { id: 'cs-3rd-6', name: 'Multivariable Calculus Mr. Mohsin Malik', order: 6 }
  ],
  'BSCS-7th': [
    { id: 'cs-7th-1', name: 'Compiler Construction Mr. Saeed Mushtaq', order: 1 },
    { id: 'cs-7th-2', name: 'Freelancing Practices Mr. Zohaib', order: 2 },
    { id: 'cs-7th-3', name: 'FYP – 1 Mr. Waqas Sharif', order: 3 },
    { id: 'cs-7th-4', name: 'Information Security & Cryptography Mr. Shoaib Nawaz', order: 4 },
    { id: 'cs-7th-5', name: 'Parallel & Distributed Computing Ms. Arooj Fatima', order: 5 }
  ],
  'BSCS-7th (5th Semester)': [
    { id: 'cs-7th-5th-1', name: 'Advance Database Management Systems Mr. Zeeshan Ahmed', order: 1 },
    { id: 'cs-7th-5th-2', name: 'Compiler Construction Mr. Saeed Mushtaq', order: 2 },
    { id: 'cs-7th-5th-3', name: 'Expository Writing Mr. Kashif Ali', order: 3 },
    { id: 'cs-7th-5th-4', name: 'FYP – 1 Mr. Waqas Sharif', order: 4 },
    { id: 'cs-7th-5th-5', name: 'Introduction of Marketing (Digital Marketing) Mr. Abdul Karim', order: 5 }
  ],
  'BSCS-8th (5th Semester)': [
    { id: 'cs-8th-5th-1', name: 'Design & Analysis of Algorithms- Mr. Saeed Mustaq', order: 1 },
    { id: 'cs-8th-5th-2', name: 'Digital Image Processing Ms. Arooj Fatima', order: 2 },
    { id: 'cs-8th-5th-3', name: 'Final Year Project – II Mr. Waqas Ahmad', order: 3 },
    { id: 'cs-8th-5th-4', name: 'Parallel & Distributed Computing — Theory Ms. Arooj Fatima', order: 4 },
    { id: 'cs-8th-5th-5', name: 'Professional Practices Mr. Saeed Mushtaq', order: 5 },
    { id: 'cs-8th-5th-6', name: 'Theory of Programming Languages- Dr. Sameen Aziz', order: 6 }
  ],
  'BSIT-1st': [
    { id: 'it-1st-1', name: 'AICT – Theory Mr. Hafiz Tasawar Hussain', order: 1 },
    { id: 'it-1st-2', name: 'Applied Physics - AHS Lab Mr. Usman Ghani', order: 2 },
    { id: 'it-1st-3', name: 'Discrete Structures Mr. Haseeb', order: 3 },
    { id: 'it-1st-4', name: 'Fehm-e-Quran – 1 Dr. Shafique', order: 4 },
    { id: 'it-1st-5', name: 'Functional English Mr. Zahid Majeed', order: 5 },
    { id: 'it-1st-6', name: 'Ideology and Constitution of Pakistan Mr. Atta', order: 6 },
    { id: 'it-1st-7', name: 'Leading with Character Dr. Adeel Mumtaz', order: 7 }
  ],
  'BSIT-7th': [
    { id: 'it-7th-1', name: 'Cloud Computing Infrastructure and Services Mr. Shoaib Nawaz', order: 1 },
    { id: 'it-7th-2', name: 'FYP – 1 Mr. Waqas Sharif', order: 2 },
    { id: 'it-7th-3', name: 'Introduction to Financial Technology Dr. Saad Ur Rehman', order: 3 },
    { id: 'it-7th-4', name: 'Mobile & Wireless Communication Mr. Saeed Mushtaq', order: 4 },
    { id: 'it-7th-5', name: 'Modeling and Simulation Ms. Zimal Khan', order: 5 },
    { id: 'it-7th-6', name: 'Social Entrepreneurship Program Dr. Rabia Ismeal', order: 6 }
  ]
}

// Generate lecture numbers 1-48 WITH ORDER
const LECTURE_NUMBERS = Array.from({ length: 48 }, (_, i) => ({ 
  number: (i + 1).toString(), 
  order: i + 1 
}))

// Semester information for ordering
const SEMESTER_ORDER = {
  '1st': 1,
  '3rd': 2,
  '5th': 3,
  '7th': 4,
  '8th': 5
}

export default function FileUpload({ 
  onUploadComplete, 
  maxSize = 50 * 1024 * 1024 // 50MB default
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  
  // Form fields
  const [department, setDepartment] = useState<DepartmentCategory>('BSCS-1st')
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  const [lectureNumber, setLectureNumber] = useState<string>('')
  
  // Sequence information
  const [departmentOrder, setDepartmentOrder] = useState<number>(5) // BSCS-1st has order 5
  const [subjectOrder, setSubjectOrder] = useState<number>(0)
  const [lectureOrder, setLectureOrder] = useState<number>(0)
  const [fullSequence, setFullSequence] = useState<string>('')

  // Update available subjects when department changes
  const [availableSubjects, setAvailableSubjects] = useState<Array<{id: string, name: string, order: number}>>(
    SUBJECTS_BY_DEPARTMENT['BSCS-1st']
  )

  useEffect(() => {
    // Update subjects when department changes
    const subjects = SUBJECTS_BY_DEPARTMENT[department] || []
    setAvailableSubjects(subjects)
    
    // Reset selected subject when department changes
    setSelectedSubject('')
    setLectureNumber('')
    setSubjectOrder(0)
    setLectureOrder(0)
    setFullSequence('')
    
    // Set department order
    const deptData = DEPARTMENT_CATEGORIES.find(dept => dept.id === department)
    setDepartmentOrder(deptData?.order || 0)
  }, [department])

  useEffect(() => {
    // Update subject order when subject changes
    if (selectedSubject) {
      const subjectData = availableSubjects.find(sub => sub.name === selectedSubject)
      setSubjectOrder(subjectData?.order || 0)
    } else {
      setSubjectOrder(0)
    }
  }, [selectedSubject, availableSubjects])

  useEffect(() => {
    // Update lecture order when lecture number changes
    if (lectureNumber) {
      const lectureData = LECTURE_NUMBERS.find(lec => lec.number === lectureNumber)
      setLectureOrder(lectureData?.order || 0)
    } else {
      setLectureOrder(0)
    }
  }, [lectureNumber])

  useEffect(() => {
    // Update full sequence when all fields are selected
    if (departmentOrder > 0 && subjectOrder > 0 && lectureOrder > 0) {
      // Format: DEPT-ORDER_SUBJECT-ORDER_LECTURE-ORDER
      const sequence = `${departmentOrder.toString().padStart(2, '0')}_${subjectOrder.toString().padStart(2, '0')}_${lectureOrder.toString().padStart(2, '0')}`
      setFullSequence(sequence)
    }
  }, [departmentOrder, subjectOrder, lectureOrder])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      setSelectedFile(file)
      setError(null)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/zip': ['.zip', '.rar']
    },
    maxSize,
    multiple: false
  })

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first')
      return
    }

    // Validate form
    if (!department) {
      setError('Please select department')
      return
    }
    if (!selectedSubject) {
      setError('Please select a subject')
      return
    }
    if (!lectureNumber) {
      setError('Please select lecture number')
      return
    }

    // Validate sequence
    if (departmentOrder === 0 || subjectOrder === 0 || lectureOrder === 0) {
      setError('Sequence information is incomplete')
      return
    }

    setUploading(true)
    setError(null)
    setProgress(10)

    try {
      const supabase = createClient()
      
      // Get user session
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) throw userError
      if (!user) {
        throw new Error('You must be logged in to upload files')
      }

      setProgress(30)

      // Create unique file path with department folder structure
      const fileExt = selectedFile.name.split('.').pop()?.toLowerCase() || ''
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`
      
      // Create path: user_id/department/year-month/fileName
      const currentDate = new Date()
      const yearMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
      const filePath = `${user.id}/${department}/${yearMonth}/${fileName}`

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        throw uploadError
      }
      
      setProgress(60)

      // Get public URL
      const { data: urlData } = await supabase.storage
        .from('documents')
        .getPublicUrl(filePath)

      setProgress(80)

      // Extract teacher name and subject name
      const subjectParts = selectedSubject.split(' - ')
      const subjectName = subjectParts[0] || selectedSubject
      const teacherName = subjectParts.length > 1 ? subjectParts[subjectParts.length - 1] : ''

      // Create lecture title with sequence
      const lectureTitle = `${subjectName} - Lecture ${lectureNumber.padStart(2, '0')}`

      // Extract semester from department
      const semesterMatch = department.match(/(\d+)(?:st|nd|rd|th)/)
      const semester = semesterMatch ? semesterMatch[1] : '1'
      const semesterOrder = SEMESTER_ORDER[`${semester}th` as keyof typeof SEMESTER_ORDER] || 1

      // Prepare tags array
      const tags = [
        department,
        subjectName.trim().replace(/\s+/g, '-').toLowerCase(),
        `lecture-${lectureNumber.padStart(2, '0')}`,
        teacherName.trim().replace(/\s+/g, '-').toLowerCase(),
        `lecture-no-${lectureNumber.padStart(2, '0')}`,
        `sequence-${fullSequence}`,
        `semester-${semester}`
      ].filter(Boolean)

      // Prepare metadata for database
      const documentData = {
        user_id: user.id,
        file_name: selectedFile.name,
        file_path: filePath,
        file_size: selectedFile.size,
        file_type: selectedFile.type,
        download_url: urlData.publicUrl,
        teacher_name: teacherName.trim(),
        subject_name: subjectName.trim(),
        lecture_no: parseInt(lectureNumber), // Lecture number as integer
        lecture_title: lectureTitle,
        department: department,
        file_extension: fileExt,
        tags: tags,
        uploaded_at: new Date().toISOString(),
        
        // Sequence fields for ordering
        department_order: departmentOrder,
        subject_order: subjectOrder,
        lecture_order: lectureOrder,
        semester_order: semesterOrder,
        full_sequence: fullSequence,
        
        // For easy querying
        searchable_text: `${department} ${subjectName} ${teacherName} Lecture ${lectureNumber} ${tags.join(' ')}`.toLowerCase()
      }

      // Save metadata to database
      const { error: dbError } = await supabase
        .from('documents')
        .insert(documentData)

      if (dbError) {
        // Try to delete the uploaded file if database insert fails
        await supabase.storage
          .from('documents')
          .remove([filePath])
        throw dbError
      }

      setProgress(100)
      
      // Reset form
      setTimeout(() => {
        setSelectedFile(null)
        setSelectedSubject('')
        setLectureNumber('')
        setDepartment('BSCS-1st')
        setDepartmentOrder(5)
        setSubjectOrder(0)
        setLectureOrder(0)
        setFullSequence('')
        setProgress(0)
        setUploading(false)
        
        if (onUploadComplete) {
          onUploadComplete()
        }
      }, 1000)

    } catch (err: any) {
      console.error('Upload error:', err)
      setError(err.message || 'Upload failed. Please try again.')
      setUploading(false)
      setProgress(0)
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    setError(null)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    
    const iconMap: { [key: string]: string } = {
      'pdf': '📕',
      'ppt': '📊',
      'pptx': '📊',
      'doc': '📄',
      'docx': '📄',
      'txt': '📝',
      'png': '🖼️',
      'jpg': '🖼️',
      'jpeg': '🖼️',
      'gif': '🖼️',
      'xls': '📊',
      'xlsx': '📊',
      'zip': '📦',
      'rar': '📦'
    }
    
    return iconMap[ext || ''] || '📎'
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Upload Lecture Material</h1>
        <p className="text-gray-600 mt-2">
          Upload your lecture files (PDF, PPT, DOC, Images) with complete information
        </p>
      </div>

      {/* Form Section */}
      <div className="mb-8 bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-3 flex items-center">
          <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
          Lecture Information
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Department Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <Building className="inline h-4 w-4 mr-1 text-orange-500" />
              Department & Semester *
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value as DepartmentCategory)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
              disabled={uploading}
            >
              {DEPARTMENT_CATEGORIES.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
            {departmentOrder > 0 && (
              <div className="text-xs text-gray-500 flex items-center">
                <ListOrdered className="h-3 w-3 mr-1" />
                Order: {departmentOrder}
              </div>
            )}
          </div>

          {/* Subject Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <BookOpen className="inline h-4 w-4 mr-1 text-green-500" />
              Subject with Teacher *
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
              disabled={uploading || !department}
            >
              <option value="">Select Subject</option>
              {availableSubjects.map((subject) => (
                <option key={subject.id} value={subject.name}>
                  {subject.name}
                </option>
              ))}
            </select>
            {subjectOrder > 0 && (
              <div className="text-xs text-gray-500 flex items-center">
                <ListOrdered className="h-3 w-3 mr-1" />
                Order: {subjectOrder}
              </div>
            )}
          </div>

          {/* Lecture Number Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <Hash className="inline h-4 w-4 mr-1 text-purple-500" />
              Lecture Number *
            </label>
            <select
              value={lectureNumber}
              onChange={(e) => setLectureNumber(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              disabled={uploading || !selectedSubject}
            >
              <option value="">Select Lecture No.</option>
              {LECTURE_NUMBERS.map((lec) => (
                <option key={lec.number} value={lec.number}>
                  Lecture {lec.number.padStart(2, '0')}
                </option>
              ))}
            </select>
            {lectureOrder > 0 && (
              <div className="text-xs text-gray-500 flex items-center">
                <ListOrdered className="h-3 w-3 mr-1" />
                Order: {lectureOrder}
              </div>
            )}
          </div>
        </div>

        {/* Sequence Display */}
        {fullSequence && (
          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ListOrdered className="h-5 w-5 mr-2 text-blue-600" />
                <span className="font-medium text-blue-800">Sequence Information:</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-sm text-gray-600">Department</div>
                  <div className="font-bold text-lg text-blue-700">{departmentOrder}</div>
                </div>
                <div className="text-gray-400">→</div>
                <div className="text-center">
                  <div className="text-sm text-gray-600">Subject</div>
                  <div className="font-bold text-lg text-green-700">{subjectOrder}</div>
                </div>
                <div className="text-gray-400">→</div>
                <div className="text-center">
                  <div className="text-sm text-gray-600">Lecture</div>
                  <div className="font-bold text-lg text-purple-700">{lectureOrder}</div>
                </div>
                <div className="ml-4 px-3 py-1 bg-blue-600 text-white rounded-lg font-mono">
                  {fullSequence}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* File Upload Section */}
      <div className="mb-8">
        <div
          {...getRootProps()}
          className={`border-3 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300
            ${isDragActive ? 'border-blue-500 bg-blue-50 scale-[1.02]' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'}
            ${uploading ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
            shadow-sm hover:shadow-md`}
        >
          <input {...getInputProps()} disabled={uploading} />
          <Upload className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <p className="mt-4 text-xl font-semibold text-gray-700">
            {isDragActive ? '📦 Drop the lecture file here!' : '📤 Drag & drop your lecture file'}
          </p>
          <p className="text-gray-600 mt-2">
            or click to browse files
          </p>
          <p className="text-sm text-gray-500 mt-4 bg-gray-100 inline-block px-4 py-2 rounded-lg">
            Supported: PDF, PPT, PPTX, DOC, DOCX, TXT, Images, Excel, ZIP (Max: {formatFileSize(maxSize)})
          </p>
        </div>
      </div>

      {/* Selected File Preview */}
      {selectedFile && (
        <div className="mt-6 p-6 bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="text-3xl">
                {getFileIcon(selectedFile.name)}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800 text-lg truncate">{selectedFile.name}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                  <span className="bg-gray-100 px-2 py-1 rounded">
                    {formatFileSize(selectedFile.size)}
                  </span>
                  <span className="bg-gray-100 px-2 py-1 rounded">
                    {selectedFile.type || 'Unknown type'}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={removeFile}
              disabled={uploading}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full disabled:opacity-50 transition-colors"
              title="Remove file"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-blue-600">Uploading...</span>
                <span className="font-bold text-blue-700">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300 shadow-sm"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Summary Card */}
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Upload Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-blue-100">
                  <span className="text-gray-600">Department:</span>
                  <span className="font-medium text-gray-800">
                    {department} <span className="text-blue-600">(Order: {departmentOrder})</span>
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-blue-100">
                  <span className="text-gray-600">Subject:</span>
                  <span className="font-medium text-gray-800 text-right max-w-[200px] truncate">
                    {selectedSubject}
                    <div className="text-green-600 text-sm">Order: {subjectOrder}</div>
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Lecture:</span>
                  <span className="font-medium text-gray-800">
                    #{lectureNumber.padStart(2, '0')}
                    <div className="text-purple-600 text-sm">Order: {lectureOrder}</div>
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-blue-100">
                  <span className="text-gray-600">File:</span>
                  <span className="font-medium text-gray-800 truncate max-w-[200px] text-right">
                    {selectedFile.name}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-blue-100">
                  <span className="text-gray-600">Size:</span>
                  <span className="font-medium text-gray-800">
                    {formatFileSize(selectedFile.size)}
                  </span>
                </div>
                {fullSequence && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Sequence:</span>
                    <span className="font-mono font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded">
                      {fullSequence}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={uploading || !selectedFile || !fullSequence}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0"
          >
            {uploading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-3" />
                Uploading Lecture Material...
              </>
            ) : (
              <>
                <Upload className="h-5 w-5 mr-3" />
                Upload Lecture Material
              </>
            )}
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-700 rounded-xl">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <X className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <h3 className="font-medium">Upload Error</h3>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Information Box */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h4 className="font-medium text-gray-700 mb-2 flex items-center">
          <ListOrdered className="h-4 w-4 mr-2" />
          Sequence Guidelines:
        </h4>
        <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
          <li><span className="font-medium">Department Order:</span> Determined by department selection order</li>
          <li><span className="font-medium">Subject Order:</span> Determined by subject order within department</li>
          <li><span className="font-medium">Lecture Order:</span> Lecture number (1-48) determines order</li>
          <li><span className="font-medium">Full Sequence:</span> Format: Department-Subject-Lecture (e.g., 05_02_15)</li>
          <li>Files will be fetched in sequence order for easy navigation</li>
          <li>Same sequence will be used for organizing in storage</li>
          <li>You can filter and sort by sequence fields in the documents list</li>
        </ul>
      </div>
    </div>
  )
}
'use client'

import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Loader2, BookOpen, Hash, Building, ListOrdered, Calendar, Beaker, FileText, CheckCircle } from 'lucide-react'
import { createClient } from '../../../lib/supabase/client'
import { useRouter } from 'next/navigation'

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

// Generate lecture numbers 1-48 (Regular Lectures) and 1-16 (Lab Lectures)
const LECTURE_NUMBERS = [
  // Regular lectures 1-48 first
  ...Array.from({ length: 48 }, (_, i) => ({ 
    number: (i + 1).toString(), 
    order: i + 1,
    type: 'regular'
  })),
  // Lab lectures 1-16 after regular lectures
  ...Array.from({ length: 16 }, (_, i) => ({ 
    number: `${i + 1}(Lab)`, 
    order: i + 49,
    type: 'lab'
  }))
]

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
  const router = useRouter()
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  
  // Form fields
  const [department, setDepartment] = useState<DepartmentCategory>('BSCS-1st')
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  const [lectureNumber, setLectureNumber] = useState<string>('')
  const [lectureType, setLectureType] = useState<'regular' | 'lab'>('regular')
  
  // Sequence information
  const [departmentOrder, setDepartmentOrder] = useState<number>(5)
  const [subjectOrder, setSubjectOrder] = useState<number>(0)
  const [lectureOrder, setLectureOrder] = useState<number>(0)
  const [fullSequence, setFullSequence] = useState<string>('')

  // Update available subjects when department changes
  const [availableSubjects, setAvailableSubjects] = useState<Array<{id: string, name: string, order: number}>>(
    SUBJECTS_BY_DEPARTMENT['BSCS-1st']
  )

  useEffect(() => {
    const subjects = SUBJECTS_BY_DEPARTMENT[department] || []
    setAvailableSubjects(subjects)
    
    // Reset selected subject when department changes
    setSelectedSubject('')
    setLectureNumber('')
    setLectureType('regular')
    setSubjectOrder(0)
    setLectureOrder(0)
    setFullSequence('')
    
    // Set department order
    const deptData = DEPARTMENT_CATEGORIES.find(dept => dept.id === department)
    setDepartmentOrder(deptData?.order || 0)
  }, [department])

  useEffect(() => {
    if (selectedSubject) {
      const subjectData = availableSubjects.find(sub => sub.name === selectedSubject)
      setSubjectOrder(subjectData?.order || 0)
    } else {
      setSubjectOrder(0)
    }
  }, [selectedSubject, availableSubjects])

  useEffect(() => {
    if (lectureNumber) {
      const lectureData = LECTURE_NUMBERS.find(lec => lec.number === lectureNumber)
      setLectureOrder(lectureData?.order || 0)
      setLectureType(lectureData?.type === 'lab' ? 'lab' : 'regular')
    } else {
      setLectureOrder(0)
      setLectureType('regular')
    }
  }, [lectureNumber])

  useEffect(() => {
    if (departmentOrder > 0 && subjectOrder > 0 && lectureOrder > 0) {
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
    setSuccess(false)
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
      const isLab = lectureNumber.includes('(Lab)')
      const lectureNum = isLab ? lectureNumber.replace('(Lab)', '') : lectureNumber
      const lectureTitle = isLab 
        ? `${subjectName} - Lecture ${lectureNum.padStart(2, '0')} (Lab)`
        : `${subjectName} - Lecture ${lectureNum.padStart(2, '0')}`

      // Extract semester from department
      const semesterMatch = department.match(/(\d+)(?:st|nd|rd|th)/)
      const semester = semesterMatch ? semesterMatch[1] : '1'
      const semesterOrder = SEMESTER_ORDER[`${semester}th` as keyof typeof SEMESTER_ORDER] || 1

      // Prepare tags array
      const tags = [
        department,
        subjectName.trim().replace(/\s+/g, '-').toLowerCase(),
        isLab 
          ? `lab-${lectureNum.padStart(2, '0')}`
          : `lecture-${lectureNum.padStart(2, '0')}`,
        teacherName.trim().replace(/\s+/g, '-').toLowerCase(),
        isLab
          ? `lab-no-${lectureNum.padStart(2, '0')}`
          : `lecture-no-${lectureNum.padStart(2, '0')}`,
        `sequence-${fullSequence}`,
        `semester-${semester}`,
        isLab ? 'lab' : 'lecture',
        isLab ? 'practical' : 'theory'
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
        lecture_no: lectureNumber,
        lecture_title: lectureTitle,
        department: department,
        file_extension: fileExt,
        tags: tags,
        uploaded_at: new Date().toISOString(),
        
        // Type field for lab/regular
        lecture_type: isLab ? 'lab' : 'regular',
        
        // Sequence fields for ordering
        department_order: departmentOrder,
        subject_order: subjectOrder,
        lecture_order: lectureOrder,
        semester_order: semesterOrder,
        full_sequence: fullSequence,
        
        // For easy querying
        searchable_text: `${department} ${subjectName} ${teacherName} ${isLab ? 'Lab' : 'Lecture'} ${lectureNum} ${tags.join(' ')}`.toLowerCase()
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
      setSuccess(true)
      
      // Show success message for 2 seconds, then navigate
      setTimeout(() => {
        // Reset form
        setSelectedFile(null)
        setSelectedSubject('')
        setLectureNumber('')
        setLectureType('regular')
        setDepartment('BSCS-1st')
        setDepartmentOrder(5)
        setSubjectOrder(0)
        setLectureOrder(0)
        setFullSequence('')
        setProgress(0)
        setUploading(false)
        
        // Call callback if provided
        if (onUploadComplete) {
          onUploadComplete()
        }
        
        // Navigate to documents page
        router.push('/')
      }, 2000)

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

  const getStatusIcon = () => {
    if (success) return <CheckCircle className="h-5 w-5 text-green-500" />
    if (uploading) return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
    return null
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-3 md:p-6">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-3xl font-bold text-gray-800">Upload Lecture Material</h1>
            <p className="text-gray-600 mt-1 md:mt-2 text-xs md:text-base">
              Upload your lecture files with complete academic information
            </p>
          </div>
          {getStatusIcon() && (
            <div className="flex items-center space-x-2">
              {getStatusIcon()}
              <span className="text-sm font-medium">
                {success ? 'Upload Successful!' : 'Uploading...'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Left Column: Form and Upload */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          {/* Form Section */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-3 md:p-6 border border-gray-200">
            <div className="flex items-center mb-4 md:mb-6 pb-3 md:pb-4 border-b border-gray-100">
              <div className="p-2 bg-blue-50 rounded-lg mr-2 md:mr-3">
                <BookOpen className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-bold text-gray-800">Lecture Information</h2>
                <p className="text-gray-600 text-xs md:text-sm">Fill in all required fields</p>
              </div>
            </div>
            
            <div className="space-y-3 md:space-y-6">
              {/* Department Selection */}
              <div className="space-y-1 md:space-y-2">
                <label className="block text-xs md:text-sm font-medium text-gray-700">
                  <span className="flex items-center">
                    <Building className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2 text-orange-500" />
                    Department & Semester *
                  </span>
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value as DepartmentCategory)}
                  className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 md:focus:ring-3 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-xs md:text-base disabled:bg-gray-50"
                  disabled={uploading}
                >
                  {DEPARTMENT_CATEGORIES.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject Selection */}
              <div className="space-y-1 md:space-y-2">
                <label className="block text-xs md:text-sm font-medium text-gray-700">
                  <span className="flex items-center">
                    <FileText className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2 text-green-500" />
                    Subject with Teacher *
                  </span>
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 md:focus:ring-3 focus:ring-green-500/20 focus:border-green-500 transition-all text-xs md:text-base disabled:bg-gray-50"
                  disabled={uploading || !department}
                >
                  <option value="">Select Subject</option>
                  {availableSubjects.map((subject) => (
                    <option key={subject.id} value={subject.name}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Lecture Number Selection */}
              <div className="space-y-1 md:space-y-2">
                <label className="block text-xs md:text-sm font-medium text-gray-700">
                  <span className="flex items-center">
                    {lectureType === 'lab' ? (
                      <Beaker className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2 text-purple-500" />
                    ) : (
                      <Hash className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2 text-purple-500" />
                    )}
                    Lecture Number *
                  </span>
                </label>
                <select
                  value={lectureNumber}
                  onChange={(e) => setLectureNumber(e.target.value)}
                  className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 md:focus:ring-3 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-xs md:text-base disabled:bg-gray-50"
                  disabled={uploading || !selectedSubject}
                >
                  <option value="">Select Lecture No.</option>
                  <optgroup label="📚 Regular Lectures">
                    {LECTURE_NUMBERS.filter(lec => lec.type === 'regular').map((lec) => (
                      <option key={`${lec.number}-${lec.type}`} value={lec.number}>
                        Lecture {lec.number.padStart(2, '0')}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="🔬 Lab Lectures">
                    {LECTURE_NUMBERS.filter(lec => lec.type === 'lab').map((lec) => (
                      <option key={`${lec.number}-${lec.type}`} value={lec.number}>
                        Lecture {lec.number.replace('(Lab)', '').padStart(2, '0')} (Lab)
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Sequence Display - Fixed Overflow */}
              {fullSequence && (
                <div className="mt-3 md:mt-4 p-3 md:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg md:rounded-xl border border-blue-200">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center">
                      <ListOrdered className="h-4 w-4 md:h-5 md:w-5 mr-1 md:mr-2 text-blue-600" />
                      <span className="font-medium text-blue-800 text-xs md:text-sm">Sequence Information</span>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 md:gap-3">
                      {/* Sequence Flow */}
                      <div className="flex items-center justify-center flex-wrap gap-1 md:gap-2">
                        <div className="text-center min-w-[40px] md:min-w-[50px]">
                          <div className="text-xs text-gray-600">Dept</div>
                          <div className="font-bold text-base md:text-lg text-blue-700">{departmentOrder}</div>
                        </div>
                        <div className="text-gray-300 md:text-gray-400 mx-1">→</div>
                        <div className="text-center min-w-[40px] md:min-w-[50px]">
                          <div className="text-xs text-gray-600">Subject</div>
                          <div className="font-bold text-base md:text-lg text-green-700">{subjectOrder}</div>
                        </div>
                        <div className="text-gray-300 md:text-gray-400 mx-1">→</div>
                        <div className="text-center min-w-[40px] md:min-w-[50px]">
                          <div className="text-xs text-gray-600">{lectureType === 'lab' ? 'Lab' : 'Lec'}</div>
                          <div className="font-bold text-base md:text-lg text-purple-700">{lectureOrder}</div>
                        </div>
                      </div>
                      
                      {/* Sequence Code - Now wraps on mobile */}
                      <div className="w-full sm:w-auto mt-2 sm:mt-0">
                        <div className="px-2 md:px-3 py-1 md:py-1.5 bg-blue-600 text-white rounded-lg font-mono text-xs md:text-sm text-center sm:text-left break-all">
                          {fullSequence}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* File Upload Section */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-3 md:p-6 border border-gray-200">
            <div
              {...getRootProps()}
              className={`border-2 md:border-3 border-dashed rounded-lg md:rounded-xl p-4 md:p-8 lg:p-12 text-center cursor-pointer transition-all duration-300
                ${isDragActive ? 'border-blue-500 bg-blue-50 scale-[1.01] shadow-lg' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'}
                ${uploading ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
                shadow-sm hover:shadow-md`}
            >
              <input {...getInputProps()} disabled={uploading} />
              <div className="flex flex-col items-center">
                <div className={`p-2 md:p-4 rounded-full mb-2 md:mb-4 ${isDragActive ? 'bg-blue-100' : 'bg-gray-100'}`}>
                  <Upload className={`h-6 w-6 md:h-10 md:w-10 lg:h-16 lg:w-16 ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`} />
                </div>
                <p className="mt-1 md:mt-2 text-sm md:text-lg lg:text-xl font-semibold text-gray-800">
                  {isDragActive ? '📦 Drop your file here' : '📤 Upload your lecture file'}
                </p>
                <p className="text-gray-600 mt-1 md:mt-2 text-xs md:text-base">
                  Drag & drop or click to browse
                </p>
                <p className="text-xs text-gray-500 mt-2 md:mt-4 bg-gray-100 inline-block px-2 py-1 md:px-3 md:py-1.5 rounded">
                  PDF, PPT, DOC, Images, Excel, ZIP (Max: {formatFileSize(maxSize)})
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Preview and Info */}
        <div className="space-y-4 md:space-y-6">
          {/* Selected File Preview */}
          {selectedFile && (
            <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-3 md:p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <div className="flex items-center">
                  <div className="p-1.5 md:p-2 bg-blue-50 rounded-lg mr-2 md:mr-3">
                    <FileText className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800 text-sm md:text-base">Selected File</h3>
                </div>
                <button
                  onClick={removeFile}
                  disabled={uploading}
                  className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-50 transition-colors"
                  title="Remove file"
                >
                  <X className="h-3.5 w-3.5 md:h-4 md:w-4" />
                </button>
              </div>

              <div className="space-y-3 md:space-y-4">
                {/* File Info - Fixed Overflow */}
                <div className="flex items-start space-x-2 md:space-x-3 p-2 md:p-3 bg-gray-50 rounded-lg">
                  <div className="text-xl md:text-2xl flex-shrink-0">
                    {getFileIcon(selectedFile.name)}
                  </div>
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <p className="font-medium text-gray-800 text-xs md:text-sm break-words overflow-hidden">
                      {selectedFile.name}
                    </p>
                    <div className="flex flex-wrap gap-1 md:gap-2 mt-1 md:mt-2">
                      <span className="text-xs text-gray-600 bg-white px-1.5 py-0.5 md:px-2 md:py-1 rounded">
                        {formatFileSize(selectedFile.size)}
                      </span>
                      <span className="text-xs text-gray-600 bg-white px-1.5 py-0.5 md:px-2 md:py-1 rounded truncate max-w-[100px] md:max-w-none">
                        {selectedFile.type?.split('/').pop() || 'Unknown'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Upload Progress */}
                {uploading && (
                  <div className="space-y-1 md:space-y-2">
                    <div className="flex justify-between text-xs md:text-sm">
                      <span className="font-medium text-blue-600">Uploading...</span>
                      <span className="font-bold text-blue-700">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 md:h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-1.5 md:h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Summary - Fixed Alignment */}
                <div className="space-y-2 md:space-y-3">
                  <div className="flex items-center text-xs md:text-sm text-gray-600">
                    <Building className="h-3 w-3 md:h-3.5 md:w-3.5 mr-1.5 md:mr-2 text-orange-500 flex-shrink-0" />
                    <span className="truncate">{department}</span>
                  </div>
                  <div className="flex items-center text-xs md:text-sm text-gray-600">
                    <FileText className="h-3 w-3 md:h-3.5 md:w-3.5 mr-1.5 md:mr-2 text-green-500 flex-shrink-0" />
                    <span className="truncate">{selectedSubject || 'No subject selected'}</span>
                  </div>
                  <div className="flex items-center text-xs md:text-sm text-gray-600">
                    {lectureType === 'lab' ? (
                      <Beaker className="h-3 w-3 md:h-3.5 md:w-3.5 mr-1.5 md:mr-2 text-purple-500 flex-shrink-0" />
                    ) : (
                      <Hash className="h-3 w-3 md:h-3.5 md:w-3.5 mr-1.5 md:mr-2 text-purple-500 flex-shrink-0" />
                    )}
                    <span className="truncate">
                      {lectureNumber.includes('(Lab)') 
                        ? `Lab ${lectureNumber.replace('(Lab)', '')}` 
                        : `Lecture ${lectureNumber}`}
                    </span>
                  </div>
                </div>

                {/* Upload Button */}
                <button
                  onClick={handleUpload}
                  disabled={uploading || !selectedFile || !fullSequence}
                  className={`w-full py-2 md:py-3 px-3 md:px-4 rounded-lg md:rounded-xl font-semibold transition-all duration-200 flex items-center justify-center text-sm md:text-base
                    ${uploading || !selectedFile || !fullSequence
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:shadow-lg'
                    }`}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 md:h-4 md:w-4 animate-spin mr-1.5 md:mr-2" />
                      <span className="truncate">Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1.5 md:mr-2" />
                      <span className="truncate">Upload Lecture</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Information Card */}
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl md:rounded-2xl p-3 md:p-6 border border-gray-200">
            <div className="flex items-center mb-3 md:mb-4">
              <div className="p-1.5 md:p-2 bg-blue-100 rounded-lg mr-2 md:mr-3">
                <ListOrdered className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-800 text-sm md:text-base">Sequence Guidelines</h4>
            </div>
            
            <div className="space-y-2 md:space-y-3">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-blue-500"></div>
                </div>
                <p className="text-xs md:text-sm text-gray-600 ml-2 break-words">
                  Files are organized by Department → Subject → Lecture order
                </p>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-blue-500"></div>
                </div>
                <p className="text-xs md:text-sm text-gray-600 ml-2 break-words">
                  Regular lectures (1-48) appear before Lab lectures (1-16)
                </p>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-blue-500"></div>
                </div>
                <p className="text-xs md:text-sm text-gray-600 ml-2 break-words">
                  Sequence format: Department_Subject_Lecture (e.g., 05_02_15)
                </p>
              </div>
              
              <div className="pt-2 md:pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Regular Lectures:</span>
                  <span className="font-medium text-green-600">Order 1-48</span>
                </div>
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="text-gray-600">Lab Lectures:</span>
                  <span className="font-medium text-purple-600">Order 49-64</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Message with Countdown */}
      {success && (
        <div className="mt-3 md:mt-6">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-700 rounded-lg md:rounded-xl p-3 md:p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <CheckCircle className="h-4 w-4 md:h-5 md:w-5" />
                </div>
                <div className="ml-2 md:ml-3 flex-1 min-w-0">
                  <h3 className="font-medium text-sm md:text-base">Upload Successful!</h3>
                  <p className="text-xs md:text-sm mt-0.5 md:mt-1 break-words">
                    Your lecture material has been uploaded successfully. Redirecting to documents page...
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 bg-green-100 px-3 py-1.5 rounded-lg">
                <div className="animate-pulse h-2 w-2 bg-green-600 rounded-full"></div>
                <span className="text-xs font-medium text-green-800">Redirecting...</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-3 md:mt-6">
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-700 rounded-lg md:rounded-xl p-3 md:p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <X className="h-3.5 w-3.5 md:h-4 md:w-4" />
              </div>
              <div className="ml-2 md:ml-3 flex-1 min-w-0">
                <h3 className="font-medium text-xs md:text-sm">Upload Error</h3>
                <p className="text-xs mt-0.5 md:mt-1 break-words">{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
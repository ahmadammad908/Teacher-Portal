export interface Document {
  id: string
  user_id: string
  file_name: string
  file_path: string
  file_size: number
  file_type: string
  file_extension: string
  uploaded_at: string
  download_url: string
  thumbnail_url?: string
  last_accessed?: string
  is_favorite?: boolean
  tags?: string[]
  description?: string
}

export interface UploadResponse {
  success: boolean
  message: string
  data?: Document
  error?: string
}

export interface FileStats {
  total: number
  pdf: number
  images: number
  presentations: number
  documents: number
  others: number
  totalSize: number
  lastUpload: string | null
}

export interface PreviewInfo {
  canPreview: boolean
  previewType: 'pdf' | 'image' | 'text' | 'presentation' | 'document' | 'unsupported'
  icon: string
  color: string
}

export type AllowedFileTypes = 
  | 'application/pdf'
  | 'application/vnd.ms-powerpoint'
  | 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  | 'application/msword'
  | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  | 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  | 'application/vnd.ms-excel'
  | 'text/plain'
  | 'text/csv'
  | 'application/zip'
  | 'application/x-rar-compressed'
  | 'image/jpeg'
  | 'image/png'
  | 'image/gif'
  | 'image/webp'
  | 'image/svg+xml'
  | 'audio/mpeg'
  | 'audio/wav'
  | 'video/mp4'
  | 'video/webm'

export const ALLOWED_FILE_TYPES: Record<string, AllowedFileTypes[]> = {
  documents: [
    'application/pdf',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/plain',
    'text/csv',
  ],
  images: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml'
  ],
  media: [
    'audio/mpeg',
    'audio/wav',
    'video/mp4',
    'video/webm'
  ],
  archives: [
    'application/zip',
    'application/x-rar-compressed'
  ]
}

export const FILE_EXTENSIONS = {
  pdf: ['.pdf'],
  word: ['.doc', '.docx'],
  excel: ['.xls', '.xlsx', '.csv'],
  powerpoint: ['.ppt', '.pptx'],
  images: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
  text: ['.txt', '.md', '.json', '.xml'],
  archives: ['.zip', '.rar', '.7z'],
  audio: ['.mp3', '.wav', '.ogg'],
  video: ['.mp4', '.webm', '.avi', '.mov']
}

export const FILE_ICONS: Record<string, { icon: string; color: string; label: string }> = {
  // PDF
  'application/pdf': { 
    icon: '📄', 
    color: 'text-red-500', 
    label: 'PDF Document' 
  },
  
  // Word Documents
  'application/msword': { 
    icon: '📝', 
    color: 'text-blue-500', 
    label: 'Word Document' 
  },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { 
    icon: '📝', 
    color: 'text-blue-500', 
    label: 'Word Document' 
  },
  
  // Excel
  'application/vnd.ms-excel': { 
    icon: '📊', 
    color: 'text-green-500', 
    label: 'Excel Spreadsheet' 
  },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { 
    icon: '📊', 
    color: 'text-green-500', 
    label: 'Excel Spreadsheet' 
  },
  'text/csv': { 
    icon: '📊', 
    color: 'text-green-500', 
    label: 'CSV File' 
  },
  
  // PowerPoint
  'application/vnd.ms-powerpoint': { 
    icon: '📽️', 
    color: 'text-orange-500', 
    label: 'PowerPoint' 
  },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': { 
    icon: '📽️', 
    color: 'text-orange-500', 
    label: 'PowerPoint' 
  },
  
  // Images
  'image/jpeg': { 
    icon: '🖼️', 
    color: 'text-purple-500', 
    label: 'JPEG Image' 
  },
  'image/png': { 
    icon: '🖼️', 
    color: 'text-purple-500', 
    label: 'PNG Image' 
  },
  'image/gif': { 
    icon: '🖼️', 
    color: 'text-purple-500', 
    label: 'GIF Image' 
  },
  'image/webp': { 
    icon: '🖼️', 
    color: 'text-purple-500', 
    label: 'WebP Image' 
  },
  'image/svg+xml': { 
    icon: '🖼️', 
    color: 'text-purple-500', 
    label: 'SVG Image' 
  },
  
  // Text
  'text/plain': { 
    icon: '📃', 
    color: 'text-gray-500', 
    label: 'Text File' 
  },
  
  // Archives
  'application/zip': { 
    icon: '📦', 
    color: 'text-yellow-500', 
    label: 'ZIP Archive' 
  },
  'application/x-rar-compressed': { 
    icon: '📦', 
    color: 'text-yellow-500', 
    label: 'RAR Archive' 
  },
  
  // Audio
  'audio/mpeg': { 
    icon: '🎵', 
    color: 'text-pink-500', 
    label: 'MP3 Audio' 
  },
  'audio/wav': { 
    icon: '🎵', 
    color: 'text-pink-500', 
    label: 'WAV Audio' 
  },
  
  // Video
  'video/mp4': { 
    icon: '🎬', 
    color: 'text-indigo-500', 
    label: 'MP4 Video' 
  },
  'video/webm': { 
    icon: '🎬', 
    color: 'text-indigo-500', 
    label: 'WebM Video' 
  },
  
  // Default
  'default': { 
    icon: '📎', 
    color: 'text-gray-400', 
    label: 'File' 
  }
}

export const PREVIEW_TYPES = {
  PDF: 'pdf' as const,
  IMAGE: 'image' as const,
  TEXT: 'text' as const,
  VIDEO: 'video' as const,
  AUDIO: 'audio' as const,
  UNSUPPORTED: 'unsupported' as const
}

export type PreviewType = typeof PREVIEW_TYPES[keyof typeof PREVIEW_TYPES]

export const getFileInfo = (fileType: string, fileName: string): { 
  icon: string; 
  color: string; 
  label: string;
  previewType: PreviewType;
  canPreview: boolean;
} => {
  const fileInfo = FILE_ICONS[fileType] || FILE_ICONS.default
  
  let previewType: PreviewType = PREVIEW_TYPES.UNSUPPORTED
  let canPreview = false
  
  if (fileType.includes('pdf')) {
    previewType = PREVIEW_TYPES.PDF
    canPreview = true
  } else if (fileType.includes('image')) {
    previewType = PREVIEW_TYPES.IMAGE
    canPreview = true
  } else if (fileType.includes('text')) {
    previewType = PREVIEW_TYPES.TEXT
    canPreview = true
  } else if (fileType.includes('video')) {
    previewType = PREVIEW_TYPES.VIDEO
    canPreview = true
  } else if (fileType.includes('audio')) {
    previewType = PREVIEW_TYPES.AUDIO
    canPreview = true
  }
  
  return {
    ...fileInfo,
    previewType,
    canPreview
  }
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const getFileExtension = (fileName: string): string => {
  return fileName.split('.').pop()?.toLowerCase() || ''
}

export const isFileTypeAllowed = (fileType: string): boolean => {
  const allAllowedTypes = Object.values(ALLOWED_FILE_TYPES).flat()
  return allAllowedTypes.some(type => fileType === type)
}
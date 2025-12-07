'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { cn, formatFileSize } from '@/lib/utils'
import { ACCEPTED_VIDEO_TYPES, MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB, MAX_DURATION_MINUTES } from '@/lib/constants'
import { Upload, FileVideo, AlertCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface UploadZoneProps {
  onFileSelect: (file: File) => void
  disabled?: boolean
}

export function UploadZone({ onFileSelect, disabled }: UploadZoneProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setError(null)
    
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0]
      if (rejection.errors[0]?.code === 'file-too-large') {
        setError(`File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`)
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        setError('Invalid file type. Please upload MP4, WebM, or MOV.')
      } else {
        setError('Invalid file. Please try again.')
      }
      return
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      setSelectedFile(file)
      onFileSelect(file)
    }
  }, [onFileSelect])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_VIDEO_TYPES,
    maxSize: MAX_FILE_SIZE_BYTES,
    multiple: false,
    disabled,
  })

  const clearSelection = () => {
    setSelectedFile(null)
    setError(null)
  }

  if (selectedFile) {
    return (
      <div className="border-2 border-neon-cyan/30 rounded-xl p-8 bg-neon-cyan/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-neon-cyan/20 flex items-center justify-center">
              <FileVideo className="w-6 h-6 text-neon-cyan" />
            </div>
            <div>
              <p className="font-medium">{selectedFile.name}</p>
              <p className="text-sm text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={clearSelection}
            disabled={disabled}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all',
          isDragActive
            ? 'border-neon-cyan bg-neon-cyan/10'
            : 'border-border/40 hover:border-neon-cyan/50 hover:bg-neon-cyan/5',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4">
          <div className={cn(
            'w-16 h-16 rounded-full flex items-center justify-center transition-colors',
            isDragActive ? 'bg-neon-cyan/20' : 'bg-secondary'
          )}>
            <Upload className={cn(
              'w-8 h-8 transition-colors',
              isDragActive ? 'text-neon-cyan' : 'text-muted-foreground'
            )} />
          </div>
          <div>
            <p className="font-medium text-lg mb-1">
              {isDragActive ? 'Drop your video here' : 'Drag & drop your video'}
            </p>
            <p className="text-sm text-muted-foreground">
              or click to browse
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>MP4, WebM, MOV</span>
            <span>•</span>
            <span>Max {MAX_FILE_SIZE_MB}MB</span>
            <span>•</span>
            <span>Max {MAX_DURATION_MINUTES} minutes</span>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="mt-4 flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  )
}


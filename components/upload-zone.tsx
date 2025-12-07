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
      <div className="border border-primary/30 rounded-xl p-6 bg-primary/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileVideo className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">{selectedFile.name}</p>
              <p className="text-sm text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={clearSelection}
            disabled={disabled}
            className="h-8 w-8"
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
          'border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all',
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-border/50 hover:border-primary/50 hover:bg-primary/5',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          <div className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center transition-colors',
            isDragActive ? 'bg-primary/10' : 'bg-secondary'
          )}>
            <Upload className={cn(
              'w-5 h-5 transition-colors',
              isDragActive ? 'text-primary' : 'text-muted-foreground'
            )} />
          </div>
          <div>
            <p className="font-medium mb-1">
              {isDragActive ? 'Drop your video here' : 'Drag & drop your video'}
            </p>
            <p className="text-sm text-muted-foreground">
              or click to browse
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>MP4, WebM, MOV</span>
            <span>•</span>
            <span>Max {MAX_FILE_SIZE_MB}MB</span>
            <span>•</span>
            <span>Max {MAX_DURATION_MINUTES} min</span>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="mt-3 flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  )
}

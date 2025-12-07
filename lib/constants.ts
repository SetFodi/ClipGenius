// Video upload limits
export const MAX_FILE_SIZE_MB = 250
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024
export const MAX_DURATION_MINUTES = 20
export const MAX_DURATION_SECONDS = MAX_DURATION_MINUTES * 60

// Accepted video formats
export const ACCEPTED_VIDEO_TYPES = {
  'video/mp4': ['.mp4'],
  'video/webm': ['.webm'],
  'video/quicktime': ['.mov'],
}

// Job polling interval (ms)
export const JOB_POLL_INTERVAL = 3000

// Rate limits (free tier)
export const MAX_VIDEOS_PER_DAY = 3
export const MAX_CLIPS_PER_VIDEO = 10

// Video status options
export const VIDEO_STATUS = {
  UPLOADED: 'uploaded',
  TRANSCRIBING: 'transcribing',
  READY: 'ready',
  ERROR: 'error',
} as const

// Job status options
export const JOB_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const

// Clip status options
export const CLIP_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  READY: 'ready',
  ERROR: 'error',
} as const

// Processing stages for UI display
export const PROCESSING_STAGES = {
  downloading_video: 'Downloading video...',
  extracting_audio: 'Extracting audio...',
  transcribing: 'Transcribing (this may take a few minutes)...',
  generating_clip: 'Generating clip...',
  uploading: 'Uploading...',
  done: 'Complete!',
  error: 'An error occurred',
  timeout: 'Processing timed out',
} as const


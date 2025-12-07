export type VideoStatus = 'uploaded' | 'transcribing' | 'ready' | 'error'
export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed'
export type ClipStatus = 'pending' | 'processing' | 'ready' | 'error'
export type JobType = 'transcribe' | 'generate_clip'

export interface Video {
  id: string
  user_id: string
  filename: string
  storage_path: string
  duration_seconds: number | null
  status: VideoStatus
  created_at: string
}

export interface TranscriptSegment {
  start: number
  end: number
  text: string
}

export interface Transcript {
  id: string
  video_id: string
  content: TranscriptSegment[]
  created_at: string
}

export interface Clip {
  id: string
  video_id: string
  user_id: string
  start_time: number
  end_time: number
  storage_path: string | null
  title: string | null
  status: ClipStatus
  created_at: string
}

export interface ProcessingProgress {
  stage: string
  percent?: number
  message?: string
}

export interface Job {
  id: string
  type: JobType
  payload: Record<string, unknown>
  status: JobStatus
  result: Record<string, unknown> | null
  error: string | null
  attempts: number
  max_attempts: number
  processing_progress: ProcessingProgress | null
  timeout_at: string | null
  created_at: string
  updated_at: string
}

export interface ClipSelection {
  id: string
  start_time: number
  end_time: number
  title: string
}

export interface UploadResponse {
  video_id: string
  job_id: string
}

export interface GenerateClipsRequest {
  video_id: string
  clips: Array<{
    start_time: number
    end_time: number
    title?: string
  }>
}

export interface GenerateClipsResponse {
  clip_ids: string[]
  job_ids: string[]
}


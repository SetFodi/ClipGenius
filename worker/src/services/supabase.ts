import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabase: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (!supabase) {
    const url = process.env.SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !key) {
      throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    }

    supabase = createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  }

  return supabase
}

export interface Job {
  id: string
  type: 'transcribe' | 'generate_clip'
  payload: Record<string, any>
  status: 'pending' | 'processing' | 'completed' | 'failed'
  result: Record<string, any> | null
  error: string | null
  attempts: number
  max_attempts: number
  processing_progress: { stage: string; percent?: number } | null
  timeout_at: string | null
  created_at: string
  updated_at: string
}

export interface Video {
  id: string
  user_id: string
  filename: string
  storage_path: string
  duration_seconds: number | null
  status: string
  created_at: string
}

export interface TranscriptSegment {
  start: number
  end: number
  text: string
}

export async function updateJobProgress(
  jobId: string,
  stage: string,
  percent?: number
): Promise<void> {
  const supabase = getSupabase()
  await supabase
    .from('jobs')
    .update({
      processing_progress: { stage, percent },
      updated_at: new Date().toISOString(),
    })
    .eq('id', jobId)
}

export async function completeJob(
  jobId: string,
  result: Record<string, any>
): Promise<void> {
  const supabase = getSupabase()
  await supabase
    .from('jobs')
    .update({
      status: 'completed',
      result,
      processing_progress: { stage: 'done' },
      updated_at: new Date().toISOString(),
    })
    .eq('id', jobId)
}

export async function failJob(
  jobId: string,
  error: string,
  shouldRetry: boolean
): Promise<void> {
  const supabase = getSupabase()
  await supabase
    .from('jobs')
    .update({
      status: shouldRetry ? 'pending' : 'failed',
      error,
      processing_progress: { stage: 'error', message: error },
      updated_at: new Date().toISOString(),
    })
    .eq('id', jobId)
}


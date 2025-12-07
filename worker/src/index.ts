import 'dotenv/config'
import {
  getSupabase,
  Job,
  completeJob,
  failJob,
} from './services/supabase'
import { processTranscriptionJob } from './jobs/transcribe'
import { processClipGenerationJob } from './jobs/generateClip'

// Configuration
const POLL_INTERVAL_MS = 5000 // 5 seconds
const TRANSCRIBE_TIMEOUT_MS = 10 * 60 * 1000 // 10 minutes
const CLIP_TIMEOUT_MS = 5 * 60 * 1000 // 5 minutes

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function recoverTimedOutJobs(): Promise<void> {
  const supabase = getSupabase()
  const now = new Date().toISOString()

  try {
    // Find jobs that are stuck in processing past their timeout
    const { data: timedOutJobs, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('status', 'processing')
      .lt('timeout_at', now)

    if (error || !timedOutJobs) {
      return
    }

    for (const job of timedOutJobs) {
      const shouldFail = job.attempts >= job.max_attempts
      console.log(
        `[Worker] Recovering timed-out job ${job.id} (attempts: ${job.attempts}/${job.max_attempts})`
      )

      await supabase
        .from('jobs')
        .update({
          status: shouldFail ? 'failed' : 'pending',
          error: 'Job timed out',
          processing_progress: { stage: 'timeout' },
          updated_at: now,
        })
        .eq('id', job.id)

      // If transcription timed out, mark video as error
      if (shouldFail && job.type === 'transcribe') {
        const videoId = job.payload?.video_id
        if (videoId) {
          await supabase
            .from('videos')
            .update({ status: 'error' })
            .eq('id', videoId)
        }
      }

      // If clip generation timed out, mark clip as error
      if (shouldFail && job.type === 'generate_clip') {
        const clipId = job.payload?.clip_id
        if (clipId) {
          await supabase
            .from('clips')
            .update({ status: 'error' })
            .eq('id', clipId)
        }
      }
    }
  } catch (err) {
    console.error('[Worker] Error recovering timed-out jobs:', err)
  }
}

async function claimJob(): Promise<Job | null> {
  const supabase = getSupabase()

  const { data: job, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (error || !job) {
    return null
  }

  // Calculate timeout
  const now = new Date()
  const timeoutMs =
    job.type === 'transcribe' ? TRANSCRIBE_TIMEOUT_MS : CLIP_TIMEOUT_MS
  const timeoutAt = new Date(now.getTime() + timeoutMs).toISOString()

  // Claim the job by updating its status
  const { error: updateError } = await supabase
    .from('jobs')
    .update({
      status: 'processing',
      attempts: job.attempts + 1,
      timeout_at: timeoutAt,
      updated_at: now.toISOString(),
      processing_progress: { stage: 'starting' },
    })
    .eq('id', job.id)
    .eq('status', 'pending') // Ensure we only claim if still pending

  if (updateError) {
    console.error('[Worker] Failed to claim job:', updateError)
    return null
  }

  return job as Job
}

async function processJob(job: Job): Promise<void> {
  console.log(`[Worker] Processing job ${job.id} (type: ${job.type})`)

  try {
    let result: Record<string, any>

    switch (job.type) {
      case 'transcribe':
        result = await processTranscriptionJob(job)
        break

      case 'generate_clip':
        result = await processClipGenerationJob(job)
        break

      default:
        throw new Error(`Unknown job type: ${job.type}`)
    }

    await completeJob(job.id, result)
    console.log(`[Worker] Job ${job.id} completed successfully`)

  } catch (err: any) {
    const errorMessage = err.message || String(err)
    console.error(`[Worker] Job ${job.id} failed:`, errorMessage)

    const shouldRetry = job.attempts < job.max_attempts
    await failJob(job.id, errorMessage, shouldRetry)

    // Update related entity status if final failure
    if (!shouldRetry) {
      const supabase = getSupabase()

      if (job.type === 'transcribe') {
        const videoId = job.payload?.video_id
        if (videoId) {
          await supabase
            .from('videos')
            .update({ status: 'error' })
            .eq('id', videoId)
        }
      }

      if (job.type === 'generate_clip') {
        const clipId = job.payload?.clip_id
        if (clipId) {
          await supabase
            .from('clips')
            .update({ status: 'error' })
            .eq('id', clipId)
        }
      }
    }
  }
}

async function main(): Promise<void> {
  console.log('[Worker] ClipGenius Worker starting...')
  console.log(`[Worker] Poll interval: ${POLL_INTERVAL_MS}ms`)
  console.log(`[Worker] Transcribe timeout: ${TRANSCRIBE_TIMEOUT_MS}ms`)
  console.log(`[Worker] Clip timeout: ${CLIP_TIMEOUT_MS}ms`)

  // Validate environment
  const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'GROQ_API_KEY']
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.error(`[Worker] Missing required environment variable: ${envVar}`)
      process.exit(1)
    }
  }

  console.log('[Worker] Environment validated. Starting polling loop...')

  // Main polling loop
  while (true) {
    try {
      // Recover any timed-out jobs
      await recoverTimedOutJobs()

      // Try to claim and process a job
      const job = await claimJob()

      if (job) {
        await processJob(job)
        // Short sleep before checking for next job
        await sleep(1000)
      } else {
        // No jobs available, sleep for poll interval
        await sleep(POLL_INTERVAL_MS)
      }
    } catch (err) {
      console.error('[Worker] Error in main loop:', err)
      await sleep(POLL_INTERVAL_MS)
    }
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('[Worker] Received SIGINT. Shutting down...')
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('[Worker] Received SIGTERM. Shutting down...')
  process.exit(0)
})

// Start the worker
main().catch((err) => {
  console.error('[Worker] Fatal error:', err)
  process.exit(1)
})


import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import {
  getSupabase,
  updateJobProgress,
  Job,
  Video,
  TranscriptSegment,
} from '../services/supabase'
import { extractAudio, getVideoDuration } from '../services/ffmpeg'
import { transcribeAudio } from '../services/groq'

const MAX_DURATION_SECONDS = 20 * 60 // 20 minutes

export async function processTranscriptionJob(job: Job): Promise<{ transcript_id: string }> {
  const supabase = getSupabase()
  const tempFiles: string[] = []
  const videoId = job.payload.video_id as string

  try {
    // 1. Get video info
    console.log(`[Transcribe] Starting job ${job.id} for video ${videoId}`)
    
    const { data: video, error: videoError } = await supabase
      .from('videos')
      .select('*')
      .eq('id', videoId)
      .single()

    if (videoError || !video) {
      throw new Error(`Video not found: ${videoId}`)
    }

    const videoData = video as Video

    // 2. Download video from storage
    await updateJobProgress(job.id, 'downloading_video')
    console.log(`[Transcribe] Downloading video from ${videoData.storage_path}`)

    const { data: fileData, error: downloadError } = await supabase.storage
      .from('videos')
      .download(videoData.storage_path)

    if (downloadError || !fileData) {
      throw new Error(`Failed to download video: ${downloadError?.message}`)
    }

    // Save to temp file
    const tempDir = os.tmpdir()
    const videoExt = path.extname(videoData.filename) || '.mp4'
    const tempVideoPath = path.join(tempDir, `video-${job.id}${videoExt}`)
    
    const buffer = Buffer.from(await fileData.arrayBuffer())
    fs.writeFileSync(tempVideoPath, buffer)
    tempFiles.push(tempVideoPath)

    console.log(`[Transcribe] Video saved to ${tempVideoPath}`)

    // 3. Get video duration and validate
    const duration = await getVideoDuration(tempVideoPath)
    console.log(`[Transcribe] Video duration: ${duration} seconds`)

    // Update video with duration
    await supabase
      .from('videos')
      .update({ duration_seconds: Math.round(duration) })
      .eq('id', videoId)

    if (duration > MAX_DURATION_SECONDS) {
      throw new Error(`Video too long. Maximum duration is ${MAX_DURATION_SECONDS / 60} minutes.`)
    }

    // 4. Extract audio
    await updateJobProgress(job.id, 'extracting_audio')
    console.log(`[Transcribe] Extracting audio...`)

    const tempAudioPath = path.join(tempDir, `audio-${job.id}.mp3`)
    await extractAudio(tempVideoPath, tempAudioPath)
    tempFiles.push(tempAudioPath)

    console.log(`[Transcribe] Audio extracted to ${tempAudioPath}`)

    // 5. Transcribe with Groq
    await updateJobProgress(job.id, 'transcribing')
    console.log(`[Transcribe] Sending to Groq Whisper API...`)

    const segments = await transcribeAudio(tempAudioPath)
    console.log(`[Transcribe] Got ${segments.length} transcript segments`)

    // 6. Save transcript to database
    const { data: transcript, error: transcriptError } = await supabase
      .from('transcripts')
      .insert({
        video_id: videoId,
        content: segments,
      })
      .select('id')
      .single()

    if (transcriptError || !transcript) {
      throw new Error(`Failed to save transcript: ${transcriptError?.message}`)
    }

    // 7. Update video status to ready
    await supabase
      .from('videos')
      .update({ status: 'ready' })
      .eq('id', videoId)

    console.log(`[Transcribe] Job ${job.id} completed successfully`)

    return { transcript_id: transcript.id }

  } finally {
    // Clean up temp files
    for (const filePath of tempFiles) {
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
          console.log(`[Transcribe] Cleaned up: ${filePath}`)
        }
      } catch (err) {
        console.error(`[Transcribe] Failed to clean up ${filePath}:`, err)
      }
    }
  }
}


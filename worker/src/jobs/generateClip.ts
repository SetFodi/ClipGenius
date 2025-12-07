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
import { generateClip, generateSRT } from '../services/ffmpeg'

export async function processClipGenerationJob(job: Job): Promise<{ clip_id: string }> {
  const supabase = getSupabase()
  const tempFiles: string[] = []

  const videoId = job.payload.video_id as string
  const clipId = job.payload.clip_id as string
  const startTime = job.payload.start as number
  const endTime = job.payload.end as number

  try {
    console.log(`[GenerateClip] Starting job ${job.id} for clip ${clipId}`)
    console.log(`[GenerateClip] Time range: ${startTime}s - ${endTime}s`)

    // 1. Get video info
    const { data: video, error: videoError } = await supabase
      .from('videos')
      .select('*')
      .eq('id', videoId)
      .single()

    if (videoError || !video) {
      throw new Error(`Video not found: ${videoId}`)
    }

    const videoData = video as Video

    // 2. Get transcript for captions
    const { data: transcript } = await supabase
      .from('transcripts')
      .select('content')
      .eq('video_id', videoId)
      .single()

    const segments = (transcript?.content || []) as TranscriptSegment[]

    // 3. Update clip status to processing
    await supabase
      .from('clips')
      .update({ status: 'processing' })
      .eq('id', clipId)

    // 4. Download video
    await updateJobProgress(job.id, 'downloading_video')
    console.log(`[GenerateClip] Downloading video from ${videoData.storage_path}`)

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

    console.log(`[GenerateClip] Video saved to ${tempVideoPath}`)

    // 5. Generate SRT file for captions
    await updateJobProgress(job.id, 'generating_clip')
    
    let srtPath: string | undefined
    if (segments.length > 0) {
      const srtContent = generateSRT(segments, startTime, endTime)
      if (srtContent) {
        srtPath = path.join(tempDir, `captions-${job.id}.srt`)
        fs.writeFileSync(srtPath, srtContent)
        tempFiles.push(srtPath)
        console.log(`[GenerateClip] Generated SRT file: ${srtPath}`)
      }
    }

    // 6. Generate vertical clip with FFmpeg
    const outputPath = path.join(tempDir, `clip-${clipId}.mp4`)
    tempFiles.push(outputPath)

    console.log(`[GenerateClip] Generating clip with FFmpeg...`)
    await generateClip({
      videoPath: tempVideoPath,
      outputPath,
      startTime,
      endTime,
      srtPath,
    })

    console.log(`[GenerateClip] Clip generated: ${outputPath}`)

    // 7. Upload clip to storage
    await updateJobProgress(job.id, 'uploading')
    
    const clipBuffer = fs.readFileSync(outputPath)
    const storagePath = `${videoData.user_id}/${clipId}.mp4`

    const { error: uploadError } = await supabase.storage
      .from('clips')
      .upload(storagePath, clipBuffer, {
        contentType: 'video/mp4',
        cacheControl: '3600',
      })

    if (uploadError) {
      throw new Error(`Failed to upload clip: ${uploadError.message}`)
    }

    console.log(`[GenerateClip] Clip uploaded to ${storagePath}`)

    // 8. Update clip record with storage path and status
    await supabase
      .from('clips')
      .update({
        storage_path: storagePath,
        status: 'ready',
      })
      .eq('id', clipId)

    console.log(`[GenerateClip] Job ${job.id} completed successfully`)

    return { clip_id: clipId }

  } catch (error: any) {
    // Update clip status to error
    await supabase
      .from('clips')
      .update({ status: 'error' })
      .eq('id', clipId)

    throw error

  } finally {
    // Clean up temp files
    for (const filePath of tempFiles) {
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
          console.log(`[GenerateClip] Cleaned up: ${filePath}`)
        }
      } catch (err) {
        console.error(`[GenerateClip] Failed to clean up ${filePath}:`, err)
      }
    }
  }
}


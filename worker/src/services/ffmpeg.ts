import * as fs from 'fs'
import * as path from 'path'
import { spawn } from 'child_process'

export interface FFProbeResult {
  duration: number
  width: number
  height: number
}

export async function getVideoDuration(videoPath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const ffprobe = spawn('ffprobe', [
      '-v', 'error',
      '-show_entries', 'format=duration',
      '-of', 'default=noprint_wrappers=1:nokey=1',
      videoPath,
    ])

    let output = ''
    let error = ''

    ffprobe.stdout.on('data', (data) => {
      output += data.toString()
    })

    ffprobe.stderr.on('data', (data) => {
      error += data.toString()
    })

    ffprobe.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`ffprobe failed: ${error}`))
        return
      }
      const duration = parseFloat(output.trim())
      if (isNaN(duration)) {
        reject(new Error('Could not parse video duration'))
        return
      }
      resolve(duration)
    })
  })
}

export async function extractAudio(
  videoPath: string,
  outputPath: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn('ffmpeg', [
      '-i', videoPath,
      '-vn',                    // No video
      '-acodec', 'libmp3lame',  // MP3 codec
      '-ar', '16000',           // 16kHz sample rate (good for speech)
      '-ac', '1',               // Mono
      '-b:a', '64k',            // Lower bitrate to keep file small
      '-y',                     // Overwrite output
      outputPath,
    ])

    let error = ''

    ffmpeg.stderr.on('data', (data) => {
      error += data.toString()
    })

    ffmpeg.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`FFmpeg audio extraction failed: ${error}`))
        return
      }
      resolve()
    })
  })
}

export interface ClipOptions {
  videoPath: string
  outputPath: string
  startTime: number
  endTime: number
  srtPath?: string
}

export async function generateClip(options: ClipOptions): Promise<void> {
  const { videoPath, outputPath, startTime, endTime, srtPath } = options

  // Build filter complex for cropping to 9:16
  let filterComplex = 'crop=ih*9/16:ih,scale=1080:1920'
  
  if (srtPath && fs.existsSync(srtPath)) {
    // TikTok/Shorts style captions:
    // - Large bold font
    // - White text with black outline
    // - Positioned at bottom center
    // - Each word/phrase pops in sync with speech
    const escapedSrtPath = srtPath.replace(/'/g, "'\\''").replace(/:/g, '\\:')
    
    // Style breakdown (MrBeast/Viral Shorts style):
    // FontSize=18      - Smaller, cleaner
    // FontName=Arial   - Clean bold sans-serif
    // Bold=1           - Essential for readability
    // PrimaryColour    - White (&HFFFFFF)
    // OutlineColour    - Black (&H000000)
    // BackColour       - Transparent (No box!)
    // Outline=4        - Thick outline (the MrBeast signature)
    // Shadow=0         - No drop shadow, just outline
    // MarginV=70       - Positioned safely above bottom UI
    // Alignment=2      - Bottom center
    const subtitleStyle = [
      'FontSize=16',
      'FontName=Arial',
      'Bold=1',
      'PrimaryColour=&HFFFFFF',
      'OutlineColour=&H000000',
      'BackColour=&H00000000',
      'Outline=4',
      'Shadow=0',
      'MarginV=20',
      'Alignment=2',
    ].join(',')
    
    filterComplex += `,subtitles='${escapedSrtPath}':force_style='${subtitleStyle}'`
  }

  return new Promise((resolve, reject) => {
    const args = [
      '-i', videoPath,
      '-ss', startTime.toString(),
      '-to', endTime.toString(),
      '-vf', filterComplex,
      '-c:v', 'libx264',
      '-preset', 'fast',
      '-crf', '23',
      '-c:a', 'aac',
      '-b:a', '128k',
      '-movflags', '+faststart',
      '-y',
      outputPath,
    ]

    console.log('FFmpeg command:', 'ffmpeg', args.join(' '))

    const ffmpeg = spawn('ffmpeg', args)

    let error = ''

    ffmpeg.stderr.on('data', (data) => {
      const line = data.toString()
      error += line
      // Log progress lines
      if (line.includes('frame=') || line.includes('time=')) {
        console.log('FFmpeg progress:', line.trim())
      }
    })

    ffmpeg.on('close', (code) => {
      if (code !== 0) {
        console.error('FFmpeg error output:', error)
        reject(new Error(`FFmpeg clip generation failed: ${error.slice(-500)}`))
        return
      }
      resolve()
    })
  })
}

export function generateSRT(
  segments: Array<{ start: number; end: number; text: string }>,
  clipStart: number,
  clipEnd: number
): string {
  // Filter segments that overlap with the clip time range
  const relevantSegments = segments.filter(
    (seg) => seg.end > clipStart && seg.start < clipEnd
  )

  if (relevantSegments.length === 0) {
    return ''
  }

  // Generate SRT content
  let srtContent = ''
  let index = 1

  for (const seg of relevantSegments) {
    // Adjust times relative to clip start
    const adjustedStart = Math.max(0, seg.start - clipStart)
    const adjustedEnd = Math.min(clipEnd - clipStart, seg.end - clipStart)

    // Skip if segment is too short
    if (adjustedEnd - adjustedStart < 0.1) continue

    // Format times as SRT timestamps (HH:MM:SS,mmm)
    const startTs = formatSRTTime(adjustedStart)
    const endTs = formatSRTTime(adjustedEnd)

    // Clean up the text - uppercase for impact (Viral style)
    const baseText = seg.text.trim().toUpperCase()
    
    if (!baseText) continue

    // Add a subtle \"pop\" animation using ASS override tags understood by libass:
    // - \\fad(80,80) → quick fade-in / fade-out (80 ms)
    // - first \\t → scale up slightly (115%) over 120 ms
    // - second \\t → settle back to 100% over next 80 ms
    const animatedText =
      `{\\fad(80,80)` +
      `\\t(0,120,\\fscx115\\fscy115)` +
      `\\t(120,200,\\fscx100\\fscy100)}` +
      baseText

    srtContent += `${index}\n`
    srtContent += `${startTs} --> ${endTs}\n`
    srtContent += `${animatedText}\n\n`
    index++
  }

  return srtContent
}

function formatSRTTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  const ms = Math.round((seconds % 1) * 1000)

  return `${pad(hours)}:${pad(minutes)}:${pad(secs)},${pad(ms, 3)}`
}

function pad(num: number, size: number = 2): string {
  let s = num.toString()
  while (s.length < size) s = '0' + s
  return s
}

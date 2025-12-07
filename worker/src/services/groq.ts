import * as fs from 'fs'
import * as path from 'path'

interface WhisperWord {
  word: string
  start: number
  end: number
}

interface WhisperSegment {
  start: number
  end: number
  text: string
  words?: WhisperWord[]
}

interface WhisperResponse {
  segments?: WhisperSegment[]
  words?: WhisperWord[]
  text?: string
}

export interface TranscriptSegment {
  start: number
  end: number
  text: string
}

export async function transcribeAudio(audioPath: string): Promise<TranscriptSegment[]> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    throw new Error('Missing GROQ_API_KEY')
  }

  console.log(`Transcribing audio file: ${audioPath}`)

  // Check file size (Groq has a 25MB limit)
  const stats = fs.statSync(audioPath)
  const fileSizeMB = stats.size / (1024 * 1024)
  console.log(`Audio file size: ${fileSizeMB.toFixed(2)}MB`)

  if (fileSizeMB > 25) {
    throw new Error('Audio file too large for transcription (max 25MB)')
  }

  // Read file as buffer and create Blob
  const fileBuffer = fs.readFileSync(audioPath)
  const blob = new Blob([fileBuffer], { type: 'audio/mp3' })

  // Create FormData with the audio file
  const formData = new FormData()
  formData.append('file', blob, path.basename(audioPath))
  formData.append('model', 'whisper-large-v3')
  formData.append('response_format', 'verbose_json')
  formData.append('timestamp_granularities[]', 'word')
  formData.append('timestamp_granularities[]', 'segment')
  formData.append('language', 'en')

  // Make request to Groq
  const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
    body: formData,
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Groq API error:', errorText)
    throw new Error(`Groq API error: ${response.status} - ${errorText}`)
  }

  const data = await response.json() as WhisperResponse

  // Try to get word-level timestamps first (for better captions)
  if (data.words && Array.isArray(data.words) && data.words.length > 0) {
    console.log(`Got ${data.words.length} words with timestamps`)
    // Group words into short phrases (3-4 words each) for dynamic, fast-paced captions
    return groupWordsIntoSegments(data.words, 3)
  }

  // Fallback to segment-level if no words
  if (data.segments && Array.isArray(data.segments)) {
    // Check if segments have word-level data
    const allWords: WhisperWord[] = []
    for (const seg of data.segments) {
      if (seg.words && Array.isArray(seg.words)) {
        allWords.push(...seg.words)
      }
    }
    
    if (allWords.length > 0) {
      console.log(`Got ${allWords.length} words from segments`)
      return groupWordsIntoSegments(allWords, 3)
    }

    // No word-level data, use segments but try to split long ones
    console.log(`Got ${data.segments.length} segments (no word-level timestamps)`)
    return data.segments.map((seg) => ({
      start: seg.start,
      end: seg.end,
      text: seg.text.trim(),
    }))
  }

  // Final fallback: if no segments, create one from full text
  if (data.text) {
    return [{
      start: 0,
      end: 0,
      text: data.text,
    }]
  }

  return []
}

/**
 * Groups words into short segments for TikTok-style captions
 * @param words - Array of words with timestamps
 * @param wordsPerGroup - Max number of words per caption group
 */
function groupWordsIntoSegments(
  words: WhisperWord[],
  wordsPerGroup: number = 3
): TranscriptSegment[] {
  const segments: TranscriptSegment[] = []
  
  for (let i = 0; i < words.length; i += wordsPerGroup) {
    const group = words.slice(i, i + wordsPerGroup)
    if (group.length === 0) continue
    
    const text = group.map(w => w.word).join(' ').trim()
    const start = group[0].start
    const end = group[group.length - 1].end
    
    segments.push({ start, end, text })
  }
  
  return segments
}

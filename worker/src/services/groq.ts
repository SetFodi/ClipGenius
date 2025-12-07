import * as fs from 'fs'
import * as path from 'path'
import FormData from 'form-data'

interface WhisperSegment {
  start: number
  end: number
  text: string
}

interface WhisperResponse {
  segments?: WhisperSegment[]
  text?: string
}

export async function transcribeAudio(audioPath: string): Promise<WhisperSegment[]> {
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

  // Create form data
  const formData = new FormData()
  formData.append('file', fs.createReadStream(audioPath), {
    filename: path.basename(audioPath),
    contentType: 'audio/mp3',
  })
  formData.append('model', 'whisper-large-v3')
  formData.append('response_format', 'verbose_json')
  formData.append('language', 'en')

  // Make request to Groq
  const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      ...formData.getHeaders(),
    },
    body: formData as any,
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Groq API error:', errorText)
    throw new Error(`Groq API error: ${response.status} - ${errorText}`)
  }

  const data = await response.json() as WhisperResponse

  // Parse segments
  if (data.segments && Array.isArray(data.segments)) {
    return data.segments.map((seg) => ({
      start: seg.start,
      end: seg.end,
      text: seg.text.trim(),
    }))
  }

  // Fallback: if no segments, create one from full text
  if (data.text) {
    return [{
      start: 0,
      end: 0,
      text: data.text,
    }]
  }

  return []
}


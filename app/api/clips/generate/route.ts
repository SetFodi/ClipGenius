import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

interface ClipRequest {
  video_id: string
  start_time: number
  end_time: number
  title?: string
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { video_id, clips } = body as { video_id: string; clips: ClipRequest[] }

    if (!video_id || !clips || !Array.isArray(clips) || clips.length === 0) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    // Verify video belongs to user
    const { data: video, error: videoError } = await supabase
      .from('videos')
      .select('*')
      .eq('id', video_id)
      .eq('user_id', user.id)
      .single()

    if (videoError || !video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    // Validate clip count
    if (clips.length > 10) {
      return NextResponse.json({ error: 'Maximum 10 clips per request' }, { status: 400 })
    }

    const clip_ids: string[] = []
    const job_ids: string[] = []

    // Create clips and jobs
    for (const clipData of clips) {
      // Validate clip times
      if (clipData.start_time < 0 || clipData.end_time <= clipData.start_time) {
        continue
      }

      if (video.duration_seconds && clipData.end_time > video.duration_seconds) {
        continue
      }

      // Create clip record
      const { data: clip, error: clipError } = await supabase
        .from('clips')
        .insert({
          video_id,
          user_id: user.id,
          start_time: clipData.start_time,
          end_time: clipData.end_time,
          title: clipData.title || null,
          status: 'pending',
        })
        .select('id')
        .single()

      if (clipError || !clip) {
        console.error('Error creating clip:', clipError)
        continue
      }

      clip_ids.push(clip.id)

      // Create job for this clip
      const { data: job, error: jobError } = await supabase
        .from('jobs')
        .insert({
          type: 'generate_clip',
          payload: {
            video_id,
            clip_id: clip.id,
            start: clipData.start_time,
            end: clipData.end_time,
          },
          status: 'pending',
          attempts: 0,
          max_attempts: 3,
        })
        .select('id')
        .single()

      if (jobError || !job) {
        console.error('Error creating job:', jobError)
        continue
      }

      job_ids.push(job.id)
    }

    return NextResponse.json({ clip_ids, job_ids })
  } catch (error) {
    console.error('Error generating clips:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


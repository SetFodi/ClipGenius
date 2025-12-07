import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: job, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Verify user has access to this job (via video ownership)
    const videoId = job.payload?.video_id
    if (videoId) {
      const { data: video } = await supabase
        .from('videos')
        .select('user_id')
        .eq('id', videoId)
        .single()

      if (!video || video.user_id !== user.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }
    }

    return NextResponse.json(job)
  } catch (error) {
    console.error('Error fetching job:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


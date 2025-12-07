import { createClient } from '@/lib/supabase/server'
import { MAX_CLIPS_PER_VIDEO, type PlanId } from '@/lib/constants'
import { getLimitsForPlan, resolvePlan } from '@/lib/plan'
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

    // Validate clip count per request
    if (clips.length > MAX_CLIPS_PER_VIDEO) {
      return NextResponse.json(
        { error: `Maximum ${MAX_CLIPS_PER_VIDEO} clips per request` },
        { status: 400 }
      )
    }

    // Determine user's plan (defaults to free if no usage row or plan set)
    let plan: PlanId = 'free'
    try {
      const { data: usageRows, error: usageError } = await supabase
        .from('user_usage')
        .select('plan')
        .eq('user_id', user.id)
        .limit(1)

      if (!usageError && usageRows && usageRows.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        plan = resolvePlan((usageRows[0] as any).plan)
      }
    } catch {
      // ignore and keep default plan
    }

    const { maxClips } = getLimitsForPlan(plan)
    const planLabel = plan === 'free' ? 'Free' : plan === 'creator' ? 'Creator' : 'Pro'

    // Enforce per-user clip limit based on plan
    const { count: clipCount, error: clipCountError } = await supabase
      .from('clips')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if (clipCountError) {
      console.error('Failed to count user clips:', clipCountError)
    }

    const clipsGenerated = clipCount ?? 0
    const requestedCount = clips.length

    if (clipsGenerated >= maxClips) {
      return NextResponse.json(
        { error: `${planLabel} plan limit reached: you can generate up to ${maxClips} clips.` },
        { status: 403 }
      )
    }

    if (clipsGenerated + requestedCount > maxClips) {
      const remaining = maxClips - clipsGenerated
      return NextResponse.json(
        { error: `You can generate ${remaining} more clip${remaining === 1 ? '' : 's'} on your ${planLabel} plan.` },
        { status: 403 }
      )
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


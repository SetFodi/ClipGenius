'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { VideoPlayer, VideoPlayerRef } from '@/components/video-player'
import { TranscriptViewer } from '@/components/transcript-viewer'
import { ClipSelector } from '@/components/clip-selector'
import { UserNav } from '@/components/user-nav'
import { 
  Sparkles, 
  ArrowLeft, 
  Loader2, 
  AlertCircle,
  Scissors,
  RefreshCw
} from 'lucide-react'
import { JOB_POLL_INTERVAL, PROCESSING_STAGES } from '@/lib/constants'
import type { Video, Transcript, Job, ClipSelection, TranscriptSegment } from '@/lib/types'
import type { User } from '@supabase/supabase-js'

export default function VideoPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()
  const videoRef = useRef<VideoPlayerRef>(null)

  const [user, setUser] = useState<User | null>(null)
  const [video, setVideo] = useState<Video | null>(null)
  const [transcript, setTranscript] = useState<Transcript | null>(null)
  const [transcribeJob, setTranscribeJob] = useState<Job | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [clipSelections, setClipSelections] = useState<ClipSelection[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)

  const videoId = params.id as string

  // Fetch initial data
  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)

      // Fetch video
      const { data: videoData, error: videoError } = await supabase
        .from('videos')
        .select('*')
        .eq('id', videoId)
        .eq('user_id', user.id)
        .single()

      if (videoError || !videoData) {
        toast({
          title: 'Video not found',
          description: 'This video does not exist or you do not have access.',
          variant: 'destructive',
        })
        router.push('/dashboard')
        return
      }

      setVideo(videoData as Video)

      // Get video URL
      const { data: urlData } = await supabase.storage
        .from('videos')
        .createSignedUrl(videoData.storage_path, 3600) // 1 hour expiry

      if (urlData?.signedUrl) {
        setVideoUrl(urlData.signedUrl)
      }

      // If video is ready, fetch transcript
      if (videoData.status === 'ready') {
        const { data: transcriptData } = await supabase
          .from('transcripts')
          .select('*')
          .eq('video_id', videoId)
          .single()

        if (transcriptData) {
          setTranscript(transcriptData as Transcript)
        }
      }

      // If video is transcribing, find the job
      if (videoData.status === 'transcribing' || videoData.status === 'uploaded') {
        const { data: jobData } = await supabase
          .from('jobs')
          .select('*')
          .eq('payload->>video_id', videoId)
          .eq('type', 'transcribe')
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (jobData) {
          setTranscribeJob(jobData as Job)
        }
      }

      setLoading(false)
    }

    fetchData()
  }, [videoId, router, supabase, toast])

  // Poll for job updates
  useEffect(() => {
    if (!transcribeJob || transcribeJob.status === 'completed' || transcribeJob.status === 'failed') {
      return
    }

    const interval = setInterval(async () => {
      const { data: jobData } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', transcribeJob.id)
        .single()

      if (jobData) {
        setTranscribeJob(jobData as Job)

        if (jobData.status === 'completed') {
          // Fetch transcript and update video
          const { data: transcriptData } = await supabase
            .from('transcripts')
            .select('*')
            .eq('video_id', videoId)
            .single()

          if (transcriptData) {
            setTranscript(transcriptData as Transcript)
          }

          // Update video status
          setVideo(prev => prev ? { ...prev, status: 'ready' } : null)

          toast({
            title: 'Transcription complete!',
            description: 'You can now select clips from your video.',
            variant: 'success',
          })
        } else if (jobData.status === 'failed') {
          setVideo(prev => prev ? { ...prev, status: 'error' } : null)
          toast({
            title: 'Transcription failed',
            description: jobData.error || 'Something went wrong. Please try again.',
            variant: 'destructive',
          })
        }
      }
    }, JOB_POLL_INTERVAL)

    return () => clearInterval(interval)
  }, [transcribeJob, videoId, supabase, toast])

  const handleTimeUpdate = useCallback((time: number) => {
    setCurrentTime(time)
  }, [])

  const handleSegmentClick = useCallback((time: number) => {
    videoRef.current?.seekTo(time)
  }, [])

  const handleAddClip = useCallback((clip: ClipSelection) => {
    setClipSelections(prev => [...prev, clip])
  }, [])

  const handleRemoveClip = useCallback((id: string) => {
    setClipSelections(prev => prev.filter(c => c.id !== id))
  }, [])

  const handleUpdateClip = useCallback((id: string, updates: Partial<ClipSelection>) => {
    setClipSelections(prev =>
      prev.map(c => (c.id === id ? { ...c, ...updates } : c))
    )
  }, [])

  const handleSeekTo = useCallback((time: number) => {
    videoRef.current?.seekTo(time)
  }, [])

  const handleGenerateClips = async () => {
    if (clipSelections.length === 0) return

    setIsGenerating(true)

    try {
      const response = await fetch('/api/clips/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          video_id: videoId,
          clips: clipSelections.map(c => ({
            start_time: c.start_time,
            end_time: c.end_time,
            title: c.title,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate clips')
      }

      const data = await response.json()

      toast({
        title: 'Clips queued!',
        description: `${data.clip_ids.length} clip(s) are being generated.`,
        variant: 'success',
      })

      // Clear selections and redirect to clips page
      setClipSelections([])
      router.push('/clips')
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate clips. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleRetryTranscription = async () => {
    try {
      // Create a new transcription job
      const { error: jobError } = await supabase
        .from('jobs')
        .insert({
          type: 'transcribe',
          payload: { video_id: videoId },
          status: 'pending',
          attempts: 0,
          max_attempts: 3,
        })

      if (jobError) throw jobError

      // Update video status
      await supabase
        .from('videos')
        .update({ status: 'transcribing' })
        .eq('id', videoId)

      setVideo(prev => prev ? { ...prev, status: 'transcribing' } : null)

      // Refetch job
      const { data: jobData } = await supabase
        .from('jobs')
        .select('*')
        .eq('payload->>video_id', videoId)
        .eq('type', 'transcribe')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (jobData) {
        setTranscribeJob(jobData as Job)
      }

      toast({
        title: 'Retrying transcription',
        description: 'Your video is being transcribed again.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to retry transcription.',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-neon-cyan" />
      </div>
    )
  }

  if (!video || !user) {
    return null
  }

  const segments = (transcript?.content || []) as TranscriptSegment[]
  const isProcessing = video.status === 'transcribing' || video.status === 'uploaded'
  const hasError = video.status === 'error'
  const isReady = video.status === 'ready'

  const processingStage = transcribeJob?.processing_progress?.stage || 'pending'
  const stageMessage = PROCESSING_STAGES[processingStage as keyof typeof PROCESSING_STAGES] || 'Processing...'

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-neon-cyan/20 border border-neon-cyan/50 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-neon-cyan" />
            </div>
            <span className="font-bold text-xl">
              Clip<span className="text-neon-cyan">Genius</span>
            </span>
          </Link>
          
          <UserNav user={user} />
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6">
        {/* Back button and title */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-2 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold">{video.filename}</h1>
          </div>
          
          {isReady && (
            <Button
              variant="neon"
              onClick={handleGenerateClips}
              disabled={clipSelections.length === 0 || isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Scissors className="w-4 h-4 mr-2" />
                  Generate {clipSelections.length} Clip{clipSelections.length !== 1 ? 's' : ''}
                </>
              )}
            </Button>
          )}
        </div>

        {/* Processing state */}
        {isProcessing && (
          <Card className="border-border/40 bg-card/50 mb-6">
            <CardContent className="flex items-center gap-4 py-8">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-neon-cyan/30 border-t-neon-cyan animate-spin" />
                <Sparkles className="w-6 h-6 text-neon-cyan absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Transcribing your video...</h3>
                <p className="text-muted-foreground">{stageMessage}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  This usually takes 2-5 minutes depending on video length.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error state */}
        {hasError && (
          <Card className="border-destructive/50 bg-destructive/10 mb-6">
            <CardContent className="flex items-center justify-between py-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-destructive" />
                </div>
                <div>
                  <h3 className="font-semibold">Transcription failed</h3>
                  <p className="text-sm text-muted-foreground">
                    {transcribeJob?.error || 'Something went wrong during transcription.'}
                  </p>
                </div>
              </div>
              <Button variant="outline" onClick={handleRetryTranscription}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-16rem)]">
          {/* Video player */}
          <div className="lg:col-span-2">
            <Card className="border-border/40 bg-card/50 h-full flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Video Preview</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 min-h-0 pb-4">
                {videoUrl ? (
                  <VideoPlayer
                    ref={videoRef}
                    src={videoUrl}
                    className="h-full"
                    onTimeUpdate={handleTimeUpdate}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center bg-black rounded-lg">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right panel - Transcript or Clip selector */}
          <div className="flex flex-col gap-4 h-full min-h-0">
            {isReady ? (
              <>
                {/* Transcript */}
                <Card className="border-border/40 bg-card/50 flex-1 min-h-0 flex flex-col">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Transcript</CardTitle>
                      <Badge variant="success">{segments.length} segments</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 min-h-0 p-0">
                    <TranscriptViewer
                      segments={segments}
                      currentTime={currentTime}
                      onSegmentClick={handleSegmentClick}
                      className="h-full"
                    />
                  </CardContent>
                </Card>

                {/* Clip selector */}
                <Card className="border-border/40 bg-card/50 flex-1 min-h-0 flex flex-col">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Clip Selection</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 min-h-0 p-0">
                    <ClipSelector
                      selections={clipSelections}
                      currentTime={currentTime}
                      videoDuration={video.duration_seconds || 0}
                      onAddClip={handleAddClip}
                      onRemoveClip={handleRemoveClip}
                      onUpdateClip={handleUpdateClip}
                      onSeekTo={handleSeekTo}
                      className="h-full"
                    />
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="border-border/40 bg-card/50 flex-1">
                <CardContent className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-muted-foreground">
                      {isProcessing
                        ? 'Transcript will appear here once processing is complete.'
                        : 'Transcript unavailable.'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}


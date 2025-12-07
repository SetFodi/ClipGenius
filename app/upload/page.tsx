'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/components/ui/use-toast'
import { UploadZone } from '@/components/upload-zone'
import { ArrowLeft, Loader2, CheckCircle, Zap } from 'lucide-react'
import { MAX_FILE_SIZE_MB, MAX_DURATION_MINUTES } from '@/lib/constants'
import { getLimitsForPlan, resolvePlan } from '@/lib/plan'

type UploadState = 'idle' | 'uploading' | 'creating-job' | 'done' | 'error'

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploadState, setUploadState] = useState<UploadState>('idle')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [videoId, setVideoId] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile)
  }

  const handleUpload = async () => {
    if (!file) return

    try {
      setUploadState('uploading')
      setUploadProgress(0)

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Not authenticated')
      }

      // Determine user's plan (defaults to free if no usage row or plan set)
      let plan = resolvePlan()
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

      const { maxVideos } = getLimitsForPlan(plan)
      const planLabel = plan === 'free' ? 'Free' : plan === 'creator' ? 'Creator' : 'Pro'

      // Check video limit based on plan
      const { count: videoCount } = await supabase
        .from('videos')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      if (videoCount !== null && videoCount >= maxVideos) {
        throw new Error(`${planLabel} plan limit reached: you can upload up to ${maxVideos} videos.`)
      }

      // Generate storage path
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const storagePath = `${user.id}/${fileName}`

      // Upload to Supabase Storage with progress tracking
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 500)

      const { error: uploadError } = await supabase.storage
        .from('videos')
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      clearInterval(progressInterval)
      setUploadProgress(95)

      if (uploadError) {
        throw uploadError
      }

      setUploadState('creating-job')

      // Create video record
      const { data: video, error: videoError } = await supabase
        .from('videos')
        .insert({
          user_id: user.id,
          filename: file.name,
          storage_path: storagePath,
          status: 'uploaded',
        })
        .select('id')
        .single()

      if (videoError) {
        throw videoError
      }

      // Create transcription job
      const { error: jobError } = await supabase
        .from('jobs')
        .insert({
          type: 'transcribe',
          payload: { video_id: video.id },
          status: 'pending',
          attempts: 0,
          max_attempts: 3,
        })

      if (jobError) {
        throw jobError
      }

      // Update video status to transcribing
      await supabase
        .from('videos')
        .update({ status: 'transcribing' })
        .eq('id', video.id)

      setUploadProgress(100)
      setVideoId(video.id)
      setUploadState('done')

      toast({
        title: 'Upload complete!',
        description: 'Your video is now being transcribed.',
      })

      // Redirect to video page after a short delay
      setTimeout(() => {
        router.push(`/video/${video.id}`)
      }, 1500)

    } catch (error: any) {
      console.error('Upload error:', error)
      setUploadState('error')
      toast({
        title: 'Upload failed',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const isUploading = uploadState === 'uploading' || uploadState === 'creating-job'

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-400 flex items-center justify-center">
              <span className="text-white font-black text-sm">C</span>
            </div>
            <span className="font-semibold text-lg tracking-tight">
              clip<span className="text-primary">genius</span>
            </span>
          </Link>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-6 py-8">
        {/* Back button */}
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle>Upload Video</CardTitle>
            <CardDescription>
              Upload your video to transcribe and create clips. 
              Max {MAX_FILE_SIZE_MB}MB, {MAX_DURATION_MINUTES} minutes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {uploadState === 'done' ? (
              <div className="text-center py-8">
                <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-7 h-7 text-green-400" />
                </div>
                <h3 className="text-lg font-medium mb-2">Upload Complete!</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Redirecting to your video...
                </p>
                <Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" />
              </div>
            ) : (
              <>
                <UploadZone 
                  onFileSelect={handleFileSelect} 
                  disabled={isUploading}
                />

                {file && uploadState !== 'idle' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {uploadState === 'uploading' && 'Uploading...'}
                        {uploadState === 'creating-job' && 'Setting up transcription...'}
                      </span>
                      <span className="text-primary">{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-1.5" />
                  </div>
                )}

                <Button
                  onClick={handleUpload}
                  disabled={!file || isUploading}
                  className="w-full"
                  size="lg"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {uploadState === 'uploading' ? 'Uploading...' : 'Processing...'}
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Upload & Transcribe
                    </>
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Tips */}
        <div className="mt-6 p-4 rounded-xl bg-card border border-border/50">
          <h4 className="font-medium mb-2 text-sm">Tips for best results</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Use clear audio for better transcription accuracy</li>
            <li>• Shorter clips (5-20 min) process faster</li>
            <li>• MP4 with H.264 codec works best</li>
          </ul>
        </div>
      </main>
    </div>
  )
}

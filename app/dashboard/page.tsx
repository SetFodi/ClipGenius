import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Video, 
  Scissors, 
  Clock,
  ChevronRight,
  AlertCircle
} from 'lucide-react'
import { formatRelativeTime, formatDuration } from '@/lib/utils'
import type { Video as VideoType } from '@/lib/types'
import { UserNav } from '@/components/user-nav'
import { getLimitsForPlan, resolvePlan } from '@/lib/plan'
import type { PlanId } from '@/lib/constants'

function getStatusBadge(status: string) {
  switch (status) {
    case 'uploaded':
      return <Badge variant="secondary">Uploaded</Badge>
    case 'transcribing':
      return <Badge className="bg-primary/20 text-primary border-primary/30">Processing...</Badge>
    case 'ready':
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Ready</Badge>
    case 'error':
      return <Badge variant="destructive">Error</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
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

  const { maxVideos, maxClips } = getLimitsForPlan(plan)
  const planLabel = plan === 'free' ? 'Free' : plan === 'creator' ? 'Creator' : 'Pro'

  // Fetch user's videos
  const { data: videos } = await supabase
    .from('videos')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Fetch clip count
  const { count: clipCount } = await supabase
    .from('clips')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'ready')

  const videoList = (videos || []) as VideoType[]
  const readyVideos = videoList.filter(v => v.status === 'ready').length
  const videosUsed = videoList.length
  const clipsUsed = clipCount || 0
  const isFreePlan = plan === 'free'

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
          
          <UserNav user={user} />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-card border-border/50">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                <Video className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{videosUsed}/{maxVideos}</p>
                <p className="text-sm text-muted-foreground">Videos uploaded</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card border-border/50">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                <Scissors className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{clipsUsed}/{maxClips}</p>
                <p className="text-sm text-muted-foreground">Clips generated</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card border-border/50">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="w-11 h-11 rounded-xl bg-green-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{readyVideos}</p>
                <p className="text-sm text-muted-foreground">Ready to clip</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Plan badge */}
        <div className="mb-4">
          <Badge variant="secondary" className="uppercase tracking-wide text-[10px] px-2 py-1">
            {planLabel} plan
          </Badge>
        </div>

        {/* Videos Section */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">Your Videos</h2>
            <p className="text-sm text-muted-foreground">Upload content to create viral clips</p>
          </div>
          <Link href="/upload">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Upload Video
            </Button>
          </Link>
        </div>

        {videoList.length === 0 ? (
          <Card className="bg-card border-border/50 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Video className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">No videos yet</h3>
              <p className="text-muted-foreground text-center max-w-sm mb-6 text-sm">
                Upload your first video to start creating viral clips with AI-powered transcription.
              </p>
              <Link href="/upload">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Upload Your First Video
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {videoList.map((video) => (
              <Link key={video.id} href={`/video/${video.id}`}>
                <Card className="bg-card border-border/50 hover:border-primary/30 transition-colors cursor-pointer group">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center">
                        <Video className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium group-hover:text-primary transition-colors">
                          {video.filename}
                        </p>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          {video.duration_seconds && (
                            <span>{formatDuration(video.duration_seconds)}</span>
                          )}
                          <span>•</span>
                          <span>{formatRelativeTime(video.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {getStatusBadge(video.status)}
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Usage Notice for free plan users approaching limits */}
        {isFreePlan && (videosUsed >= maxVideos - 1 || clipsUsed >= maxClips - 1) && (
          <Card className="mt-8 bg-primary/5 border-primary/20">
            <CardContent className="flex items-start gap-4 p-4">
              <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Running low on free tier</p>
                <p className="text-sm text-muted-foreground">
                  Upgrade to Creator or Pro to unlock higher limits.{' '}
                  <Link href="/pricing" className="text-primary hover:underline">View plans</Link>
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}

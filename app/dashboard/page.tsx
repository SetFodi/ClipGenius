import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Video, 
  Scissors, 
  Clock, 
  Sparkles,
  ChevronRight,
  AlertCircle
} from 'lucide-react'
import { formatRelativeTime, formatDuration } from '@/lib/utils'
import type { Video as VideoType } from '@/lib/types'
import { UserNav } from '@/components/user-nav'

function getStatusBadge(status: string) {
  switch (status) {
    case 'uploaded':
      return <Badge variant="secondary">Uploaded</Badge>
    case 'transcribing':
      return <Badge variant="processing">Transcribing...</Badge>
    case 'ready':
      return <Badge variant="success">Ready</Badge>
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

  // Fetch user's videos
  const { data: videos, error } = await supabase
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

  return (
    <div className="min-h-screen">
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

      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-border/40 bg-card/50">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="w-12 h-12 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center">
                <Video className="w-6 h-6 text-neon-cyan" />
              </div>
              <div>
                <p className="text-2xl font-bold">{videoList.length}</p>
                <p className="text-sm text-muted-foreground">Videos uploaded</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-border/40 bg-card/50">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="w-12 h-12 rounded-lg bg-neon-pink/10 border border-neon-pink/30 flex items-center justify-center">
                <Scissors className="w-6 h-6 text-neon-pink" />
              </div>
              <div>
                <p className="text-2xl font-bold">{clipCount || 0}</p>
                <p className="text-sm text-muted-foreground">Clips generated</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-border/40 bg-card/50">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="w-12 h-12 rounded-lg bg-neon-green/10 border border-neon-green/30 flex items-center justify-center">
                <Clock className="w-6 h-6 text-neon-green" />
              </div>
              <div>
                <p className="text-2xl font-bold">{readyVideos}</p>
                <p className="text-sm text-muted-foreground">Ready to clip</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Videos Section */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Your Videos</h2>
            <p className="text-muted-foreground">Upload gaming footage to create viral clips</p>
          </div>
          <Link href="/upload">
            <Button variant="neon">
              <Plus className="w-4 h-4 mr-2" />
              Upload Video
            </Button>
          </Link>
        </div>

        {videoList.length === 0 ? (
          <Card className="border-border/40 bg-card/50 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center mb-4">
                <Video className="w-8 h-8 text-neon-cyan" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No videos yet</h3>
              <p className="text-muted-foreground text-center max-w-sm mb-6">
                Upload your first gaming video to start creating viral clips with AI-powered transcription.
              </p>
              <Link href="/upload">
                <Button variant="neon">
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
                <Card className="border-border/40 bg-card/50 hover:border-neon-cyan/30 transition-colors cursor-pointer group">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
                        <Video className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium group-hover:text-neon-cyan transition-colors">
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
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-neon-cyan transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Usage Notice */}
        <Card className="mt-8 border-border/40 bg-card/50">
          <CardContent className="flex items-start gap-4 p-4">
            <AlertCircle className="w-5 h-5 text-neon-orange mt-0.5" />
            <div>
              <p className="font-medium">Free Tier Limits</p>
              <p className="text-sm text-muted-foreground">
                You can process up to 3 videos per day. Videos must be under 250MB and 20 minutes long.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}


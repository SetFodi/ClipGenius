'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { UserNav } from '@/components/user-nav'
import { 
  Download, 
  Trash2, 
  Loader2, 
  Video,
  RefreshCw,
  ArrowLeft
} from 'lucide-react'
import { formatDuration, formatRelativeTime } from '@/lib/utils'
import { JOB_POLL_INTERVAL } from '@/lib/constants'
import type { Clip } from '@/lib/types'
import type { User } from '@supabase/supabase-js'

interface ClipWithUrl extends Clip {
  publicUrl?: string
  videoFilename?: string
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'pending':
      return <Badge variant="secondary">Pending</Badge>
    case 'processing':
      return <Badge className="bg-primary/20 text-primary border-primary/30">Processing...</Badge>
    case 'ready':
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Ready</Badge>
    case 'error':
      return <Badge variant="destructive">Error</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export default function ClipsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const [user, setUser] = useState<User | null>(null)
  const [clips, setClips] = useState<ClipWithUrl[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchClips = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }
    setUser(user)

    const { data: clipsData, error } = await supabase
      .from('clips')
      .select(`
        *,
        videos (filename)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching clips:', error)
      return
    }

    const clipsWithUrls: ClipWithUrl[] = await Promise.all(
      (clipsData || []).map(async (clip: any) => {
        let publicUrl: string | undefined
        if (clip.storage_path && clip.status === 'ready') {
          const { data } = supabase.storage
            .from('clips')
            .getPublicUrl(clip.storage_path)
          publicUrl = data.publicUrl
        }
        return {
          ...clip,
          publicUrl,
          videoFilename: clip.videos?.filename,
        }
      })
    )

    setClips(clipsWithUrls)
    setLoading(false)
  }, [supabase, router])

  useEffect(() => {
    fetchClips()
  }, [fetchClips])

  useEffect(() => {
    const processingClips = clips.filter(
      c => c.status === 'pending' || c.status === 'processing'
    )
    
    if (processingClips.length === 0) return

    const interval = setInterval(async () => {
      const { data: updatedClips } = await supabase
        .from('clips')
        .select('*')
        .in('id', processingClips.map(c => c.id))

      if (updatedClips) {
        let hasUpdates = false
        const newClips = [...clips]

        for (const updated of updatedClips) {
          const index = newClips.findIndex(c => c.id === updated.id)
          if (index !== -1 && newClips[index].status !== updated.status) {
            hasUpdates = true
            
            let publicUrl: string | undefined
            if (updated.storage_path && updated.status === 'ready') {
              const { data } = supabase.storage
                .from('clips')
                .getPublicUrl(updated.storage_path)
              publicUrl = data.publicUrl
            }

            newClips[index] = {
              ...newClips[index],
              ...updated,
              publicUrl,
            }

            if (updated.status === 'ready') {
              toast({
                title: 'Clip ready!',
                description: `"${updated.title || 'Your clip'}" is ready to download.`,
              })
            }
          }
        }

        if (hasUpdates) {
          setClips(newClips)
        }
      }
    }, JOB_POLL_INTERVAL)

    return () => clearInterval(interval)
  }, [clips, supabase, toast])

  const handleDelete = async (clipId: string) => {
    setDeletingId(clipId)

    try {
      const response = await fetch(`/api/clips/${clipId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete clip')
      }

      setClips(prev => prev.filter(c => c.id !== clipId))
      toast({
        title: 'Clip deleted',
        description: 'The clip has been removed.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete clip.',
        variant: 'destructive',
      })
    } finally {
      setDeletingId(null)
    }
  }

  const handleDownload = async (clip: ClipWithUrl) => {
    if (!clip.publicUrl) return

    try {
      const response = await fetch(clip.publicUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${clip.title || 'clip'}.mp4`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download clip.',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const readyClips = clips.filter(c => c.status === 'ready')
  const processingClips = clips.filter(c => c.status === 'pending' || c.status === 'processing')

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
          
          {user && <UserNav user={user} />}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold">My Clips</h1>
            <p className="text-sm text-muted-foreground">
              {clips.length} clip{clips.length !== 1 ? 's' : ''} • {readyClips.length} ready
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchClips}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Processing clips */}
        {processingClips.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-medium mb-4 flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              Processing ({processingClips.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {processingClips.map((clip) => (
                <Card key={clip.id} className="bg-card border-border/50">
                  <CardContent className="p-4">
                    <div className="aspect-video bg-secondary rounded-lg flex items-center justify-center mb-4">
                      <div className="text-center">
                        <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground">Generating...</p>
                      </div>
                    </div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{clip.title || 'Untitled'}</p>
                        <p className="text-xs text-muted-foreground truncate">{clip.videoFilename}</p>
                      </div>
                      {getStatusBadge(clip.status)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Ready clips */}
        {clips.length === 0 ? (
          <Card className="bg-card border-border/50 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Video className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">No clips yet</h3>
              <p className="text-muted-foreground text-center max-w-sm mb-6 text-sm">
                Upload a video and select moments to create your first viral clips.
              </p>
              <Link href="/dashboard">
                <Button>Go to Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {readyClips.map((clip) => (
              <Card key={clip.id} className="bg-card border-border/50 group hover:border-primary/30 transition-colors">
                <CardContent className="p-4">
                  {/* Video preview */}
                  <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
                    {clip.publicUrl ? (
                      <video
                        src={clip.publicUrl}
                        className="w-full h-full object-contain"
                        controls
                        playsInline
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Video className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Clip info */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{clip.title || 'Untitled'}</p>
                      <p className="text-xs text-muted-foreground truncate">{clip.videoFilename}</p>
                    </div>
                    {getStatusBadge(clip.status)}
                  </div>

                  {/* Meta */}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                    <span>{formatDuration(clip.end_time - clip.start_time)}</span>
                    <span>•</span>
                    <span>{formatRelativeTime(clip.created_at)}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handleDownload(clip)}
                      disabled={!clip.publicUrl}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(clip.id)}
                      disabled={deletingId === clip.id}
                    >
                      {deletingId === clip.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

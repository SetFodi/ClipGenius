'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn, formatDuration } from '@/lib/utils'
import { Play, Trash2, Flag, FlagOff } from 'lucide-react'
import type { ClipSelection } from '@/lib/types'
import { MAX_CLIPS_PER_VIDEO } from '@/lib/constants'

interface ClipSelectorProps {
  selections: ClipSelection[]
  currentTime: number
  videoDuration: number
  onAddClip: (clip: ClipSelection) => void
  onRemoveClip: (id: string) => void
  onUpdateClip: (id: string, updates: Partial<ClipSelection>) => void
  onSeekTo: (time: number) => void
  className?: string
}

export function ClipSelector({
  selections,
  currentTime,
  videoDuration,
  onAddClip,
  onRemoveClip,
  onUpdateClip,
  onSeekTo,
  className,
}: ClipSelectorProps) {
  const [markStart, setMarkStart] = useState<number | null>(null)

  const handleMarkStart = () => {
    setMarkStart(currentTime)
  }

  const handleMarkEnd = () => {
    if (markStart === null) return
    if (currentTime <= markStart) {
      return
    }
    if (selections.length >= MAX_CLIPS_PER_VIDEO) {
      return
    }

    const newClip: ClipSelection = {
      id: `clip-${Date.now()}`,
      start_time: markStart,
      end_time: currentTime,
      title: `Clip ${selections.length + 1}`,
    }

    onAddClip(newClip)
    setMarkStart(null)
  }

  const cancelMark = () => {
    setMarkStart(null)
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Mark controls */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          {markStart === null ? (
            <Button
              onClick={handleMarkStart}
              className="flex-1"
              disabled={selections.length >= MAX_CLIPS_PER_VIDEO}
            >
              <Flag className="w-4 h-4 mr-2" />
              Mark Start ({formatDuration(currentTime)})
            </Button>
          ) : (
            <>
              <Button
                onClick={handleMarkEnd}
                className="flex-1"
                disabled={currentTime <= markStart}
              >
                <FlagOff className="w-4 h-4 mr-2" />
                Mark End ({formatDuration(currentTime)})
              </Button>
              <Button variant="outline" onClick={cancelMark}>
                Cancel
              </Button>
            </>
          )}
        </div>
        {markStart !== null && (
          <p className="text-xs text-muted-foreground mt-2">
            Started at {formatDuration(markStart)} • Seek to end point and click &quot;Mark End&quot;
          </p>
        )}
        {selections.length >= MAX_CLIPS_PER_VIDEO && (
          <p className="text-xs text-destructive mt-2">
            Maximum {MAX_CLIPS_PER_VIDEO} clips reached
          </p>
        )}
      </div>

      {/* Clip list */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-3">
            {selections.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm mb-1">No clips selected</p>
                <p className="text-xs">
                  Use the video player to find moments, then mark start and end points.
                </p>
              </div>
            ) : (
              selections.map((clip) => (
                <Card
                  key={clip.id}
                  className="bg-secondary/50 border-border/50 hover:border-primary/30 transition-colors"
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 h-8 w-8"
                        onClick={() => onSeekTo(clip.start_time)}
                      >
                        <Play className="w-4 h-4" />
                      </Button>

                      <div className="flex-1 min-w-0">
                        <Input
                          value={clip.title}
                          onChange={(e) =>
                            onUpdateClip(clip.id, { title: e.target.value })
                          }
                          placeholder="Clip title"
                          className="mb-2 h-8 text-sm bg-background"
                        />
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-mono bg-background/50 px-1.5 py-0.5 rounded">
                            {formatDuration(clip.start_time)}
                          </span>
                          <span>→</span>
                          <span className="font-mono bg-background/50 px-1.5 py-0.5 rounded">
                            {formatDuration(clip.end_time)}
                          </span>
                          <span className="text-primary">
                            ({formatDuration(clip.end_time - clip.start_time)})
                          </span>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => onRemoveClip(clip.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Summary */}
      {selections.length > 0 && (
        <div className="p-4 border-t border-border/50 bg-secondary/30">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {selections.length} clip{selections.length !== 1 ? 's' : ''} selected
            </span>
            <span className="text-muted-foreground">
              Total:{' '}
              {formatDuration(
                selections.reduce((acc, c) => acc + (c.end_time - c.start_time), 0)
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import { useRef, useEffect } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn, formatDuration } from '@/lib/utils'
import type { TranscriptSegment } from '@/lib/types'

interface TranscriptViewerProps {
  segments: TranscriptSegment[]
  currentTime: number
  onSegmentClick: (time: number) => void
  className?: string
}

export function TranscriptViewer({
  segments,
  currentTime,
  onSegmentClick,
  className,
}: TranscriptViewerProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef<HTMLDivElement>(null)

  // Find the current active segment
  const activeIndex = segments.findIndex(
    (seg) => currentTime >= seg.start && currentTime < seg.end
  )

  // Auto-scroll to active segment
  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      activeRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }, [activeIndex])

  if (segments.length === 0) {
    return (
      <div className={cn('flex items-center justify-center text-muted-foreground', className)}>
        No transcript available
      </div>
    )
  }

  return (
    <ScrollArea className={cn('h-full', className)}>
      <div ref={scrollRef} className="p-4 space-y-2">
        {segments.map((segment, index) => {
          const isActive = index === activeIndex
          return (
            <div
              key={index}
              ref={isActive ? activeRef : null}
              onClick={() => onSegmentClick(segment.start)}
              className={cn(
                'p-3 rounded-lg cursor-pointer transition-all',
                'hover:bg-neon-cyan/10 hover:border-neon-cyan/30',
                'border border-transparent',
                isActive && 'bg-neon-cyan/20 border-neon-cyan/50'
              )}
            >
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    'text-xs font-mono px-2 py-1 rounded shrink-0',
                    isActive
                      ? 'bg-neon-cyan text-background'
                      : 'bg-secondary text-muted-foreground'
                  )}
                >
                  {formatDuration(segment.start)}
                </span>
                <p
                  className={cn(
                    'text-sm leading-relaxed',
                    isActive ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {segment.text}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </ScrollArea>
  )
}


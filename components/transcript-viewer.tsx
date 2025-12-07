'use client'

import { useEffect, useRef } from 'react'
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
  const activeRef = useRef<HTMLButtonElement>(null)

  // Find the current active segment
  const activeIndex = segments.findIndex(
    (seg) => currentTime >= seg.start && currentTime < seg.end
  )

  // Auto-scroll to active segment
  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }, [activeIndex])

  if (segments.length === 0) {
    return (
      <div className={cn('flex items-center justify-center p-6', className)}>
        <p className="text-muted-foreground text-sm">No transcript available</p>
      </div>
    )
  }

  return (
    <ScrollArea className={cn('h-full', className)}>
      <div className="p-4 space-y-1">
        {segments.map((segment, index) => {
          const isActive = index === activeIndex
          const isPast = currentTime > segment.end

          return (
            <button
              key={index}
              ref={isActive ? activeRef : null}
              onClick={() => onSegmentClick(segment.start)}
              className={cn(
                'w-full text-left px-3 py-2 rounded-lg transition-colors text-sm',
                'hover:bg-secondary/70',
                isActive && 'bg-primary/10 text-foreground',
                isPast && !isActive && 'text-muted-foreground',
                !isPast && !isActive && 'text-foreground'
              )}
            >
              <div className="flex items-start gap-3">
                <span className={cn(
                  'font-mono text-xs shrink-0 pt-0.5',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}>
                  {formatDuration(segment.start)}
                </span>
                <span className="flex-1">{segment.text}</span>
              </div>
            </button>
          )
        })}
      </div>
    </ScrollArea>
  )
}

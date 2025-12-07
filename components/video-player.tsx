'use client'

import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import { cn } from '@/lib/utils'

interface VideoPlayerProps {
  src: string
  className?: string
  onTimeUpdate?: (currentTime: number) => void
}

export interface VideoPlayerRef {
  seekTo: (time: number) => void
  getCurrentTime: () => number
  play: () => void
  pause: () => void
}

export const VideoPlayer = forwardRef<VideoPlayerRef, VideoPlayerProps>(
  ({ src, className, onTimeUpdate }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null)

    useImperativeHandle(ref, () => ({
      seekTo: (time: number) => {
        if (videoRef.current) {
          videoRef.current.currentTime = time
        }
      },
      getCurrentTime: () => {
        return videoRef.current?.currentTime || 0
      },
      play: () => {
        videoRef.current?.play()
      },
      pause: () => {
        videoRef.current?.pause()
      },
    }))

    useEffect(() => {
      const video = videoRef.current
      if (!video || !onTimeUpdate) return

      const handleTimeUpdate = () => {
        onTimeUpdate(video.currentTime)
      }

      video.addEventListener('timeupdate', handleTimeUpdate)
      return () => {
        video.removeEventListener('timeupdate', handleTimeUpdate)
      }
    }, [onTimeUpdate])

    return (
      <div className={cn('relative rounded-lg overflow-hidden bg-black', className)}>
        <video
          ref={videoRef}
          src={src}
          controls
          className="w-full h-full object-contain"
          playsInline
        />
      </div>
    )
  }
)

VideoPlayer.displayName = 'VideoPlayer'


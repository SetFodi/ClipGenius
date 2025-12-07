import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Toaster } from '@/components/ui/toaster'
import { Analytics } from '@vercel/analytics/react'
import './globals.css'

export const metadata: Metadata = {
  title: 'ClipGenius - Turn Long Videos into Viral Clips',
  description: 'AI-powered video clipping for creators. Upload gaming streams, vlogs, podcasts, or tutorials and get viral-ready shorts in minutes.',
  keywords: ['video clips', 'shorts', 'TikTok', 'YouTube Shorts', 'Reels', 'video editing', 'AI', 'transcription', 'captions'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}>
        <div className="min-h-screen grid-pattern">
          {children}
        </div>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}

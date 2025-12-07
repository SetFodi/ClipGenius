import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'

export const metadata: Metadata = {
  title: 'ClipGenius - AI Gaming Shorts Generator',
  description: 'Turn your gaming streams into viral clips in minutes. Upload, transcribe, clip, and export ready-to-post vertical videos.',
  keywords: ['gaming', 'shorts', 'clips', 'TikTok', 'YouTube Shorts', 'Twitch', 'video editing', 'AI'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}>
        <div className="min-h-screen bg-gradient-gaming gaming-grid noise-overlay">
          <div className="relative z-10">
            {children}
          </div>
        </div>
        <Toaster />
      </body>
    </html>
  )
}


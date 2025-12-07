import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  Upload, 
  Sparkles, 
  Scissors, 
  Download,
  Zap,
  Clock,
  DollarSign,
  Gamepad2
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-neon-cyan/20 border border-neon-cyan/50 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-neon-cyan" />
            </div>
            <span className="font-bold text-xl">
              Clip<span className="text-neon-cyan">Genius</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link href="/signup">
              <Button variant="neon">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-neon-cyan/30 bg-neon-cyan/10 mb-8">
            <Gamepad2 className="w-4 h-4 text-neon-cyan" />
            <span className="text-sm text-neon-cyan">Built for Gaming Creators</span>
          </div>
          
          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Turn Your Gaming Streams Into{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan via-neon-pink to-neon-purple glow-text">
              Viral Clips
            </span>
          </h1>
          
          {/* Subheadline */}
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Upload your Twitch VODs, YouTube videos, or gaming highlights. 
            Get AI-transcribed clips with captions, ready for TikTok, Reels, and Shorts — in minutes, not hours.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button variant="neon" size="xl" className="group">
                <Sparkles className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                Start Creating Free
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button variant="outline" size="xl">
                See How It Works
              </Button>
            </Link>
          </div>
          
          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-xl mx-auto">
            <div>
              <div className="text-3xl font-bold text-neon-cyan">3-10</div>
              <div className="text-sm text-muted-foreground">Clips per video</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-neon-pink">~5 min</div>
              <div className="text-sm text-muted-foreground">Processing time</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-neon-green">Free</div>
              <div className="text-sm text-muted-foreground">To get started</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 border-t border-border/40">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              From VOD to Viral in 4 Simple Steps
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              No editing skills required. Our AI handles the heavy lifting so you can focus on creating content.
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                icon: Upload,
                title: 'Upload',
                description: 'Drop your gaming video (up to 250MB, 20 min max)',
                color: 'cyan',
              },
              {
                icon: Sparkles,
                title: 'Transcribe',
                description: 'AI transcribes every word with precise timestamps',
                color: 'pink',
              },
              {
                icon: Scissors,
                title: 'Select',
                description: 'Pick your best moments from the transcript',
                color: 'purple',
              },
              {
                icon: Download,
                title: 'Export',
                description: 'Get vertical clips with burned-in captions',
                color: 'green',
              },
            ].map((step, i) => (
              <div key={i} className="relative group">
                {/* Connector line */}
                {i < 3 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px bg-gradient-to-r from-border to-transparent" />
                )}
                
                <div className="relative z-10 flex flex-col items-center text-center">
                  {/* Step number */}
                  <div className="absolute -top-3 -left-3 w-6 h-6 rounded-full bg-background border border-border flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </div>
                  
                  {/* Icon */}
                  <div className={`w-24 h-24 rounded-2xl bg-neon-${step.color}/10 border border-neon-${step.color}/30 flex items-center justify-center mb-4 group-hover:shadow-neon-${step.color} transition-shadow`}
                       style={{ 
                         backgroundColor: step.color === 'cyan' ? 'rgba(0, 240, 255, 0.1)' : 
                                          step.color === 'pink' ? 'rgba(255, 0, 229, 0.1)' : 
                                          step.color === 'purple' ? 'rgba(176, 38, 255, 0.1)' : 
                                          'rgba(0, 255, 157, 0.1)',
                         borderColor: step.color === 'cyan' ? 'rgba(0, 240, 255, 0.3)' : 
                                      step.color === 'pink' ? 'rgba(255, 0, 229, 0.3)' : 
                                      step.color === 'purple' ? 'rgba(176, 38, 255, 0.3)' : 
                                      'rgba(0, 255, 157, 0.3)',
                       }}>
                    <step.icon className="w-10 h-10" style={{
                      color: step.color === 'cyan' ? '#00f0ff' : 
                             step.color === 'pink' ? '#ff00e5' : 
                             step.color === 'purple' ? '#b026ff' : 
                             '#00ff9d'
                    }} />
                  </div>
                  
                  <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why ClipGenius */}
      <section className="py-20 px-4 border-t border-border/40">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Gamers Choose ClipGenius
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: 'Lightning Fast',
                description: 'Get your clips in minutes, not hours. Our optimized pipeline handles transcription and video processing in parallel.',
              },
              {
                icon: Clock,
                title: 'Save Hours Weekly',
                description: "Stop spending 4+ hours editing. Select your moments, we'll handle the cropping, captions, and formatting.",
              },
              {
                icon: DollarSign,
                title: 'Free to Start',
                description: 'Process 3 videos per day on our free tier. No credit card required. Upgrade only when you need more.',
              },
            ].map((feature, i) => (
              <div key={i} className="p-6 rounded-xl border border-border/40 bg-card/50 hover:border-neon-cyan/30 transition-colors group">
                <div className="w-12 h-12 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center mb-4 group-hover:shadow-neon-cyan transition-shadow">
                  <feature.icon className="w-6 h-6 text-neon-cyan" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 border-t border-border/40">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Go Viral?
          </h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of gaming creators who are growing their audience with ClipGenius.
          </p>
          <Link href="/signup">
            <Button variant="neon" size="xl" className="animate-glow">
              <Sparkles className="w-5 h-5 mr-2" />
              Create Your First Clip
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border/40">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-neon-cyan/20 border border-neon-cyan/50 flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-neon-cyan" />
            </div>
            <span className="font-semibold">ClipGenius</span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} ClipGenius. Built for gaming creators.
          </p>
        </div>
      </footer>
    </div>
  )
}


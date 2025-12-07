import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  Upload, 
  Sparkles, 
  Scissors, 
  Download,
  Zap,
  Clock,
  Play,
  ArrowRight,
  Check,
  Star,
  Users,
  TrendingUp,
  Gamepad2,
  Mic,
  GraduationCap,
  Camera
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-400 flex items-center justify-center">
              <span className="text-white font-black text-sm">C</span>
            </div>
            <span className="font-semibold text-lg tracking-tight">
              clip<span className="text-primary">genius</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              How it works
            </Link>
            <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 gradient-bg">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-in">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-medium text-primary">AI-Powered Video Clipping</span>
          </div>
          
          {/* Headline */}
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-[1.1] tracking-tight animate-fade-in-delay-1">
            Turn long videos into
            <br />
            <span className="gradient-text">viral short clips</span>
          </h1>
          
          {/* Subheadline */}
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-delay-2">
            Upload your content — gaming streams, vlogs, podcasts, tutorials — and let AI 
            transcribe, select highlights, and export vertical clips with captions. Ready for 
            TikTok, Reels, and Shorts in minutes.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-delay-3">
            <Link href="/signup">
              <Button size="xl" className="group">
                Start creating free
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button variant="outline" size="xl">
                <Play className="w-4 h-4 mr-2" />
                See how it works
              </Button>
            </Link>
          </div>
          
          {/* Social proof */}
          <div className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>1,000+ creators</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span>50K+ clips created</span>
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-primary text-primary" />
              ))}
              <span className="ml-1">4.9/5</span>
            </div>
          </div>
        </div>
      </section>

      {/* Logos / Trust */}
      <section className="py-12 px-6 border-y border-border/50">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-sm text-muted-foreground mb-6">Trusted by creators on</p>
          <div className="flex items-center justify-center gap-12 opacity-50">
            <span className="text-xl font-semibold">YouTube</span>
            <span className="text-xl font-semibold">TikTok</span>
            <span className="text-xl font-semibold">Twitch</span>
            <span className="text-xl font-semibold">Instagram</span>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              From long-form to viral in 4 steps
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              No editing skills required. Upload your video and let AI handle the rest.
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                icon: Upload,
                title: 'Upload',
                description: 'Drop your video file (up to 250MB, 20 min)',
              },
              {
                step: '02',
                icon: Sparkles,
                title: 'Transcribe',
                description: 'AI transcribes with word-level timestamps',
              },
              {
                step: '03',
                icon: Scissors,
                title: 'Select',
                description: 'Pick your best moments from the timeline',
              },
              {
                step: '04',
                icon: Download,
                title: 'Export',
                description: 'Get 9:16 clips with synced captions',
              },
            ].map((item, i) => (
              <div key={i} className="relative group">
                <div className="p-6 rounded-2xl bg-card border border-border/50 card-hover h-full">
                  <div className="text-xs font-mono text-muted-foreground mb-4">{item.step}</div>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                {i < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-px bg-border" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 bg-card/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to go viral
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Built for creators who want to grow on short-form platforms without spending hours editing.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Zap,
                title: 'Lightning fast',
                description: 'Process videos in minutes, not hours. Our optimized pipeline handles transcription and rendering in parallel.',
              },
              {
                icon: Clock,
                title: 'Save hours weekly',
                description: 'Stop spending 4+ hours editing each video. Select moments, we handle cropping, captions, and formatting.',
              },
              {
                icon: Sparkles,
                title: 'AI-powered captions',
                description: 'Automatic word-level transcription with stylish, animated captions that boost engagement and retention.',
              },
            ].map((feature, i) => (
              <div key={i} className="p-6 rounded-2xl bg-background border border-border/50 card-hover">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Built for every creator
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Whether you're a gamer, vlogger, educator, or podcaster — clipgenius adapts to your content.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Gamepad2, label: 'Gaming', desc: 'Epic moments & highlights', gradient: 'from-violet-500/20 to-purple-500/20' },
              { icon: Mic, label: 'Podcasts', desc: 'Quotable clips & hot takes', gradient: 'from-blue-500/20 to-cyan-500/20' },
              { icon: GraduationCap, label: 'Education', desc: 'Key concepts & tips', gradient: 'from-emerald-500/20 to-green-500/20' },
              { icon: Camera, label: 'Vlogs', desc: 'Best moments & stories', gradient: 'from-orange-500/20 to-amber-500/20' },
            ].map((item, i) => (
              <div key={i} className={`p-5 rounded-xl bg-gradient-to-br ${item.gradient} border border-border/50 card-hover`}>
                <div className="w-10 h-10 rounded-lg bg-background/50 flex items-center justify-center mb-3">
                  <item.icon className="w-5 h-5 text-foreground" />
                </div>
                <div className="font-medium mb-1">{item.label}</div>
                <div className="text-xs text-muted-foreground">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section className="py-24 px-6 bg-card/50">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Start creating for free
          </h2>
          <p className="text-muted-foreground mb-8">
            No credit card required. Upload your first video and see the magic.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="xl" className="group">
                Get started free
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" size="xl">
                View pricing
              </Button>
            </Link>
          </div>
          <div className="mt-6 flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-primary" />
              <span>5 free uploads</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-primary" />
              <span>3 free clips</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-primary" />
              <span>No watermark</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border/50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-primary to-purple-400 flex items-center justify-center">
              <span className="text-white font-black text-xs">C</span>
            </div>
            <span className="font-semibold">clipgenius</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} clipgenius
          </p>
        </div>
      </footer>
    </div>
  )
}

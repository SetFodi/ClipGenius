import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { PayPalUpgradeButton } from '@/components/billing/paypal-upgrade-button'
import { resolvePlan } from '@/lib/plan'

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Best way to try clipgenius with no commitment',
    features: [
      'Up to 5 video uploads',
      'Up to 3 generated clips',
      'AI transcription (Groq Whisper)',
      'Automatic word-level captions',
      'Vertical 1080p exports',
      'Standard processing speed',
    ],
    cta: 'Get started',
    href: '/signup',
    popular: false,
    planId: 'free' as const,
  },
  {
    name: 'Creator',
    price: '$4.99',
    period: '/month',
    description: 'For solo creators posting consistently',
    features: [
      'Everything in Free',
      'Up to 100 video uploads',
      'Up to 300 generated clips',
    ],
    cta: 'Start free trial',
    href: '/signup?plan=creator',
    popular: true,
    planId: 'creator' as const,
  },
  {
    name: 'Pro',
    price: '$8.99',
    period: '/month',
    description: 'For heavy users and small teams',
    features: [
      'Everything in Creator',
      'Up to 500 video uploads',
      'Up to 1,500 generated clips',
    ],
    cta: 'Contact sales',
    href: '/signup?plan=pro',
    popular: false,
    planId: 'pro' as const,
  },
] as const

export default async function PricingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let currentPlan: 'free' | 'creator' | 'pro' = 'free'

  if (user) {
    try {
      const { data: usage } = await supabase
        .from('user_usage')
        .select('plan')
        .eq('user_id', user.id)
        .maybeSingle()

      if (usage && typeof (usage as any).plan === 'string') {
        currentPlan = resolvePlan((usage as any).plan)
      }
    } catch {
      // ignore, default to free
    }
  }

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
            <Link href="/#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="/#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              How it works
            </Link>
            <Link href="/pricing" className="text-sm text-foreground font-medium">
              Pricing
            </Link>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Log in</Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="pt-32 pb-16 px-6 gradient-bg">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-muted-foreground">
            Start free, upgrade when you need more. No hidden fees.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-24 px-6 -mt-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan, i) => (
              <div
                key={i}
                className={`relative p-6 rounded-2xl border ${
                  plan.popular
                    ? 'bg-card border-primary/50 shadow-lg shadow-primary/10'
                    : 'bg-card border-border/50'
                }`}
              >
                {user && plan.planId === currentPlan && (
                  <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium">
                    Current plan
                  </div>
                )}
                
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                    Most popular
                  </div>
                )}
                
                <div className="mb-6">
                  <h3 className="font-semibold text-lg mb-1">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>
                
                <div className="mb-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>

                <Link href={user ? '/dashboard' : plan.href}>
                  <Button
                    className="w-full mb-3"
                    variant={plan.popular ? 'default' : 'outline'}
                    disabled={user != null && plan.planId === currentPlan}
                  >
                    {user && plan.planId === currentPlan ? (
                      'Current plan'
                    ) : (
                      <>
                        {plan.cta}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </Link>

                {user &&
                  plan.planId !== currentPlan &&
                  (plan.planId === 'creator' || plan.planId === 'pro') && (
                  <PayPalUpgradeButton plan={plan.planId} />
                )}
                
                <ul className="space-y-3">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-6 bg-card/50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-12 text-center">Frequently asked questions</h2>
          
          <div className="space-y-6">
            {[
              {
                q: 'What happens when I hit my free limit?',
                a: "You'll still have access to your existing clips. To create more, you can upgrade to Creator or Pro.",
              },
              {
                q: 'Can I cancel my subscription anytime?',
                a: 'Yes, you can cancel at any time. Your subscription will remain active until the end of your billing period.',
              },
              {
                q: 'What video formats do you support?',
                a: 'We support MP4, WebM, and MOV files up to 250MB and 20 minutes in length.',
              },
              {
                q: 'How long does processing take?',
                a: 'Most videos are transcribed and ready for clipping within 2-5 minutes. Clip generation takes about 30 seconds per clip.',
              },
              {
                q: 'Do you add watermarks?',
                a: 'No watermarks on any plan, including free. Your clips are 100% yours.',
              },
            ].map((faq, i) => (
              <div key={i} className="p-6 rounded-xl bg-background border border-border/50">
                <h3 className="font-medium mb-2">{faq.q}</h3>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to start creating?</h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of creators making viral content with ClipGenius.
          </p>
          <Link href="/signup">
            <Button size="xl" className="group">
              Get started free
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
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
            © {new Date().getFullYear()} ClipGenius
          </p>
        </div>
      </footer>
    </div>
  )
}


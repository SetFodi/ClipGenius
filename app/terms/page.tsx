import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-400 flex items-center justify-center">
              <span className="text-white font-black text-sm">C</span>
            </div>
            <span className="font-semibold text-lg tracking-tight">
              clip<span className="text-primary">genius</span>
            </span>
          </Link>
          <Link href="/signup">
            <Button variant="outline" size="sm">Get started</Button>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
          <p>
            These Terms of Service (&quot;Terms&quot;) govern your access to and use of the
            ClipGenius web application (&quot;Service&quot;). By creating an account or using the
            Service you agree to be bound by these Terms.
          </p>

          <section>
            <h2 className="font-semibold text-foreground mb-2">1. Use of the service</h2>
            <p>
              You may use ClipGenius to upload videos you own or are authorized to use, generate
              clips, and download results for your own distribution on platforms such as
              YouTube, TikTok, and Instagram. You are responsible for compliance with all
              applicable laws, platform rules, and third‑party rights.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-foreground mb-2">2. Accounts</h2>
            <p>
              You must provide accurate information when creating an account and keep your
              credentials secure. You are responsible for all activity that occurs under your
              account.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-foreground mb-2">3. Acceptable use</h2>
            <p>
              You agree not to use the Service to upload or generate content that is illegal,
              hateful, harassing, infringing, or otherwise abusive. We may suspend or terminate
              access if we reasonably believe your use violates these Terms or risks harm to
              the Service or others.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-foreground mb-2">4. Intellectual property</h2>
            <p>
              You retain ownership of the original videos and clips you create with ClipGenius.
              By uploading content, you grant us a limited license to process, store, and
              transmit that content solely for the purpose of providing the Service.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-foreground mb-2">5. AI and third‑party services</h2>
            <p>
              ClipGenius uses third‑party providers such as Supabase, Railway, and AI APIs (for
              example, Groq Whisper) to deliver the Service. Your data may be processed by these
              providers subject to their own terms and privacy policies.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-foreground mb-2">6. Plans, limits, and billing</h2>
            <p>
              Free and paid plans may include usage limits such as maximum uploads or generated
              clips. We may change plan pricing or limits in the future, but will not retroactively
              charge you for past usage. Paid subscriptions and payments are handled by external
              processors (such as PayPal) and are subject to their terms.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-foreground mb-2">7. Disclaimer of warranties</h2>
            <p>
              The Service is provided &quot;as is&quot; without warranties of any kind, whether express
              or implied. We do not guarantee that generated clips will be error‑free, uninterrupted,
              or suitable for any particular purpose.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-foreground mb-2">8. Limitation of liability</h2>
            <p>
              To the maximum extent permitted by law, ClipGenius will not be liable for any
              indirect, incidental, special, consequential, or punitive damages, or any loss of
              profits or revenues arising from your use of the Service.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-foreground mb-2">9. Changes to these terms</h2>
            <p>
              We may update these Terms from time to time. When we do, we will update the
              &quot;Last updated&quot; date above. Continued use of the Service after changes become
              effective constitutes your acceptance of the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-foreground mb-2">10. Contact</h2>
            <p>
              If you have questions about these Terms, you can contact us via the email or
              support link provided in the app.
            </p>
          </section>

          <p className="text-xs text-muted-foreground mt-8">
            This document is provided for informational purposes only and does not constitute
            legal advice. Consider consulting a lawyer to review and customize these terms for
            your specific situation.
          </p>
        </div>
      </main>
    </div>
  )
}



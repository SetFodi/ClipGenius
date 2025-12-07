import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function PrivacyPage() {
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
        <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
          <p>
            This Privacy Policy explains how ClipGenius (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) collects, uses,
            and protects information when you use the ClipGenius web application (&quot;Service&quot;).
          </p>

          <section>
            <h2 className="font-semibold text-foreground mb-2">1. Information we collect</h2>
            <p>
              We collect information that you provide directly to us, such as your email address
              when you create an account, and the videos you upload in order to generate clips.
              We also collect basic usage data (for example, pages visited and actions taken)
              to help improve the Service.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-foreground mb-2">2. How we use your information</h2>
            <p>
              We use your information to operate and improve ClipGenius, including:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Authenticating your account</li>
              <li>Processing and storing uploaded videos and generated clips</li>
              <li>Providing customer support and communicating important updates</li>
              <li>Monitoring usage to prevent abuse and ensure reliable operation</li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-foreground mb-2">3. Storage and third‑party services</h2>
            <p>
              We use Supabase to store account data, database records, and uploaded files, and
              Railway or similar infrastructure to run background processing workers. We use AI
              APIs (for example, Groq Whisper) to generate transcriptions. These providers may
              process your data on our behalf in accordance with their own terms and policies.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-foreground mb-2">4. Payments</h2>
            <p>
              Payments for paid plans may be handled by third‑party payment processors such as
              PayPal. We do not store your full payment card details on our servers. Payment data
              is processed directly by the payment provider and is subject to their privacy policy.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-foreground mb-2">5. Analytics and logs</h2>
            <p>
              We may use privacy‑friendly analytics tools (for example, Vercel Analytics) to
              understand how the Service is used and to improve performance and reliability.
              Server logs may include IP addresses, browser information, and error messages for
              debugging and security monitoring.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-foreground mb-2">6. Data retention</h2>
            <p>
              We retain your account information and generated clips for as long as your account
              is active, or as needed to provide the Service. You can request deletion of your
              account and associated data by contacting us through the support channel provided
              in the app.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-foreground mb-2">7. Your choices</h2>
            <p>
              You may access and update your account information at any time by logging in to
              ClipGenius. You can stop using the Service at any time and request deletion of your
              data. If you opt out of analytics cookies or tracking (where applicable), some
              insights we collect may be limited.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-foreground mb-2">8. Changes to this policy</h2>
            <p>
              We may update this Privacy Policy from time to time. When we do, we will update the
              &quot;Last updated&quot; date above. Continued use of the Service after changes become
              effective constitutes your acceptance of the revised policy.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-foreground mb-2">9. Contact</h2>
            <p>
              If you have questions about this Privacy Policy or how your data is handled, you
              can contact us via the email or support link provided in the app.
            </p>
          </section>

          <p className="text-xs text-muted-foreground mt-8">
            This Privacy Policy is a general template and does not constitute legal advice.
            Consider consulting a lawyer to review and customize this policy for your specific
            business and jurisdiction.
          </p>
        </div>
      </main>
    </div>
  )
}



'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { Sparkles, Loader2, Mail } from 'lucide-react'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isMagicLink, setIsMagicLink] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const redirect = searchParams.get('redirect') || '/dashboard'

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const supabase = createClient()

    if (isMagicLink) {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${redirect}`,
        },
      })

      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Check your email',
          description: 'We sent you a magic link to sign in.',
          variant: 'success',
        })
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        })
      } else {
        router.push(redirect)
        router.refresh()
      }
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-lg bg-neon-cyan/20 border border-neon-cyan/50 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-neon-cyan" />
          </div>
          <span className="font-bold text-2xl">
            Clip<span className="text-neon-cyan">Genius</span>
          </span>
        </Link>

        <Card className="border-border/40 bg-card/50 backdrop-blur">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>
              Sign in to continue creating viral clips
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              {!isMagicLink && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                variant="neon"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isMagicLink ? 'Sending link...' : 'Signing in...'}
                  </>
                ) : isMagicLink ? (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Send Magic Link
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className="mt-4">
              <Button
                type="button"
                variant="ghost"
                className="w-full text-muted-foreground"
                onClick={() => setIsMagicLink(!isMagicLink)}
              >
                {isMagicLink ? 'Use password instead' : 'Sign in with magic link'}
              </Button>
            </div>
          </CardContent>
          <CardFooter className="justify-center">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-neon-cyan hover:underline">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-neon-cyan" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SignUpForm } from './SignUpForm'

export default async function SignUpPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) redirect('/dashboard')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Create account</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Start tracking your muscle recovery today
        </p>
      </div>
      <SignUpForm />
      <p className="text-sm text-center text-muted-foreground">
        Already have an account?{' '}
        <a href="/login" className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors">
          Sign in
        </a>
      </p>
    </div>
  )
}

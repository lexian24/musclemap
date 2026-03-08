import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LoginForm } from './LoginForm'

export default async function LoginPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) redirect('/dashboard')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">MuscleMap</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Sign in to track your recovery
        </p>
      </div>
      <LoginForm />
      <p className="text-sm text-center text-muted-foreground">
        No account?{' '}
        <a href="/signup" className="underline underline-offset-4">
          Sign up
        </a>
      </p>
    </div>
  )
}

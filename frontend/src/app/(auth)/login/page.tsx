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
      <LoginForm />
      <p className="text-sm text-center text-muted-foreground">
        No account?{' '}
        <a href="/signup" className="text-red-400 font-medium hover:text-red-300 transition-colors">
          Sign up free
        </a>
      </p>
    </div>
  )
}

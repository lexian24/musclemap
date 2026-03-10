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
      <SignUpForm />
      <p className="text-sm text-center text-muted-foreground">
        Already have an account?{' '}
        <a href="/login" className="text-red-400 font-medium hover:text-red-300 transition-colors">
          Sign in
        </a>
      </p>
    </div>
  )
}

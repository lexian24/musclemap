import type { User } from '@supabase/supabase-js'
import { LogoutButton } from './LogoutButton'

type NavbarProps = {
  user: User
}

export function Navbar({ user }: NavbarProps) {
  return (
    <header className="border-b border-border bg-background px-6 py-3 flex items-center justify-between">
      <span className="font-bold text-lg">MuscleMap</span>
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">{user.email}</span>
        <LogoutButton />
      </div>
    </header>
  )
}

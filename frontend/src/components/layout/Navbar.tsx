import type { User } from '@supabase/supabase-js'
import { LogoutButton } from './LogoutButton'

type NavbarProps = {
  user: User
}

export function Navbar({ user }: NavbarProps) {
  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-sm px-6 py-0 flex items-center justify-between h-14 sticky top-0 z-50">
      {/* Wordmark */}
      <div className="flex items-center gap-2">
        <span className="flex items-center justify-center w-7 h-7 rounded-md bg-primary text-primary-foreground font-bold text-sm select-none">
          M
        </span>
        <span className="font-semibold text-base tracking-tight text-foreground">
          Muscle<span className="text-primary">Map</span>
        </span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2">
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-secondary text-xs font-medium text-muted-foreground uppercase select-none">
            {user.email?.[0] ?? '?'}
          </span>
          <span className="text-sm text-muted-foreground max-w-[180px] truncate">
            {user.email}
          </span>
        </div>
        <div className="h-4 w-px bg-border hidden sm:block" />
        <LogoutButton />
      </div>
    </header>
  )
}

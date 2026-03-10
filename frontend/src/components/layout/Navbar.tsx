import type { User } from '@supabase/supabase-js'
import { LogoutButton } from './LogoutButton'

type NavbarProps = {
  user: User
}

export function Navbar({ user }: NavbarProps) {
  return (
    <header className="border-b border-white/[0.06] bg-card/60 backdrop-blur-xl px-5 py-0 flex items-center justify-between h-14 sticky top-0 z-50">
      {/* Wordmark */}
      <div className="flex items-center gap-2.5">
        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-red-700 text-white font-display font-bold text-sm select-none shadow-lg shadow-red-500/20">
          M
        </span>
        <span className="font-display font-semibold text-lg tracking-tight text-foreground">
          Muscle<span className="text-red-500">Map</span>
        </span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2.5">
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-white/[0.06] text-xs font-medium text-muted-foreground uppercase select-none ring-1 ring-white/[0.06]">
            {user.email?.[0] ?? '?'}
          </span>
          <span className="text-sm text-muted-foreground max-w-[180px] truncate">
            {user.email}
          </span>
        </div>
        <div className="h-4 w-px bg-white/[0.06] hidden sm:block" />
        <LogoutButton />
      </div>
    </header>
  )
}

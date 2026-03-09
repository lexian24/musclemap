'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Route } from 'next'

type NavItem = {
  href: Route
  label: string
  icon: React.ReactNode
}

function LayoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function ChatIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: <LayoutIcon /> },
  { href: '/dashboard/history', label: 'History', icon: <ClockIcon /> },
  { href: '/dashboard/feedback', label: 'Feedback', icon: <ChatIcon /> },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <nav className="w-52 border-r border-border bg-card/50 p-3 space-y-0.5 hidden md:flex flex-col flex-shrink-0">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-3 pt-2 pb-1">
        Navigation
      </p>
      {navItems.map(({ href, label, icon }) => {
        const isActive = pathname === href
        return (
          <Link
            key={href}
            href={href}
            className={[
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary/15 text-primary'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
            ].join(' ')}
          >
            <span className={isActive ? 'text-primary' : 'text-muted-foreground/70'}>
              {icon}
            </span>
            {label}
          </Link>
        )
      })}
    </nav>
  )
}

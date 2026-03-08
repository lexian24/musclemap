import Link from 'next/link'
import type { Route } from 'next'

const navItems: Array<{ href: Route; label: string }> = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/dashboard/history', label: 'History' },
]

export function Sidebar() {
  return (
    <nav className="w-48 border-r border-border bg-background p-4 space-y-1 hidden md:block">
      {navItems.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          {label}
        </Link>
      ))}
    </nav>
  )
}

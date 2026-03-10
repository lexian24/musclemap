import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getWorkoutHistory } from '@/lib/db/sessions'

function formatDayLabel(dateStr: string): string {
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  const yesterday = new Date(today)
  yesterday.setUTCDate(today.getUTCDate() - 1)

  const date = new Date(dateStr + 'T00:00:00Z')
  if (date.getTime() === today.getTime()) return 'Today'
  if (date.getTime() === yesterday.getTime()) return 'Yesterday'

  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  })
}

function formatTime(isoTimestamp: string): string {
  return new Date(isoTimestamp).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  })
}

export default async function HistoryPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const history = await getWorkoutHistory(user.id)

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground tracking-tight">Workout History</h1>
        <p className="text-sm text-muted-foreground mt-1">Your last 30 days of training</p>
      </div>

      {history.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/40" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <p className="text-muted-foreground text-sm font-medium">No workout history yet</p>
          <p className="text-muted-foreground/50 text-xs mt-1">
            Log your first set on the dashboard to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map(({ date, sets }) => (
            <div
              key={date}
              className="glass-card overflow-hidden"
            >
              {/* Day header */}
              <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.04]">
                <h2 className="font-display text-sm font-bold text-foreground tracking-wide">
                  {formatDayLabel(date)}
                </h2>
                <span className="ml-auto text-xs font-semibold text-red-400 bg-red-500/10 px-2.5 py-1 rounded-full">
                  {sets.length} {sets.length === 1 ? 'set' : 'sets'}
                </span>
              </div>

              {/* Sets list */}
              <ul className="divide-y divide-white/[0.03]">
                {sets.map((set) => (
                  <li
                    key={set.id}
                    className="flex items-center justify-between px-5 py-3 hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-foreground">
                        {set.exerciseName}
                      </span>
                      <span className="text-sm font-semibold text-red-400">
                        {set.sets}&times;{set.reps}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground/50 tabular-nums">
                      {formatTime(set.loggedAt)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

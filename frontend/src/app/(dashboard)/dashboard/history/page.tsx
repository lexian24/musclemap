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
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Workout History</h1>
        <p className="text-sm text-muted-foreground mt-1">Your last 30 days of training</p>
      </div>

      {history.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center shadow-lg shadow-black/20">
          <p className="text-muted-foreground text-sm">No workout history yet.</p>
          <p className="text-muted-foreground/60 text-xs mt-1">
            Log your first set on the dashboard to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map(({ date, sets }) => (
            <div
              key={date}
              className="rounded-xl border border-border bg-card shadow-lg shadow-black/20 overflow-hidden"
            >
              {/* Day header */}
              <div className="flex items-center gap-3 px-5 py-3 border-b border-border">
                <h2 className="text-sm font-semibold text-foreground">
                  {formatDayLabel(date)}
                </h2>
                <span className="ml-auto text-xs font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                  {sets.length} {sets.length === 1 ? 'set' : 'sets'}
                </span>
              </div>

              {/* Sets list */}
              <ul className="divide-y divide-border/50">
                {sets.map((set) => (
                  <li
                    key={set.id}
                    className="flex items-center justify-between px-5 py-2.5"
                  >
                    <div>
                      <span className="text-sm font-medium text-foreground">
                        {set.exerciseName}
                      </span>
                      <span className="ml-2 text-sm text-primary">
                        {set.sets}×{set.reps}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
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

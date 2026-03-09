export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen flex bg-background">
      {/* Left brand panel — hidden on small screens */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] bg-card border-r border-border p-10 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-8 h-8 rounded-md bg-primary text-primary-foreground font-bold text-sm select-none">
            M
          </span>
          <span className="font-semibold text-lg tracking-tight text-foreground">
            Muscle<span className="text-primary">Map</span>
          </span>
        </div>

        {/* Center content */}
        <div className="space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Calisthenics Tracker
            </div>
            <h2 className="text-3xl font-bold text-foreground leading-tight">
              Track your muscles,<br />
              <span className="text-primary">not just your reps.</span>
            </h2>
            <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
              Visualise muscle fatigue in real-time. Know exactly when your body is ready to train again.
            </p>
          </div>

          {/* Feature list */}
          <ul className="space-y-3">
            {[
              'Live fatigue heatmap on a body diagram',
              'Per-muscle recovery tracking over time',
              'Intelligent set & rep logging',
            ].map((feature) => (
              <li key={feature} className="flex items-start gap-3 text-sm text-muted-foreground">
                <span className="mt-0.5 flex-shrink-0 h-4 w-4 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px]">
                  ✓
                </span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-muted-foreground/60">
          &copy; {new Date().getFullYear()} MuscleMap
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <span className="flex items-center justify-center w-8 h-8 rounded-md bg-primary text-primary-foreground font-bold text-sm select-none">
              M
            </span>
            <span className="font-semibold text-lg tracking-tight text-foreground">
              Muscle<span className="text-primary">Map</span>
            </span>
          </div>
          <div className="rounded-xl border border-border bg-card/60 backdrop-blur-sm p-8 shadow-2xl shadow-black/40">
            {children}
          </div>
        </div>
      </div>
    </main>
  )
}

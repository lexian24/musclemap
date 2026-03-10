export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-dvh flex bg-background">
      {/* Left brand panel — hidden on small screens */}
      <div className="hidden lg:flex flex-col justify-between w-[440px] bg-card/50 border-r border-white/[0.04] p-10 flex-shrink-0 relative overflow-hidden">
        {/* Subtle gradient orb */}
        <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-red-500/[0.06] blur-[100px]" />
        <div className="absolute -bottom-32 -right-32 w-64 h-64 rounded-full bg-red-500/[0.04] blur-[80px]" />

        <div className="flex items-center gap-2.5 relative">
          <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-red-500 to-red-700 text-white font-display font-bold text-sm select-none shadow-lg shadow-red-500/20">
            M
          </span>
          <span className="font-display font-semibold text-lg tracking-tight text-foreground">
            Muscle<span className="text-red-500">Map</span>
          </span>
        </div>

        {/* Center content */}
        <div className="space-y-8 relative">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-3.5 py-1.5 text-xs font-semibold text-red-400 mb-5">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
              Calisthenics Tracker
            </div>
            <h2 className="font-display text-3xl font-bold text-foreground leading-tight tracking-tight">
              Track your muscles,<br />
              <span className="text-red-500">not just your reps.</span>
            </h2>
            <p className="mt-4 text-muted-foreground text-sm leading-relaxed max-w-[340px]">
              Visualise muscle fatigue in real-time with science-based recovery tracking. Know exactly when your body is ready to train again.
            </p>
          </div>

          {/* Feature list */}
          <ul className="space-y-3.5">
            {[
              'Live fatigue heatmap on a body diagram',
              'Per-muscle recovery tracking over time',
              'Intelligent set & rep logging',
            ].map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex-shrink-0 h-5 w-5 rounded-md bg-red-500/10 text-red-400 flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-muted-foreground/40 relative">
          &copy; {new Date().getFullYear()} MuscleMap
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-red-500 to-red-700 text-white font-display font-bold text-sm select-none shadow-lg shadow-red-500/20">
              M
            </span>
            <span className="font-display font-semibold text-lg tracking-tight text-foreground">
              Muscle<span className="text-red-500">Map</span>
            </span>
          </div>
          <div className="glass-card p-8">
            {children}
          </div>
        </div>
      </div>
    </main>
  )
}

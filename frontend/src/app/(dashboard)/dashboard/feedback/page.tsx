import { FeedbackForm } from '@/components/feedback/FeedbackForm'

export default function FeedbackPage() {
  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground tracking-tight">Feedback</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Help us improve MuscleMap — report bugs, suggest features, or share your thoughts.
        </p>
      </div>
      <FeedbackForm />
    </div>
  )
}

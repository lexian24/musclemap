import { FeedbackForm } from '@/components/feedback/FeedbackForm'

export default function FeedbackPage() {
  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Feedback</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Help us improve MuscleMap — report bugs, suggest features, or share your thoughts.
        </p>
      </div>
      <FeedbackForm />
    </div>
  )
}

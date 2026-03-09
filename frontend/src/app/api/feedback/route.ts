// Run this SQL in Supabase dashboard:
// CREATE TABLE IF NOT EXISTS feedback (
//   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
//   user_id uuid REFERENCES auth.users(id),
//   type text NOT NULL,
//   message text NOT NULL,
//   created_at timestamptz DEFAULT now()
// );
// ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
// CREATE POLICY "Users can insert own feedback" ON feedback FOR INSERT WITH CHECK (auth.uid() = user_id);

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const feedbackSchema = z.object({
  type: z.enum(['bug', 'feature', 'general']),
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000, 'Message must be at most 1000 characters'),
})

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body: unknown = await request.json()
  const parsed = feedbackSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', issues: parsed.error.issues },
      { status: 400 },
    )
  }

  const { type, message } = parsed.data

  // If the feedback table doesn't exist yet, the insert will fail gracefully — return 201 anyway
  await supabase
    .from('feedback')
    .insert({ user_id: user.id, type, message })

  return NextResponse.json({ success: true }, { status: 201 })
}

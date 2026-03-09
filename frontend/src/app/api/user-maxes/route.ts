import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { upsertUserMax } from '@/lib/db/userMaxes'

const upsertMaxSchema = z.object({
  exerciseId: z.string().uuid(),
  maxValue: z.number().int().min(1),
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
  const parsed = upsertMaxSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', issues: parsed.error.issues },
      { status: 400 },
    )
  }

  const { exerciseId, maxValue } = parsed.data
  await upsertUserMax(user.id, exerciseId, maxValue)

  return NextResponse.json({ exerciseId, maxValue }, { status: 200 })
}

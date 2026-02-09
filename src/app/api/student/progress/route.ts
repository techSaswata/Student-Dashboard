import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Main Supabase for onboarding table
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { enrollmentId, progress, email, previousProgress } = body as {
      enrollmentId: string
      progress: number
      email: string
      previousProgress?: number
    }

    if (!enrollmentId || progress == null || !email) {
      return NextResponse.json(
        { error: 'enrollmentId, progress, and email are required' },
        { status: 400 }
      )
    }

    const progressNum = Number(progress)
    if (isNaN(progressNum) || progressNum < 0 || progressNum > 100) {
      return NextResponse.json(
        { error: 'progress must be a number between 0 and 100' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Verify this enrollment belongs to this email and get current progress
    const { data: row, error: fetchError } = await supabase
      .from('onboarding')
      .select('"EnrollmentID", "Email", progress')
      .eq('EnrollmentID', enrollmentId)
      .single()

    if (fetchError || !row) {
      return NextResponse.json(
        { error: 'Enrollment not found' },
        { status: 404 }
      )
    }

    if (row['Email']?.toLowerCase().trim() !== normalizedEmail) {
      return NextResponse.json(
        { error: 'Not authorized to update this enrollment' },
        { status: 403 }
      )
    }

    // Update DB when: (1) new > db, or (2) new < db but we were in sync (previousProgress === db).
    const dbProgress = row.progress != null ? Number(row.progress) : 0
    const prevProgress = previousProgress != null ? Number(previousProgress) : null

    const shouldUpdate =
      progressNum > dbProgress ||
      (progressNum < dbProgress && prevProgress !== null && prevProgress === dbProgress)

    if (!shouldUpdate) {
      return NextResponse.json({ ok: true, updated: false })
    }

    const { error: updateError } = await supabase
      .from('onboarding')
      .update({ progress: progressNum })
      .eq('EnrollmentID', enrollmentId)

    if (updateError) {
      console.error('Error updating progress:', updateError)
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true, updated: true })
  } catch (error: unknown) {
    console.error('Error in progress API:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    )
  }
}

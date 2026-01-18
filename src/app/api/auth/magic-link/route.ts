import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Main Supabase for onboarding table
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Supabase B for auth (magic link)
const supabaseB = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL_B!,
  process.env.SUPABASE_SERVICE_ROLE_KEY_B!
)

export async function POST(request: NextRequest) {
  try {
    const { email, cohortType, cohortNumber } = await request.json()

    // Validate all required fields
    if (!email || !cohortType || !cohortNumber) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()
    const normalizedCohortType = cohortType.trim()
    const normalizedCohortNumber = cohortNumber.trim()

    // Check if student exists in onboarding table with matching email (main Supabase)
    const { data: student, error: studentError } = await supabase
      .from('onboarding')
      .select('"EnrollmentID", "Full Name", "Email", "Cohort Type", "Cohort Number"')
      .ilike('Email', normalizedEmail)
      .single()

    if (studentError || !student) {
      return NextResponse.json(
        { error: 'Credentials not matched' },
        { status: 400 }
      )
    }

    // Validate cohort fields match
    const cohortTypeMatch = student['Cohort Type'].toLowerCase().trim() === normalizedCohortType.toLowerCase()
    const cohortNumberMatch = student['Cohort Number'].toString().trim() === normalizedCohortNumber

    // If any field doesn't match, return generic error
    if (!cohortTypeMatch || !cohortNumberMatch) {
      return NextResponse.json(
        { error: 'Credentials not matched' },
        { status: 400 }
      )
    }

    // All validations passed - send magic link
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const redirectUrl = `${origin}/home`
    
    const userData = {
      role: 'student',
      enrollment_id: student['EnrollmentID'],
      student_name: student['Full Name'],
      cohort_type: student['Cohort Type'],
      cohort_number: student['Cohort Number']
    }
    
    // Send magic link via Supabase B
    const { error: signInError } = await supabaseB.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        emailRedirectTo: redirectUrl,
        data: userData
      }
    })

    if (signInError) {
      console.error('Supabase B magic link error:', signInError)
      return NextResponse.json(
        { error: 'Failed to send verification link. Please try again.' },
        { status: 500 }
      )
    }

    // Also update user metadata for existing users (signInWithOtp only sets on first signup)
    // Find the user by email and update their metadata
    const { data: existingUsers } = await supabaseB.auth.admin.listUsers()
    const existingUser = existingUsers?.users?.find(
      u => u.email?.toLowerCase() === normalizedEmail
    )
    
    if (existingUser) {
      await supabaseB.auth.admin.updateUserById(existingUser.id, {
        user_metadata: userData
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Verification link sent successfully',
      studentName: student['Full Name']
    })

  } catch (error: any) {
    console.error('Magic link error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}

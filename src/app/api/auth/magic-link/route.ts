import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateOTP, hashOTP, generateOTPEmailHTML } from '@/lib/otp'
import { sendEmail } from '@/lib/email'

// Main Supabase for onboarding table
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Supabase B for auth + OTP storage
const supabaseB = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL_B!,
  process.env.SUPABASE_SERVICE_ROLE_KEY_B!
)

const OTP_EXPIRY_MINUTES = 5

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

    // Rate limit: check if an unused OTP was created < 60s ago
    const { data: recentOtp } = await supabaseB
      .from('otp_codes_student')
      .select('created_at')
      .eq('email', normalizedEmail)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (recentOtp) {
      const createdAt = new Date(recentOtp.created_at).getTime()
      if (Date.now() - createdAt < 60 * 1000) {
        return NextResponse.json(
          { error: 'Please wait before requesting a new code.' },
          { status: 429 }
        )
      }
    }

    // Invalidate any previous unused OTPs for this email
    await supabaseB
      .from('otp_codes_student')
      .update({ used: true })
      .eq('email', normalizedEmail)
      .eq('used', false)

    // Generate and store new OTP
    const otp = generateOTP()
    const otpHash = hashOTP(otp)
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000).toISOString()

    const { error: insertError } = await supabaseB
      .from('otp_codes_student')
      .insert({
        email: normalizedEmail,
        otp_hash: otpHash,
        enrollment_id: student['EnrollmentID'],
        student_name: student['Full Name'],
        cohort_type: student['Cohort Type'],
        cohort_number: student['Cohort Number'],
        expires_at: expiresAt,
      })

    if (insertError) {
      console.error('OTP insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to generate verification code.' },
        { status: 500 }
      )
    }

    // Send OTP email via Resend
    const emailHtml = generateOTPEmailHTML(student['Full Name'], otp)
    const sent = await sendEmail({
      to: normalizedEmail,
      subject: 'Your MentiBY Login Code',
      html: emailHtml,
    })

    if (!sent) {
      return NextResponse.json(
        { error: 'Failed to send verification email. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Verification code sent successfully',
      studentName: student['Full Name']
    })

  } catch (error: any) {
    console.error('Send OTP error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Main Supabase for onboarding table
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Supabase B for cohort schedule tables
const supabaseB = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL_B!,
  process.env.SUPABASE_SERVICE_ROLE_KEY_B!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Fetch all enrollments for this student from onboarding table
    const { data: enrollments, error: enrollmentError } = await supabase
      .from('onboarding')
      .select('"EnrollmentID", "Full Name", "Cohort Type", "Cohort Number"')
      .eq('Email', email)

    if (enrollmentError) {
      console.error('Error fetching enrollments:', enrollmentError)
      return NextResponse.json(
        { error: 'Failed to fetch enrollments' },
        { status: 500 }
      )
    }

    if (!enrollments || enrollments.length === 0) {
      return NextResponse.json({ batches: [] })
    }

    // For each enrollment, get session count from the cohort schedule table
    const batches = await Promise.all(
      enrollments.map(async (enrollment) => {
        const cohortType = enrollment['Cohort Type']
        const cohortNumber = enrollment['Cohort Number']
        
        // Build table name: e.g., "basic1_0_schedule"
        const cleanCohortNumber = cohortNumber?.replace('.', '_') || ''
        const tableName = `${cohortType?.toLowerCase() || ''}${cleanCohortNumber}_schedule`
        
        // Try to get session count
        let sessionCount = 0
        try {
          const { count, error } = await supabaseB
            .from(tableName)
            .select('*', { count: 'exact', head: true })
          
          if (!error && count !== null) {
            sessionCount = count
          }
        } catch (e) {
          // Table might not exist, that's okay
          console.log(`Table ${tableName} not found or error:`, e)
        }

        return {
          enrollmentId: enrollment['EnrollmentID'],
          studentName: enrollment['Full Name'],
          cohortType: cohortType,
          cohortNumber: cohortNumber,
          tableName: tableName,
          batchName: `${cohortType} ${cohortNumber}`,
          sessionCount: sessionCount
        }
      })
    )

    return NextResponse.json({ batches })

  } catch (error: any) {
    console.error('Error in student batches API:', error)
    return NextResponse.json(
      { error: error.message || 'An error occurred' },
      { status: 500 }
    )
  }
}



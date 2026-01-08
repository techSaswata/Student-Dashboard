import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Supabase B for cohort schedule tables
const supabaseB = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL_B!,
  process.env.SUPABASE_SERVICE_ROLE_KEY_B!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const cohortType = searchParams.get('cohortType')
    const cohortNumber = searchParams.get('cohortNumber')
    const days = parseInt(searchParams.get('days') || '5')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!cohortType || !cohortNumber) {
      return NextResponse.json(
        { error: 'Cohort type and number are required' },
        { status: 400 }
      )
    }

    // Build table name: e.g., "basic1_schedule", "placement2_schedule"
    // Handle cohort numbers like "1.0" -> "1_0"
    const cleanCohortNumber = cohortNumber.replace('.', '_')
    const tableName = `${cohortType.toLowerCase()}${cleanCohortNumber}_schedule`

    // Calculate date range
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const startDate = new Date(today)
    startDate.setDate(startDate.getDate() + offset)
    
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + days - 1)

    // Format dates for query
    const formatDateLocal = (date: Date): string => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    const startDateStr = formatDateLocal(startDate)
    const endDateStr = formatDateLocal(endDate)

    // Query the cohort schedule table
    const { data: sessions, error } = await supabaseB
      .from(tableName)
      .select('*')
      .gte('date', startDateStr)
      .lte('date', endDateStr)
      .order('date', { ascending: true })
      .order('time', { ascending: true })

    if (error) {
      console.error('Error fetching sessions:', error)
      // Check if table doesn't exist
      if (error.code === '42P01' || error.message.includes('does not exist')) {
        return NextResponse.json(
          { error: `Cohort schedule not found for ${cohortType} ${cohortNumber}` },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    // Generate date range for the calendar view
    const dates: string[] = []
    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      dates.push(formatDateLocal(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }

    // Group sessions by date
    const sessionsByDate: Record<string, any[]> = {}
    dates.forEach(date => {
      sessionsByDate[date] = []
    })

    // Format sessions for frontend
    const formattedSessions = (sessions || []).map(session => ({
      id: session.id,
      date: session.date?.split('T')[0] || session.date,
      day: session.day,
      time: session.time,
      subject: session.subject_name || 'Untitled',
      topic: session.subject_topic || '',
      sessionType: session.session_type,
      subjectType: session.subject_type,
      meetingLink: session.teams_meeting_link,
      sessionMaterial: session.session_material,
      initialSessionMaterial: session.initial_session_material,
      sessionRecording: session.session_recording,
      weekNumber: session.week_number,
      sessionNumber: session.session_number,
      tableName: tableName,
      batchName: `${cohortType.charAt(0).toUpperCase() + cohortType.slice(1)} ${cohortNumber}`
    }))

    // Add sessions to their respective dates
    formattedSessions.forEach(session => {
      const dateKey = session.date
      if (sessionsByDate[dateKey]) {
        sessionsByDate[dateKey].push(session)
      }
    })

    // Find today's session
    const todayStr = formatDateLocal(today)
    const todaySessions = formattedSessions.filter(s => s.date === todayStr)
    const todaySession = todaySessions.length > 0 ? todaySessions[0] : null

    return NextResponse.json({
      sessions: formattedSessions,
      sessionsByDate,
      todaySession,
      dates,
      tableName,
      cohortName: `${cohortType.charAt(0).toUpperCase() + cohortType.slice(1)} ${cohortNumber}`
    })

  } catch (error: any) {
    console.error('Error in student sessions API:', error)
    return NextResponse.json(
      { error: error.message || 'An error occurred' },
      { status: 500 }
    )
  }
}


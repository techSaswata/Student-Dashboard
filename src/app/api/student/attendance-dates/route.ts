import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * Returns dates when the student was present (for schedule coloring).
 * Reads from public.attendance_logs: distinct class_date where enrollment_id and attendance = true.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const enrollmentId = searchParams.get('enrollmentId')

    if (!enrollmentId) {
      return NextResponse.json(
        { error: 'enrollmentId is required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('attendance_logs')
      .select('class_date')
      .eq('enrollment_id', enrollmentId)
      .eq('attendance', true)
      .order('class_date', { ascending: true })

    if (error) {
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        return NextResponse.json({ success: true, presentDates: [] })
      }
      console.error('Attendance dates error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch attendance dates' },
        { status: 500 }
      )
    }

    // Distinct dates (multiple rows per date when multiple subjects)
    const dateSet = new Set<string>()
    ;(data || []).forEach((row: { class_date: string }) => {
      const d = row.class_date && row.class_date.toString().split('T')[0]
      if (d) dateSet.add(d)
    })
    const presentDates = Array.from(dateSet).sort()

    return NextResponse.json({
      success: true,
      presentDates
    })
  } catch (err) {
    console.error('API error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

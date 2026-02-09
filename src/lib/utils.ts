import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Parse session date (YYYY-MM-DD) + time (HH:MM or H:MM) into a Date in local time. */
export function parseSessionStart(dateStr: string, timeStr: string): Date | null {
  if (!dateStr || !timeStr) return null
  const [hours, minutes] = timeStr.trim().split(':').map(s => parseInt(s, 10))
  if (isNaN(hours) || isNaN(minutes)) return null
  const d = new Date(dateStr + 'T00:00:00')
  if (isNaN(d.getTime())) return null
  d.setHours(hours, minutes, 0, 0)
  return d
}

const TWO_HOURS_MS = 2 * 60 * 60 * 1000

/**
 * Join button is enabled only when:
 * - Session has a meeting link
 * - Session has no recording yet (session_recording is null/empty)
 * - Current time is within the join window: from 2 hours before session start onwards
 */
export function canShowJoinButton(params: {
  date: string
  time: string
  meetingLink?: string | null
  sessionRecording?: string | null
}): boolean {
  if (!params.meetingLink || params.sessionRecording) return false
  const start = parseSessionStart(params.date, params.time)
  if (!start) return false
  const joinWindowStart = new Date(start.getTime() - TWO_HOURS_MS)
  return new Date() >= joinWindowStart
} 
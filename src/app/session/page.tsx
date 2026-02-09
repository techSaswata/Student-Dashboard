'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import AuthWrapper from '@/components/auth/AuthWrapper'
import { 
  Calendar, Clock, Video, FileText, 
  LogOut, Loader2, RefreshCw, Sparkles, Link2,
  ExternalLink, ChevronLeft, BookOpen, AlertCircle
} from 'lucide-react'
import { canShowJoinButton } from '@/lib/utils'

interface SessionDetails {
  id: number
  week_number: number
  session_number: number
  date: string
  time: string
  day: string
  session_type: string
  subject_type: string
  subject_name: string
  subject_topic: string
  initial_session_material: string
  session_material: string
  session_recording: string
  mentor_id: number
  swapped_mentor_id: number | null
  teams_meeting_link: string
  materialLinks: string[]
}

interface SessionPageData {
  table: string
  date: string
  time: string
  batch: string
  from: string
}

function SessionDetailsPage() {
  const router = useRouter()
  const { signOut } = useAuth()
  
  // Read from sessionStorage
  const [pageData, setPageData] = useState<SessionPageData | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  
  useEffect(() => {
    const stored = sessionStorage.getItem('sessionPageData')
    if (stored) {
      try {
        setPageData(JSON.parse(stored))
      } catch {
        router.push('/home')
      }
    } else {
      router.push('/home')
    }
    setIsInitialized(true)
  }, [router])

  const tableName = pageData?.table || null
  const date = pageData?.date || null
  const time = pageData?.time || null
  const batchName = pageData?.batch || 'Unknown Batch'
  const fromPage = pageData?.from || 'home'

  const handleBack = () => {
    if (fromPage === 'my-batches') {
      router.push('/my-batches')
    } else {
      router.push('/home')
    }
  }

  const [session, setSession] = useState<SessionDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSession = async () => {
    if (!tableName || !date || !time) {
      setError('Missing session parameters')
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const response = await fetch(
        `/api/mentor/session-details?table=${tableName}&date=${date}&time=${time}`
      )
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to fetch session')
        return
      }

      setSession(data.session)
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (pageData) {
      fetchSession()
    }
  }, [pageData])

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-IN', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    })
  }

  const formatTime = (timeStr: string) => {
    if (!timeStr) return 'TBD'
    const [hours, minutes] = timeStr.split(':')
    const h = parseInt(hours)
    const ampm = h >= 12 ? 'PM' : 'AM'
    const hour12 = h % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  // Transform Graph API recording URL to our streaming endpoint
  const getRecordingUrl = (recordingUrl: string) => {
    // Check if it's a Microsoft Graph API URL
    if (recordingUrl.includes('graph.microsoft.com') && recordingUrl.includes('/recordings/')) {
      // Extract meetingId and recordingId from URL
      const match = recordingUrl.match(/onlineMeetings\/([^/]+)\/recordings\/([^/]+)/)
      if (match) {
        const [, meetingId, recordingId] = match
        return `/api/recording/stream?meetingId=${encodeURIComponent(meetingId)}&recordingId=${encodeURIComponent(recordingId)}`
      }
    }
    return recordingUrl
  }

  if (!isInitialized || loading || !pageData) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center">
        {/* Background */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/20 via-slate-950 to-teal-950/20" />
        </div>
        {/* Spinning rings */}
        <div className="relative z-10 mb-6">
          <div className="w-20 h-20 rounded-full border-4 border-transparent border-t-emerald-500 border-r-teal-500 animate-spin" />
          <div className="absolute inset-1.5 w-[62px] h-[62px] rounded-full border-4 border-transparent border-b-cyan-400 border-l-green-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/50 animate-pulse">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
        <p className="relative z-10 text-slate-400 text-sm">Loading session details...</p>
      </div>
    )
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl text-white mb-2">Session Not Found</h2>
          <p className="text-slate-400 mb-4">{error}</p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/20 via-slate-950 to-teal-950/20" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-teal-600/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/5 bg-slate-950/50 backdrop-blur-xl sticky top-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>{fromPage === 'my-batches' ? 'Back to My Batches' : 'Back to Home'}</span>
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-white">Class Details</h1>
                <p className="text-slate-500 text-xs">{batchName}</p>
              </div>
            </div>

            <button
              onClick={signOut}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Session Header Card */}
        <div className="bg-gradient-to-br from-emerald-600/20 via-teal-600/10 to-slate-900/50 border border-emerald-500/20 rounded-2xl p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
            <div>
              <span className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-300 text-sm rounded-lg font-medium mb-3">
                {batchName}
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                {session.subject_name || 'Session'}
              </h2>
              <p className="text-slate-400">{session.subject_topic || 'No topic specified'}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchSession}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-xs uppercase tracking-wide">Date</span>
              </div>
              <p className="text-white font-medium">{formatDate(session.date)}</p>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-xs uppercase tracking-wide">Time</span>
              </div>
              <p className="text-white font-medium">{formatTime(session.time)}</p>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <BookOpen className="w-4 h-4" />
                <span className="text-xs uppercase tracking-wide">Type</span>
              </div>
              <p className="text-white font-medium">{session.session_type || 'Regular'}</p>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <BookOpen className="w-4 h-4" />
                <span className="text-xs uppercase tracking-wide">Subject Type</span>
              </div>
              <p className="text-white font-medium">{session.subject_type || 'General'}</p>
            </div>
          </div>

          {/* Join Button - enabled 2hrs before start, disabled if session has recording */}
          {session.teams_meeting_link ? (
            canShowJoinButton({
              date: session.date,
              time: session.time,
              meetingLink: session.teams_meeting_link,
              sessionRecording: session.session_recording
            }) ? (
              <a
                href={session.teams_meeting_link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/20"
              >
                <Video className="w-5 h-5" />
                Join Class
              </a>
            ) : (
              <div className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-3 bg-slate-700/50 text-slate-400 font-medium rounded-xl cursor-not-allowed">
                <Video className="w-5 h-5" />
                {session.session_recording ? 'Recording available' : 'Join opens 2 hrs before class'}
              </div>
            )
          ) : (
            <div className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-3 bg-slate-700/50 text-slate-400 font-medium rounded-xl">
              <Video className="w-5 h-5" />
              No Meeting Link Yet
            </div>
          )}
        </div>

        {/* Session Materials Section */}
        <div className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-400" />
              Class Materials
            </h3>
          </div>

          <div className="p-6 space-y-6">
            {/* Existing Materials */}
            {session.materialLinks && session.materialLinks.length > 0 ? (
              <div>
                <p className="text-sm font-medium text-slate-300 mb-3">Available Materials</p>
                <div className="space-y-2">
                  {session.materialLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link.startsWith('http') ? link : `https://${link}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-blue-400 hover:text-blue-300 hover:border-blue-500/30 transition-colors group"
                    >
                      <Link2 className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate flex-1">Material {index + 1}</span>
                      <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-slate-600" />
                </div>
                <p className="text-slate-400 mb-1">No materials available yet</p>
                <p className="text-slate-500 text-sm">Materials will be added by the mentor</p>
              </div>
            )}

            {/* Recording Link */}
            <div className="border-t border-slate-700/50 pt-6">
              <p className="text-sm font-medium text-slate-300 mb-3">Class Recording</p>
              {session.session_recording ? (
                <a
                  href={getRecordingUrl(session.session_recording)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 hover:text-emerald-300 transition-colors group"
                >
                  <Video className="w-5 h-5" />
                  <span>View Recording</span>
                  <ExternalLink className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 px-4 bg-slate-800/30 border border-slate-700/30 rounded-xl">
                  <div className="w-14 h-14 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                    <Video className="w-7 h-7 text-slate-500" />
                  </div>
                  <p className="text-slate-400 font-medium mb-1">No Recording Available</p>
                  <p className="text-slate-500 text-sm text-center">Recordings will be available 24 hours after the class ends</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function SessionPageWrapper() {
  return (
    <AuthWrapper>
      <SessionDetailsPage />
    </AuthWrapper>
  )
}

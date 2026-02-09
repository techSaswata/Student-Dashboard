'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import AuthWrapper from '@/components/auth/AuthWrapper'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Users, ChevronRight, ChevronLeft, Loader2, RefreshCw, 
  LogOut, Calendar, BookOpen, Award, Trophy,
  GraduationCap, Home, MessageSquareHeart, Clapperboard, List, FileText
} from 'lucide-react'

interface Batch {
  enrollmentId: string
  studentName: string
  cohortType: string
  cohortNumber: string
  tableName: string
  batchName: string
  sessionCount: number
}

interface Session {
  id: number
  date: string
  day: string
  time: string
  subject: string
  topic?: string
  sessionType?: string
  weekNumber?: number
  sessionNumber?: number
  tableName?: string
  batchName?: string
}

function CurriculumContent() {
  const router = useRouter()
  const { user, signOut } = useAuth()
  
  // Batches state
  const [batches, setBatches] = useState<Batch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)
  
  // Sessions state
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [loadingSessions, setLoadingSessions] = useState(false)
  const [checkedSessions, setCheckedSessions] = useState<Set<string>>(new Set())
  const progressBeforeToggleRef = useRef<number | null>(null)

  // Load checked sessions from localStorage when batch changes
  useEffect(() => {
    if (selectedBatch) {
      const storageKey = `curriculum-checked-${selectedBatch.cohortType}-${selectedBatch.cohortNumber}`
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          setCheckedSessions(new Set(parsed))
        } catch (e) {
          console.error('Error loading checked sessions from localStorage:', e)
        }
      } else {
        setCheckedSessions(new Set())
      }
    }
  }, [selectedBatch])

  // Save checked sessions to localStorage whenever they change
  useEffect(() => {
    if (selectedBatch && checkedSessions.size >= 0) {
      const storageKey = `curriculum-checked-${selectedBatch.cohortType}-${selectedBatch.cohortNumber}`
      localStorage.setItem(storageKey, JSON.stringify([...checkedSessions]))
    }
  }, [checkedSessions, selectedBatch])

  // Sync progress to onboarding table (main Supabase)
  useEffect(() => {
    if (!selectedBatch || !user?.email || sessions.length === 0) return

    const totalClasses = sessions.filter(s => s.sessionType?.toLowerCase() !== 'contest').length
    if (totalClasses === 0) return

    const progress = Math.round((checkedSessions.size / totalClasses) * 100)
    const previousProgress = progressBeforeToggleRef.current

    const timeoutId = window.setTimeout(() => {
      fetch('/api/student/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enrollmentId: selectedBatch.enrollmentId,
          progress,
          email: user.email,
          ...(previousProgress !== null && { previousProgress })
        })
      }).catch(err => console.error('Failed to sync progress:', err))
      progressBeforeToggleRef.current = progress
    }, 400)

    return () => window.clearTimeout(timeoutId)
  }, [checkedSessions, selectedBatch, sessions.length, user?.email])

  const toggleSessionCheck = (sessionKey: string) => {
    const totalClasses = sessions.filter(s => s.sessionType?.toLowerCase() !== 'contest').length
    setCheckedSessions(prev => {
      progressBeforeToggleRef.current =
        totalClasses > 0 ? Math.round((prev.size / totalClasses) * 100) : 0
      const newSet = new Set(prev)
      if (newSet.has(sessionKey)) {
        newSet.delete(sessionKey)
      } else {
        newSet.add(sessionKey)
      }
      return newSet
    })
  }

  const fetchBatches = async () => {
    if (!user?.email) {
      setError('No email found in session')
      setLoading(false)
      setInitialLoadComplete(true)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/student/batches?email=${encodeURIComponent(user.email)}`)
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to fetch batches')
        setLoading(false)
        setInitialLoadComplete(true)
        return
      }

      const fetchedBatches = data.batches || []
      setBatches(fetchedBatches)
      
      // If only one batch, auto-select it and fetch sessions before showing anything
      if (fetchedBatches.length === 1) {
        setSelectedBatch(fetchedBatches[0])
        // Don't set loading false yet - wait for sessions to load
        try {
          const sessionsResponse = await fetch(
            `/api/student/sessions?cohortType=${encodeURIComponent(fetchedBatches[0].cohortType)}&cohortNumber=${encodeURIComponent(fetchedBatches[0].cohortNumber)}&days=730&offset=-365`
          )
          const sessionsData = await sessionsResponse.json()
          if (sessionsResponse.ok) {
            setSessions(sessionsData.sessions || [])
          }
        } catch (err) {
          console.error('Error fetching sessions:', err)
        }
        setLoading(false)
        setInitialLoadComplete(true)
      } else {
        // Multiple batches - show batch selection
        setLoading(false)
        setInitialLoadComplete(true)
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
      setLoading(false)
      setInitialLoadComplete(true)
    }
  }

  const fetchSessions = async (batch: Batch) => {
    setLoadingSessions(true)
    try {
      const response = await fetch(
        `/api/student/sessions?cohortType=${encodeURIComponent(batch.cohortType)}&cohortNumber=${encodeURIComponent(batch.cohortNumber)}&days=730&offset=-365`
      )
      const data = await response.json()
      if (response.ok) {
        setSessions(data.sessions || [])
      }
    } catch (err) {
      console.error('Error fetching sessions:', err)
    } finally {
      setLoadingSessions(false)
    }
  }

  useEffect(() => {
    if (user?.email) {
      fetchBatches()
    }
  }, [user?.email])

  useEffect(() => {
    // Only fetch sessions on batch change if initial load is complete (user selected a batch manually)
    if (selectedBatch && initialLoadComplete && batches.length > 1) {
      fetchSessions(selectedBatch)
    }
  }, [selectedBatch])

  const handleSelectBatch = (batch: Batch) => {
    setSelectedBatch(batch)
  }

  const handleBackToBatches = () => {
    setSelectedBatch(null)
    setSessions([])
  }

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Get session type badge colors
  const getSessionTypeBadge = (sessionType: string | undefined) => {
    switch (sessionType?.toLowerCase()) {
      case 'live session':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
      case 'self paced':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'project':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'assignment':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
      case 'contest':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'doubt session':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30'
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }
  }

  // Check if a session is past
  const isPastSession = (dateStr: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const sessionDate = new Date(dateStr)
    return sessionDate < today
  }

  // Check if a session is in current week
  const isCurrentWeek = (dateStr: string) => {
    const today = new Date()
    const sessionDate = new Date(dateStr)
    
    // Get the start of the current week (Sunday)
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())
    startOfWeek.setHours(0, 0, 0, 0)
    
    // Get the end of the current week (Saturday)
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    endOfWeek.setHours(23, 59, 59, 999)
    
    return sessionDate >= startOfWeek && sessionDate <= endOfWeek
  }

  // Show loading screen until initial load is complete
  if (loading || !initialLoadComplete) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/20 via-slate-950 to-purple-950/20" />
        </div>
        <div className="relative z-10 mb-6">
          <div className="w-24 h-24 rounded-full border-4 border-transparent border-t-indigo-500 border-r-purple-500 animate-spin" />
          <div className="absolute inset-2 w-[80px] h-[80px] rounded-full border-4 border-transparent border-b-violet-400 border-l-fuchsia-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/50 animate-pulse">
              <List className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <p className="relative z-10 text-slate-400">Loading curriculum...</p>
      </div>
    )
  }

  // List View (when a batch is selected)
  if (selectedBatch) {
    return (
      <div className="min-h-screen bg-[#0a0a0f]">
        {/* Background */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/20 via-slate-950 to-purple-950/20" />
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-600/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-3xl" />
        </div>

        {/* Header */}
        <header className="relative z-10 border-b border-white/5 bg-slate-950/50 backdrop-blur-xl sticky top-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {batches.length > 1 && (
                  <button
                    onClick={handleBackToBatches}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-white"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <List className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-white">
                    {selectedBatch.batchName} Curriculum
                  </h1>
                  <p className="text-slate-500 text-xs sm:text-sm">
                    {sessions.length} classes • ID: {selectedBatch.enrollmentId}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-4">
                <div className="hidden sm:block text-right">
                  <p className="text-white font-medium text-sm">{user?.name || 'Student'}</p>
                  <p className="text-slate-500 text-xs">{user?.email}</p>
                </div>
                <button
                  onClick={signOut}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <nav className="relative z-10 border-b border-white/5 bg-slate-900/30 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex gap-1 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => router.push('/home')}
                className="px-4 sm:px-6 py-3 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors whitespace-nowrap"
              >
                <Home className="w-4 h-4 inline-block mr-2" />
                Home
              </button>
              <button
                onClick={() => router.push('/my-batches')}
                className="px-4 sm:px-6 py-3 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors whitespace-nowrap"
              >
                <Calendar className="w-4 h-4 inline-block mr-2" />
                My Schedule
              </button>
              <button
                className="px-4 sm:px-6 py-3 text-sm font-medium text-indigo-400 border-b-2 border-indigo-400 bg-indigo-500/5 whitespace-nowrap"
              >
                <List className="w-4 h-4 inline-block mr-2" />
                Curriculum
              </button>
              <button
                onClick={() => router.push('/recorded-classes')}
                className="px-4 sm:px-6 py-3 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors whitespace-nowrap"
              >
                <Clapperboard className="w-4 h-4 inline-block mr-2" />
                Pre-Recorded Content
              </button>
              <button
                onClick={() => router.push('/your-attendance')}
                className="px-4 sm:px-6 py-3 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors whitespace-nowrap"
              >
                <Award className="w-4 h-4 inline-block mr-2" />
                My Attendance
              </button>
              <button
                onClick={() => router.push('/xp-leaderboard')}
                className="px-4 sm:px-6 py-3 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors whitespace-nowrap"
              >
                <Trophy className="w-4 h-4 inline-block mr-2" />
                XP Leaderboard
              </button>
              <button
                onClick={() => router.push('/feedback')}
                className="px-4 sm:px-6 py-3 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors whitespace-nowrap"
              >
                <MessageSquareHeart className="w-4 h-4 inline-block mr-2" />
                Feedback
              </button>
            </div>
          </div>
        </nav>

        {/* Curriculum List Content */}
        <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Progress Bar */}
          {sessions.length > 0 && !loadingSessions && (() => {
            const totalClasses = sessions.filter(s => s.sessionType?.toLowerCase() !== 'contest').length
            const checkedCount = checkedSessions.size
            const progress = totalClasses > 0 ? Math.round((checkedCount / totalClasses) * 100) : 0
            
            return (
              <div className="mb-8 p-5 sm:p-6 bg-gradient-to-br from-slate-800/60 via-slate-900/60 to-slate-800/60 border border-white/10 rounded-2xl backdrop-blur-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-white font-semibold text-lg">Course Progress</h3>
                    <p className="text-slate-400 text-sm">{checkedCount} of {totalClasses} Topics completed</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <svg className="w-16 h-16 sm:w-20 sm:h-20 -rotate-90" viewBox="0 0 100 100">
                        {/* Background circle */}
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="rgba(100, 116, 139, 0.2)"
                          strokeWidth="8"
                        />
                        {/* Progress circle */}
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="url(#progressGradient)"
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray={`${progress * 2.51} 251`}
                          className="transition-all duration-500 ease-out"
                        />
                        <defs>
                          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#818cf8" />
                            <stop offset="50%" stopColor="#a78bfa" />
                            <stop offset="100%" stopColor="#c084fc" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xl sm:text-2xl font-bold text-white">{progress}%</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Linear Progress Bar */}
                <div className="relative h-3 bg-slate-700/50 rounded-full overflow-hidden">
                  <div 
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                  <div 
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-400/50 via-purple-400/50 to-fuchsia-400/50 rounded-full blur-sm transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                
                {/* Milestone markers */}
                <div className="flex justify-between mt-2 px-1">
                  {[0, 25, 50, 75, 100].map((milestone) => (
                    <div key={milestone} className="flex flex-col items-center">
                      <div className={`w-1.5 h-1.5 rounded-full ${progress >= milestone ? 'bg-purple-400' : 'bg-slate-600'}`} />
                      <span className={`text-[10px] mt-1 ${progress >= milestone ? 'text-purple-400' : 'text-slate-600'}`}>{milestone}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-6 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-amber-500/30 border-2 border-amber-400" />
              <span className="text-slate-400">This Week</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-indigo-500/20 border-2 border-indigo-500/50" />
              <span className="text-slate-400">Upcoming</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-slate-700/50 border border-slate-600/50" />
              <span className="text-slate-400">Past</span>
            </div>
          </div>

          {/* Loading */}
          {loadingSessions ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-full border-4 border-transparent border-t-indigo-500 border-r-purple-500 animate-spin" />
                <div className="absolute inset-1.5 w-[62px] h-[62px] rounded-full border-4 border-transparent border-b-violet-400 border-l-fuchsia-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/50 animate-pulse">
                    <List className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
              <p className="text-slate-400 text-sm">Loading curriculum...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="w-10 h-10 text-slate-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No classes found</h3>
              <p className="text-slate-400">No curriculum data available for this batch yet.</p>
            </div>
          ) : (
            <>
              {/* Table Header - Desktop */}
              <div className="hidden md:grid md:grid-cols-12 gap-4 px-4 py-3 bg-slate-800/30 rounded-t-xl border border-white/5 border-b-0 text-sm font-medium text-slate-400">
                <div className="col-span-1 flex items-center justify-center">
                  <div className="w-4 h-4" />
                </div>
                <div className="col-span-3">Date</div>
                <div className="col-span-3">Subject</div>
                <div className="col-span-5">Topic</div>
              </div>

              {/* Session List */}
              <div className="space-y-0 md:space-y-0">
                {sessions.filter(s => s.sessionType?.toLowerCase() !== 'contest').map((session, index) => {
                  const isPast = isPastSession(session.date)
                  const thisWeek = isCurrentWeek(session.date)
                  const sessionKey = `${session.date}-${session.id || index}`
                  
                  return (
                    <div
                      key={session.id || index}
                      className={`
                        border border-white/5 transition-all duration-200
                        ${index === 0 ? 'md:rounded-t-none rounded-t-xl' : ''}
                        ${index === sessions.filter(s => s.sessionType?.toLowerCase() !== 'contest').length - 1 ? 'rounded-b-xl' : ''}
                        ${thisWeek && !isPast
                          ? 'bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/15' 
                          : isPast 
                            ? 'bg-slate-900/30 hover:bg-slate-800/30' 
                            : 'bg-indigo-500/5 border-indigo-500/20 hover:bg-indigo-500/10'
                        }
                      `}
                    >
                      {/* Mobile Layout */}
                      <div className="md:hidden p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <input
                            type="checkbox"
                            checked={checkedSessions.has(sessionKey)}
                            onChange={() => toggleSessionCheck(sessionKey)}
                            className="w-4 h-4 rounded border-2 border-slate-600 bg-slate-800/50 checked:bg-indigo-500 checked:border-indigo-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                          />
                          {thisWeek && !isPast && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-amber-500 text-black rounded-full font-bold">
                              This Week
                            </span>
                          )}
                        </div>
                        <p className={`text-xs mb-1 ${checkedSessions.has(sessionKey) ? 'text-slate-500 line-through' : isPast ? 'text-slate-500' : thisWeek ? 'text-amber-300' : 'text-slate-400'}`}>
                          {formatDate(session.date)}
                        </p>
                        <p className={`text-sm mb-1 ${checkedSessions.has(sessionKey) ? 'text-slate-400 line-through' : 'text-white'}`}>
                          {session.subject}
                        </p>
                        {session.topic && (
                          <h3 className={`font-semibold ${checkedSessions.has(sessionKey) ? 'text-slate-500 line-through' : isPast ? 'text-slate-500' : 'text-slate-300'}`}>
                            {session.topic}
                          </h3>
                        )}
                      </div>

                      {/* Desktop Layout */}
                      <div className="hidden md:grid md:grid-cols-12 gap-4 px-4 py-4 items-center">
                        <div className="col-span-1 flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={checkedSessions.has(sessionKey)}
                            onChange={() => toggleSessionCheck(sessionKey)}
                            className="w-4 h-4 rounded border-2 border-slate-600 bg-slate-800/50 checked:bg-indigo-500 checked:border-indigo-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                          />
                        </div>
                        <div className="col-span-3">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm ${checkedSessions.has(sessionKey) ? 'text-slate-500 line-through' : isPast ? 'text-slate-500' : thisWeek ? 'text-amber-300' : 'text-slate-300'}`}>
                              {formatDate(session.date)}
                            </span>
                            {thisWeek && !isPast && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-amber-500 text-black rounded-full font-bold">
                                This Week
                              </span>
                            )}
                          </div>
                        </div>
                        <div className={`col-span-3 text-sm ${checkedSessions.has(sessionKey) ? 'text-slate-400 line-through' : 'text-white'}`}>
                          {session.subject}
                        </div>
                        <div className={`col-span-5 font-medium ${checkedSessions.has(sessionKey) ? 'text-slate-500 line-through' : isPast ? 'text-slate-500' : 'text-slate-300'}`}>
                          {session.topic || '-'}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </main>
      </div>
    )
  }

  // Batches List View
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/20 via-slate-950 to-purple-950/20" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/5 bg-slate-950/50 backdrop-blur-xl sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">
                  Menti<span className="text-indigo-400">BY</span>
                </h1>
                <p className="text-slate-500 text-xs sm:text-sm">Student Dashboard</p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden sm:block text-right">
                <p className="text-white font-medium text-sm">{user?.name || 'Student'}</p>
                <p className="text-slate-500 text-xs">{user?.email}</p>
              </div>
              <button
                onClick={signOut}
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="relative z-10 border-b border-white/5 bg-slate-900/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => router.push('/home')}
              className="px-4 sm:px-6 py-3 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors whitespace-nowrap"
            >
              <Home className="w-4 h-4 inline-block mr-2" />
              Home
            </button>
            <button
              onClick={() => router.push('/my-batches')}
              className="px-4 sm:px-6 py-3 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors whitespace-nowrap"
            >
              <Calendar className="w-4 h-4 inline-block mr-2" />
              My Schedule
            </button>
            <button
              className="px-4 sm:px-6 py-3 text-sm font-medium text-indigo-400 border-b-2 border-indigo-400 bg-indigo-500/5 whitespace-nowrap"
            >
              <List className="w-4 h-4 inline-block mr-2" />
              Curriculum
            </button>
            <button
              onClick={() => router.push('/recorded-classes')}
              className="px-4 sm:px-6 py-3 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors whitespace-nowrap"
            >
              <Clapperboard className="w-4 h-4 inline-block mr-2" />
              Pre-Recorded Content
            </button>
            <button
              onClick={() => router.push('/your-attendance')}
              className="px-4 sm:px-6 py-3 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors whitespace-nowrap"
            >
              <Award className="w-4 h-4 inline-block mr-2" />
              My Attendance
            </button>
            <button
              onClick={() => router.push('/xp-leaderboard')}
              className="px-4 sm:px-6 py-3 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors whitespace-nowrap"
            >
              <Trophy className="w-4 h-4 inline-block mr-2" />
              XP Leaderboard
            </button>
            <button
              onClick={() => router.push('/feedback')}
              className="px-4 sm:px-6 py-3 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors whitespace-nowrap"
            >
              <MessageSquareHeart className="w-4 h-4 inline-block mr-2" />
              Feedback
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Welcome Section */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-4xl font-bold text-white mb-2 sm:mb-3">
            Course <span className="text-indigo-400">Curriculum</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-lg">
            Select a batch to view full curriculum
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative mb-6">
              <div className="w-24 h-24 rounded-full border-4 border-transparent border-t-indigo-500 border-r-purple-500 animate-spin" />
              <div className="absolute inset-2 w-[80px] h-[80px] rounded-full border-4 border-transparent border-b-violet-400 border-l-fuchsia-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/50 animate-pulse">
                  <List className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-400 rounded-full animate-bounce" />
              <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
            </div>
            <p className="text-slate-400">Loading your batches...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="max-w-md mx-auto">
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center">
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={fetchBatches}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && batches.length === 0 && (
          <div className="max-w-md mx-auto text-center py-20">
            <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <List className="w-10 h-10 text-slate-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No batches found</h3>
            <p className="text-slate-400 mb-6">
              You don&apos;t have any batches assigned yet. Please contact support.
            </p>
            <button
              onClick={fetchBatches}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        )}

        {/* Batch Grid */}
        {!loading && !error && batches.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <p className="text-slate-400 text-sm sm:text-base">
                <span className="text-white font-semibold">{batches.length}</span> batch{batches.length !== 1 ? 'es' : ''} enrolled
              </p>
              <button
                onClick={fetchBatches}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {batches.map((batch, index) => (
                <button
                  key={batch.enrollmentId}
                  onClick={() => handleSelectBatch(batch)}
                  className="group relative bg-gradient-to-b from-slate-800/50 to-slate-900/50 border border-white/5 hover:border-indigo-500/30 rounded-2xl p-5 sm:p-6 text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-indigo-500/10"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/0 to-indigo-500/0 group-hover:from-indigo-500/5 group-hover:to-transparent rounded-2xl transition-all duration-300" />
                  
                  <div className="relative">
                    {/* Icon */}
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <List className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-400" />
                    </div>

                    {/* Batch Name */}
                    <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                      {batch.batchName}
                    </h3>

                    {/* Enrollment ID */}
                    <p className="text-slate-500 text-xs font-mono mb-2">
                      ID: {batch.enrollmentId}
                    </p>

                    {/* Session Count */}
                    <p className="text-slate-400 text-sm mb-4">
                      {batch.sessionCount} class{batch.sessionCount !== 1 ? 'es' : ''} in curriculum
                    </p>

                    {/* Arrow */}
                    <div className="flex items-center text-indigo-400 text-sm font-medium">
                      <span>View Curriculum</span>
                      <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default function CurriculumPage() {
  return (
    <AuthWrapper>
      <CurriculumContent />
    </AuthWrapper>
  )
}

'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import AuthWrapper from '@/components/auth/AuthWrapper'
import { 
  MessageSquareHeart, Sparkles, Star, Send, ArrowLeft,
  LogOut, GraduationCap, Home, Calendar, Award, Trophy, Clapperboard
} from 'lucide-react'

function FeedbackPage() {
  const router = useRouter()
  const { user, signOut } = useAuth()

  const handleFeedbackClick = () => {
    window.open('https://mentiby-feedback.vercel.app/', '_blank')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-950/20 via-slate-950 to-purple-950/20" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-rose-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-pink-500/5 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/5 bg-slate-950/50 backdrop-blur-xl sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">
                  Menti<span className="text-emerald-400">BY</span>
                </h1>
                <p className="text-slate-500 text-xs sm:text-sm">Student Dashboard</p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden sm:block text-right">
                <p className="text-white font-medium text-sm">{user?.name || 'Student'}</p>
                <p className="text-slate-500 text-xs">{user?.cohortType} {user?.cohortNumber}</p>
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
              className="px-4 sm:px-6 py-3 text-sm font-medium text-rose-400 border-b-2 border-rose-400 bg-rose-500/5 whitespace-nowrap"
            >
              <MessageSquareHeart className="w-4 h-4 inline-block mr-2" />
              Feedback
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="text-center">
          {/* Floating Stars Animation */}
          <div className="relative mb-8">
            <div className="absolute -top-10 left-1/4 animate-bounce delay-100">
              <Star className="w-6 h-6 text-yellow-400/60" fill="currentColor" />
            </div>
            <div className="absolute -top-6 right-1/4 animate-bounce delay-300">
              <Star className="w-4 h-4 text-pink-400/60" fill="currentColor" />
            </div>
            <div className="absolute top-0 left-1/3 animate-bounce delay-500">
              <Sparkles className="w-5 h-5 text-purple-400/60" />
            </div>
            
            {/* Main Icon */}
            <div className="inline-flex items-center justify-center w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-rose-500/20 via-pink-500/20 to-purple-500/20 rounded-3xl border border-rose-500/20 shadow-2xl shadow-rose-500/20 mb-6">
              <MessageSquareHeart className="w-12 h-12 sm:w-16 sm:h-16 text-rose-400" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-3xl sm:text-5xl font-bold text-white mb-4">
            We Value Your{' '}
            <span className="bg-gradient-to-r from-rose-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Feedback
            </span>
          </h2>
          
          {/* Description */}
          <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
            Your thoughts help us create a better learning experience. 
            Share your feedback about mentors, sessions, and MentiBY overall.
          </p>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 max-w-3xl mx-auto">
            <div className="p-4 bg-slate-800/30 border border-white/5 rounded-xl">
              <div className="w-10 h-10 bg-rose-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Star className="w-5 h-5 text-rose-400" />
              </div>
              <p className="text-white font-medium text-sm">Rate Your Mentors</p>
              <p className="text-slate-500 text-xs mt-1">Teaching style & effectiveness</p>
            </div>
            <div className="p-4 bg-slate-800/30 border border-white/5 rounded-xl">
              <div className="w-10 h-10 bg-pink-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <MessageSquareHeart className="w-5 h-5 text-pink-400" />
              </div>
              <p className="text-white font-medium text-sm">Share Suggestions</p>
              <p className="text-slate-500 text-xs mt-1">Help us improve</p>
            </div>
            <div className="p-4 bg-slate-800/30 border border-white/5 rounded-xl">
              <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-white font-medium text-sm">Overall Experience</p>
              <p className="text-slate-500 text-xs mt-1">Rate MentiBY platform</p>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={handleFeedbackClick}
            className="group relative inline-flex items-center gap-3 px-8 sm:px-12 py-4 sm:py-5 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 hover:from-rose-400 hover:via-pink-400 hover:to-purple-400 text-white text-lg sm:text-xl font-bold rounded-2xl transition-all duration-300 shadow-2xl shadow-rose-500/30 hover:shadow-rose-500/50 hover:scale-105 active:scale-100"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-rose-400 via-pink-400 to-purple-400 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
            <span className="relative flex items-center gap-3">
              <Send className="w-5 h-5 sm:w-6 sm:h-6" />
              Submit Your Feedback
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
            </span>
          </button>

          <p className="text-slate-500 text-sm mt-6">
            Takes only 2-3 minutes ✨
          </p>
        </div>
      </main>
    </div>
  )
}

export default function FeedbackPageWrapper() {
  return (
    <AuthWrapper>
      <FeedbackPage />
    </AuthWrapper>
  )
}


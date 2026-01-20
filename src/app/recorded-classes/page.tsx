'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import AuthWrapper from '@/components/auth/AuthWrapper'
import { 
  Video, Sparkles, Clock, Rocket, ExternalLink,
  LogOut, GraduationCap, Home, Calendar, Award, Trophy, MessageSquareHeart,
  Play, Clapperboard, BookOpen, Layers
} from 'lucide-react'

function RecordedClassesPage() {
  const router = useRouter()
  const { user, signOut } = useAuth()

  const handleRedirect = () => {
    window.open('https://mentiby.com/user/dashboard', '_blank')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/20 via-slate-950 to-indigo-950/20" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-cyan-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
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
              className="px-4 sm:px-6 py-3 text-sm font-medium text-cyan-400 border-b-2 border-cyan-400 bg-cyan-500/5 whitespace-nowrap"
            >
              <Video className="w-4 h-4 inline-block mr-2" />
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
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="text-center">
          {/* Animated Elements */}
          <div className="relative mb-8">
            {/* Floating icons */}
            <div className="absolute -top-8 left-1/4 animate-bounce delay-100">
              <Play className="w-6 h-6 text-cyan-400/60" fill="currentColor" />
            </div>
            <div className="absolute -top-4 right-1/4 animate-bounce delay-300">
              <BookOpen className="w-5 h-5 text-indigo-400/60" />
            </div>
            <div className="absolute top-2 left-1/3 animate-bounce delay-500">
              <Sparkles className="w-4 h-4 text-blue-400/60" />
            </div>
            
            {/* Main Icon with glow */}
            <div className="relative inline-flex items-center justify-center">
              <div className="absolute inset-0 w-28 h-28 sm:w-36 sm:h-36 bg-gradient-to-br from-cyan-500/30 to-indigo-500/30 rounded-3xl blur-2xl animate-pulse" />
              <div className="relative w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-indigo-500/20 rounded-3xl border border-cyan-500/20 shadow-2xl shadow-cyan-500/20 flex items-center justify-center">
                <Clapperboard className="w-12 h-12 sm:w-16 sm:h-16 text-cyan-400" />
              </div>
            </div>
          </div>

          {/* Coming Soon Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 border border-cyan-500/20 rounded-full mb-6">
            <Clock className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="text-cyan-300 font-semibold text-sm tracking-wide uppercase">Coming Soon</span>
            <Rocket className="w-4 h-4 text-indigo-400" />
          </div>

          {/* Title */}
          <h2 className="text-3xl sm:text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Pre-Recorded Materials
            </span>
          </h2>
          
          {/* Description */}
          <p className="text-slate-400/80 text-sm sm:text-base max-w-xl mx-auto mb-8 leading-relaxed font-light tracking-wide">
            We&apos;re bringing all your pre-recorded learning materials here.
            <br className="hidden sm:block" />
            {/* Access curated content anytime, at your own pace. */}
          </p>

          {/* <p className="text-slate-500 text-base max-w-xl mx-auto mb-10">
            📚 Self-paced learning videos<br />
            🎯 Topic-wise organized content<br />
            ⏸️ Learn at your convenience
          </p> */}

          {/* Divider with text */}
          <div className="flex items-center gap-4 max-w-md mx-auto mb-8">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-700 to-slate-700" />
            <span className="text-slate-500 text-sm font-medium">Till then you can check it out here</span>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent via-slate-700 to-slate-700" />
          </div>

          {/* CTA Button */}
          <button
            onClick={handleRedirect}
            className="group relative inline-flex items-center gap-3 px-8 sm:px-12 py-4 sm:py-5 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 hover:from-cyan-400 hover:via-blue-400 hover:to-indigo-400 text-white text-lg sm:text-xl font-bold rounded-2xl transition-all duration-300 shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105 active:scale-100"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
            <span className="relative flex items-center gap-3">
              <Play className="w-5 h-5 sm:w-6 sm:h-6" />
              Open Content Dashboard
              <ExternalLink className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </span>
          </button>

          {/* <p className="text-slate-500 text-sm mt-6">
            Opens in a new tab • Access all pre-recorded content 🎬
          </p> */}

          {/* Coming soon teaser cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12 max-w-3xl mx-auto">
            <div className="p-4 bg-slate-800/30 border border-white/5 rounded-xl group hover:border-cyan-500/20 transition-colors">
              <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Play className="w-5 h-5 text-cyan-400" />
              </div>
              <p className="text-white font-medium text-sm">Self-Paced Learning</p>
              <p className="text-slate-500 text-xs mt-1">Watch anytime, anywhere</p>
            </div>
            <div className="p-4 bg-slate-800/30 border border-white/5 rounded-xl group hover:border-blue-500/20 transition-colors">
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Layers className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-white font-medium text-sm">Topic-wise Content</p>
              <p className="text-slate-500 text-xs mt-1">Structured learning paths</p>
            </div>
            <div className="p-4 bg-slate-800/30 border border-white/5 rounded-xl group hover:border-indigo-500/20 transition-colors">
              <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Sparkles className="w-5 h-5 text-indigo-400" />
              </div>
              <p className="text-white font-medium text-sm">Quality Content</p>
              <p className="text-slate-500 text-xs mt-1">Curated by experts</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function RecordedClassesPageWrapper() {
  return (
    <AuthWrapper>
      <RecordedClassesPage />
    </AuthWrapper>
  )
}

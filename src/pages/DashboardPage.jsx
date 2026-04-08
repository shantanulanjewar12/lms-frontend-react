import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen, TrendingUp, Award, Flame, Play, Plus, Users,
  IndianRupee, BarChart3, Star, CheckCircle, Clock, ArrowRight,
  Zap, Trophy, Target, Layers
} from 'lucide-react'
import { useAuthStore } from '../store'
import { enrollmentAPI, analyticsAPI, courseAPI, engagementAPI, paymentAPI } from '../api'
import { Badge, Progress, Button, Avatar, Skeleton, EmptyState } from '../components/ui/index'

function StatCard({ icon: Icon, label, value, sub, color = '#6366f1' }) {
  return (
    <div className="rounded-2xl p-5 relative overflow-hidden"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10"
        style={{ background: color, transform: 'translate(30%, -30%)', filter: 'blur(20px)' }} />
      <div className="flex items-start justify-between mb-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ background: `${color}20`, color }}>
          <Icon size={22} />
        </div>
      </div>
      <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: '1.9rem', color: 'var(--text-primary)', lineHeight: 1 }}>
        {value ?? <span className="skeleton inline-block w-16 h-7 rounded-lg" />}
      </p>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '0.3rem' }}>{label}</p>
      {sub && <p style={{ color, fontSize: '0.75rem', fontWeight: 600, marginTop: '0.4rem' }}>{sub}</p>}
    </div>
  )
}

function EnrollmentCard({ enrollment }) {
  const courseLabel = enrollment.courseTitle || enrollment.courseName || enrollment.title || (enrollment.courseId ? `Course #${enrollment.courseId}` : 'Course')

  return (
    <Link to={`/learn/${enrollment.courseId}`} className="block">
      <div className="card-hover p-4 rounded-2xl"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>
            <BookOpen size={20} color="white" />
          </div>
          <div className="flex-1 min-w-0">
            <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }} className="truncate">
              {courseLabel}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={enrollment.status === 'COMPLETED' ? 'success' : 'brand'} className="text-xs">
                {enrollment.status}
              </Badge>
            </div>
            <div className="mt-2">
              <div className="flex justify-between mb-1">
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Progress</span>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--brand)' }}>
                  {Math.round(enrollment.completionPercentage || 0)}%
                </span>
              </div>
              <Progress value={enrollment.completionPercentage || 0} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

// ── STUDENT DASHBOARD ──
function StudentDashboard({ user }) {
  const [enrollments, setEnrollments] = useState([])
  const [summary, setSummary] = useState(null)
  const [badges, setBadges] = useState([])
  const [streak, setStreak] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [enRes, sumRes, badgeRes, streakRes, lbRes] = await Promise.allSettled([
          enrollmentAPI.getMyEnrollments(),
          analyticsAPI.getStudentSummary(user.id),
          engagementAPI.getBadges(user.id),
          engagementAPI.getStreak(user.id),
          engagementAPI.getLeaderboard(),
        ])
        if (enRes.status === 'fulfilled') {
          const ordered = [...(enRes.value?.data || [])].sort((a, b) => {
            const aIncomplete = a.status !== 'COMPLETED'
            const bIncomplete = b.status !== 'COMPLETED'
            if (aIncomplete !== bIncomplete) return aIncomplete ? -1 : 1
            const aProgress = Number(a.completionPercentage || 0)
            const bProgress = Number(b.completionPercentage || 0)
            if (aProgress !== bProgress) return aProgress - bProgress
            const aTime = a.enrolledAt ? new Date(a.enrolledAt).getTime() : 0
            const bTime = b.enrolledAt ? new Date(b.enrolledAt).getTime() : 0
            return bTime - aTime
          })
          setEnrollments(ordered)
        }
        if (sumRes.status === 'fulfilled') setSummary(sumRes.value?.data)
        if (badgeRes.status === 'fulfilled') setBadges(badgeRes.value?.data || [])
        if (streakRes.status === 'fulfilled') setStreak(streakRes.value?.data)
        if (lbRes.status === 'fulfilled') setLeaderboard((lbRes.value?.data || []).slice(0, 5))
      } catch (e) { /* silent */ }
      finally { setLoading(false) }
    }
    load()
  }, [user.id])

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="rounded-3xl p-8 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)' }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem', fontFamily: 'Sora, sans-serif' }}>Good day,</p>
            <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: '1.8rem', color: 'white', letterSpacing: '-0.02em' }}>
              {user.fullName} 👋
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.75)', marginTop: '0.4rem', fontSize: '0.9rem' }}>
              Keep up the momentum — you're doing great!
            </p>
          </div>
          <div className="flex items-center gap-3 px-5 py-3 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)' }}>
            <Flame size={28} style={{ color: '#fb923c' }} />
            <div>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.72rem' }}>Current Streak</p>
              <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: '1.6rem', color: 'white' }}>
                {streak?.currentStreak ?? 0} <span style={{ fontSize: '0.9rem' }}>days</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={BookOpen} label="Enrolled Courses" value={summary?.totalEnrolled ?? '—'} color="#6366f1" />
        <StatCard icon={CheckCircle} label="Completed" value={summary?.totalCompleted ?? '—'} color="#10b981" />
        <StatCard icon={TrendingUp} label="Avg Completion" value={summary?.averageCompletionPercent ? `${Math.round(summary.averageCompletionPercent)}%` : '—'} color="#f97316" />
        <StatCard icon={Award} label="Badges Earned" value={badges.length} color="#8b5cf6" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* My Courses */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.2rem', color: 'var(--text-primary)' }}>My Learning</h3>
            <Link to="/my-learning">
              <button className="text-sm font-semibold flex items-center gap-1 transition-colors"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brand)', fontFamily: 'Sora, sans-serif' }}>
                View All <ArrowRight size={14} />
              </button>
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>
          ) : enrollments.length === 0 ? (
            <EmptyState icon="📚" title="No enrollments yet"
              description="Browse and enroll in your first course"
              action={<Link to="/courses"><Button variant="primary" size="sm">Browse Courses</Button></Link>}
            />
          ) : (
            <div className="space-y-3">
              {enrollments.slice(0, 4).map(e => <EnrollmentCard key={e.id} enrollment={e} />)}
            </div>
          )}
        </div>

        {/* Badges & Leaderboard */}
        <div className="space-y-6">
          {/* Badges */}
          <div className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <h3 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>
              🏅 My Badges
            </h3>
            {badges.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' }}>Complete courses to earn badges!</p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {badges.slice(0, 4).map(b => (
                  <div key={b.id} className="p-3 rounded-xl text-center"
                    style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
                    <div className="text-2xl mb-1">
                      {b.badgeType === 'FIRST_LESSON' ? '🌟' : b.badgeType === 'COURSE_COMPLETE' ? '🏆' : b.badgeType === 'STREAK_7' ? '🔥' : '👑'}
                    </div>
                    <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Sora, sans-serif' }}>{b.badgeLabel}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Leaderboard */}
          <div className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <h3 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>
              🏆 Leaderboard
            </h3>
            <div className="space-y-2">
              {leaderboard.map((l, i) => (
                <div key={l.studentId} className="flex items-center gap-3 p-2 rounded-xl"
                  style={{ background: i === 0 ? 'rgba(249,115,22,0.08)' : 'transparent' }}>
                  <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: '0.9rem', color: i === 0 ? '#f97316' : 'var(--text-muted)', minWidth: '20px' }}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                  </span>
                  <Avatar name={l.studentName || `User ${l.studentId}`} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }} className="truncate">
                      {l.studentName || `Learner #${l.studentId}`}
                    </p>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{l.currentStreak} day streak</p>
                  </div>
                </div>
              ))}
              {leaderboard.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>No data yet</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── INSTRUCTOR DASHBOARD ──
function InstructorDashboard({ user }) {
  const [courses, setCourses] = useState([])
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [cRes, iRes] = await Promise.allSettled([
          courseAPI.getMine(`?size=20`),
          analyticsAPI.getInstructorInsights(user.id),
        ])
        if (cRes.status === 'fulfilled') {
          const all = cRes.value?.data?.content || cRes.value?.data || []
          setCourses(all)
        }
        if (iRes.status === 'fulfilled') setInsights(iRes.value?.data)
      } catch (e) { /* silent */ }
      finally { setLoading(false) }
    }
    load()
  }, [user.id])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: '1.8rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Instructor Studio
          </h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Manage your courses and track performance</p>
        </div>
        <Link to="/instructor/courses/new">
          <Button variant="primary" icon={<Plus size={16} />}>New Course</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Layers} label="Total Courses" value={insights?.totalCourses ?? courses.length} color="#6366f1" />
        <StatCard icon={Users} label="Total Students" value={insights?.totalStudents ?? '—'} color="#10b981" />
        <StatCard icon={Star} label="Avg Rating" value={insights?.averageRating ? `${insights.averageRating.toFixed(1)}★` : '—'} color="#f59e0b" />
        <StatCard icon={TrendingUp} label="Completion Rate" value={insights?.avgCompletionRate ? `${Math.round(insights.avgCompletionRate)}%` : '—'} color="#8b5cf6" />
      </div>

      {/* Courses table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>My Courses</h3>
          <Link to="/instructor/courses">
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brand)', fontSize: '0.85rem', fontWeight: 600, fontFamily: 'Sora, sans-serif' }}>
              View All →
            </button>
          </Link>
        </div>
        {loading ? (
          <div className="p-6 space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
        ) : courses.length === 0 ? (
          <div className="p-12 text-center">
            <p style={{ color: 'var(--text-muted)' }}>No courses yet.</p>
            <Link to="/instructor/courses/new">
              <Button variant="primary" size="sm" className="mt-4">Create your first course</Button>
            </Link>
          </div>
        ) : (
          <div>
            {courses.slice(0, 5).map((course, i) => (
              <div key={course.id} className="flex items-center gap-4 px-6 py-4"
                style={{ borderBottom: i < courses.length - 1 ? '1px solid var(--border)' : 'none', background: i % 2 === 0 ? 'transparent' : 'var(--bg-secondary)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                  <BookOpen size={18} color="white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }} className="truncate">{course.title}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{course.totalLessons || 0} lessons · {course.category || 'No category'}</p>
                </div>
                <Badge variant={course.status === 'PUBLISHED' ? 'success' : course.status === 'DRAFT' ? 'warning' : 'gray'}>
                  {course.status}
                </Badge>
                <Link to={`/instructor/courses/${course.id}/edit`}>
                  <button style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: '10px', padding: '6px 14px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, color: 'var(--brand)', fontFamily: 'Sora, sans-serif' }}>
                    Manage
                  </button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── ADMIN DASHBOARD ──
function AdminDashboard({ user }) {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    paymentAPI.getAllAdmin(0)
      .then(r => setTransactions(r?.data?.content || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: '1.8rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Admin Control Center
        </h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Platform overview and management</p>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { to: '/admin/users', icon: Users, label: 'Manage Users', color: '#6366f1' },
          { to: '/courses', icon: BookOpen, label: 'All Courses', color: '#10b981' },
          { to: '/admin/payments', icon: IndianRupee, label: 'Payments', color: '#f97316' },
          { to: '/admin/analytics', icon: BarChart3, label: 'Analytics', color: '#8b5cf6' },
        ].map(({ to, icon: Icon, label, color }) => (
          <Link key={to} to={to}>
            <div className="card-hover p-5 rounded-2xl text-center"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
                style={{ background: `${color}20`, color }}>
                <Icon size={24} />
              </div>
              <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Transactions */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>Recent Transactions</h3>
        </div>
        {loading ? (
          <div className="p-6 space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : transactions.length === 0 ? (
          <p className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>No transactions yet</p>
        ) : (
          <div>
            {transactions.slice(0, 8).map((t, i) => (
              <div key={t.id} className="flex items-center gap-4 px-6 py-3.5"
                style={{ borderBottom: i < transactions.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: t.status === 'SUCCESS' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.1)', color: t.status === 'SUCCESS' ? '#10b981' : '#ef4444' }}>
                  <IndianRupee size={16} />
                </div>
                <div className="flex-1">
                  <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                    {t.courseTitle || (t.courseId ? `Course #${t.courseId}` : 'Course')}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {t.studentName || (t.studentId ? `Student #${t.studentId}` : 'Student')}
                  </p>
                </div>
                <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: 'var(--text-primary)' }}>₹{t.amount}</p>
                <Badge variant={t.status === 'SUCCESS' ? 'success' : t.status === 'PENDING' ? 'warning' : 'danger'}>
                  {t.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuthStore()

  if (!user) return null

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', paddingTop: '80px' }}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {user.role === 'STUDENT' && <StudentDashboard user={user} />}
        {user.role === 'INSTRUCTOR' && <InstructorDashboard user={user} />}
        {user.role === 'ADMIN' && <AdminDashboard user={user} />}
      </div>
    </div>
  )
}

import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  TrendingUp, BookOpen, CheckCircle, Flame, Target, BarChart3,
  ArrowRight, Zap, Users, Star, Clock, AlertTriangle, Activity
} from 'lucide-react'
import { analyticsAPI, engagementAPI, courseAPI, userAPI, paymentAPI } from '../api'
import { useAuthStore } from '../store'
import { Badge, Progress, Skeleton, Button, EmptyState } from '../components/ui/index'
import toast from 'react-hot-toast'

// ──────────────────────────────────────────
// Student Analytics Page
// ──────────────────────────────────────────
export function StudentAnalyticsPage() {
  const { user } = useAuthStore()
  const [summary, setSummary] = useState(null)
  const [badges, setBadges] = useState([])
  const [streak, setStreak] = useState(null)
  const [learningPath, setLearningPath] = useState(null)
  const [recommendedCourses, setRecommendedCourses] = useState([])
  const [goal, setGoal] = useState('')
  const [loadingPath, setLoadingPath] = useState(false)
  const [loading, setLoading] = useState(true)

  const GOALS = ['Backend Developer', 'Frontend Developer', 'Data Scientist', 'DevOps Engineer', 'UI/UX Designer', 'Mobile Developer']

  useEffect(() => {
    const load = async () => {
      try {
        const [sumRes, badgeRes, streakRes] = await Promise.allSettled([
          analyticsAPI.getStudentSummary(user.id),
          engagementAPI.getBadges(user.id),
          engagementAPI.getStreak(user.id),
        ])
        if (sumRes.status === 'fulfilled') setSummary(sumRes.value?.data)
        if (badgeRes.status === 'fulfilled') setBadges(badgeRes.value?.data || [])
        if (streakRes.status === 'fulfilled') setStreak(streakRes.value?.data)
      } catch (e) { /* silent */ }
      finally { setLoading(false) }
    }
    load()
  }, [user.id])

  const fetchLearningPath = async () => {
    if (!goal) { toast.error('Select a goal first'); return }
    setLoadingPath(true)
    try {
      const res = await analyticsAPI.getLearningPath(goal)
      const path = res?.data
      setLearningPath(path)

      const ids = path?.recommendedCourseIds || []
      if (ids.length === 0) {
        setRecommendedCourses([])
      } else {
        const detailSettled = await Promise.allSettled(ids.map(id => courseAPI.getById(id)))
        const courses = detailSettled
          .map((r, idx) => {
            if (r.status !== 'fulfilled') return null
            return {
              id: ids[idx],
              title: r.value?.data?.title || `Course #${ids[idx]}`,
            }
          })
          .filter(Boolean)
        setRecommendedCourses(courses)
      }
    } catch (e) { toast.error('Could not fetch learning path') }
    finally { setLoadingPath(false) }
  }

  const badgeEmojis = { FIRST_LESSON: '🌟', COURSE_COMPLETE: '🏆', STREAK_7: '🔥', TOP_LEARNER: '👑' }

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', paddingTop: '80px' }}>
      {/* Header */}
      <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-6xl mx-auto px-6 py-10">
          <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: '2.2rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            My Analytics
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.4rem' }}>Track your learning progress and achievements</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Courses Enrolled', value: summary?.totalEnrolled, icon: BookOpen, color: '#6366f1' },
            { label: 'Completed', value: summary?.totalCompleted, icon: CheckCircle, color: '#10b981' },
            { label: 'Avg Completion', value: summary?.averageCompletionPercent ? `${Math.round(summary.averageCompletionPercent)}%` : '—', icon: TrendingUp, color: '#f97316' },
            { label: 'Day Streak', value: streak?.currentStreak ?? 0, icon: Flame, color: '#ec4899' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl p-5 relative overflow-hidden"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-10"
                style={{ background: s.color, transform: 'translate(30%,-30%)', filter: 'blur(20px)' }} />
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: `${s.color}20`, color: s.color }}>
                <s.icon size={20} />
              </div>
              {loading
                ? <div className="skeleton h-8 w-16 rounded-lg" />
                : <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: '1.8rem', color: 'var(--text-primary)', lineHeight: 1 }}>{s.value ?? '—'}</p>
              }
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Streak Details */}
          <div className="rounded-2xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
              🔥 Learning Streak
            </h2>
            {loading ? <Skeleton className="h-28" /> : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
                  <div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Streak</p>
                    <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: '2.5rem', color: '#f97316', lineHeight: 1 }}>
                      {streak?.currentStreak ?? 0} <span style={{ fontSize: '1rem' }}>days</span>
                    </p>
                  </div>
                  <span style={{ fontSize: '3rem' }}>🔥</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
                  <div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Longest Streak</p>
                    <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: '2.5rem', color: '#6366f1', lineHeight: 1 }}>
                      {streak?.longestStreak ?? 0} <span style={{ fontSize: '1rem' }}>days</span>
                    </p>
                  </div>
                  <span style={{ fontSize: '3rem' }}>🏅</span>
                </div>
                {streak?.lastActiveDate && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                    Last active: {new Date(streak.lastActiveDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Badges */}
          <div className="rounded-2xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                🏅 My Badges
              </h2>
              <Badge variant="brand">{badges.length} earned</Badge>
            </div>
            {loading ? <Skeleton className="h-28" /> : badges.length === 0 ? (
              <div className="text-center py-8">
                <p style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎖️</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Complete courses to earn badges!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {badges.map(b => (
                  <div key={b.id} className="p-4 rounded-xl text-center"
                    style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>{badgeEmojis[b.badgeType] || '🎖️'}</div>
                    <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-primary)' }}>{b.badgeLabel}</p>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{b.badgeDescription}</p>
                    <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                      {new Date(b.awardedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Learning Path Generator */}
        <div className="rounded-2xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.15)', color: '#6366f1' }}>
              <Target size={20} />
            </div>
            <div>
              <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                AI Learning Path
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Get a personalised course roadmap for your career goal</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-5 mb-4">
            {GOALS.map(g => (
              <button key={g} onClick={() => setGoal(g)}
                className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: goal === g ? 'var(--brand)' : 'var(--bg-secondary)',
                  color: goal === g ? 'white' : 'var(--text-secondary)',
                  border: `1.5px solid ${goal === g ? 'var(--brand)' : 'var(--border)'}`,
                  cursor: 'pointer',
                  fontFamily: 'Sora, sans-serif',
                }}>
                {g}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Button variant="primary" loading={loadingPath} onClick={fetchLearningPath} icon={<Zap size={15} />}>
              Build My Professional Path
            </Button>
            {!!goal && <Badge variant="brand">Goal: {goal}</Badge>}
          </div>

          {learningPath && (
            <div className="mt-6 p-6 rounded-2xl animate-fade-up"
              style={{
                background: 'linear-gradient(135deg, rgba(99,102,241,0.10) 0%, rgba(236,72,153,0.08) 100%)',
                border: '1px solid var(--border)',
              }}>
              <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                <div>
                  <h3 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: '1.15rem', color: 'var(--text-primary)' }}>
                    Career Path: {learningPath.goalTitle}
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '0.3rem', maxWidth: '650px' }}>
                    {learningPath.description}
                  </p>
                </div>
                <Badge variant="success">{learningPath.recommendedCourseIds?.length || 0} curated steps</Badge>
              </div>

              {learningPath.recommendedCourseIds?.length > 0 ? (
                <div className="space-y-3">
                  {(recommendedCourses.length > 0 ? recommendedCourses : learningPath.recommendedCourseIds.map(id => ({ id, title: `Course #${id}` }))).map((course, i) => (
                    <Link key={course.id} to={`/courses/${course.id}`} className="block">
                      <div className="rounded-xl p-3 flex items-center gap-3 transition-all card-hover"
                        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ background: 'var(--brand)', color: 'white', fontWeight: 800, fontFamily: 'Sora, sans-serif', fontSize: '0.8rem' }}>
                          {i + 1}
                        </div>
                        <div className="flex-1">
                          <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{course.title}</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Recommended milestone step</p>
                        </div>
                        <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Enroll in more courses and revisit for personalized recommendations.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────
// Instructor Analytics Page
// ──────────────────────────────────────────
export function InstructorAnalyticsPage() {
  const { user } = useAuthStore()
  const [insights, setInsights] = useState(null)
  const [courses, setCourses] = useState([])
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [courseQuery, setCourseQuery] = useState('')
  const [difficulty, setDifficulty] = useState([])
  const [engagement, setEngagement] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingCourse, setLoadingCourse] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const insRes = await analyticsAPI.getInstructorInsights(user.id)
        setInsights(insRes?.data)
        // Always use instructor-specific endpoint to avoid missing instructorId in public payloads
        const cRes = await courseAPI.getMine('?size=100')
        const mine = cRes?.data?.content || cRes?.data || []
        setCourses(mine)
        if (mine.length > 0) await selectCourse(mine[0].id)
      } catch (e) { /* silent */ }
      finally { setLoading(false) }
    }
    load()
  }, [user.id])

  const selectCourse = async (courseId) => {
    setSelectedCourse(courseId)
    setLoadingCourse(true)
    try {
      const [diffRes, engRes] = await Promise.allSettled([
        analyticsAPI.getCourseDifficulty(courseId),
        analyticsAPI.getCourseEngagement(courseId),
      ])
      if (diffRes.status === 'fulfilled') setDifficulty(diffRes.value?.data || [])
      if (engRes.status === 'fulfilled') setEngagement(engRes.value?.data)
    } catch (e) { /* silent */ }
    finally { setLoadingCourse(false) }
  }

  const difficultyColor = { EASY: '#10b981', MEDIUM: '#f59e0b', DIFFICULT: '#ef4444' }
  const difficultyBadge = { EASY: 'success', MEDIUM: 'warning', DIFFICULT: 'danger' }
  const hardestLesson = difficulty.length
    ? [...difficulty].sort((a, b) => (b.difficultyScore || 0) - (a.difficultyScore || 0))[0]
    : null
  const filteredCourses = courses.filter(c =>
    !courseQuery || c.title?.toLowerCase().includes(courseQuery.toLowerCase())
  )
  const selectedCourseObj = courses.find(c => c.id === selectedCourse)
  const watchSeconds = engagement?.averageWatchTimeSeconds || 0
  const watchMinutesLabel = watchSeconds <= 0
    ? '0 min'
    : watchSeconds < 60
      ? '<1 min'
      : `${(watchSeconds / 60).toFixed(1)} min`

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', paddingTop: '80px' }}>
      <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-6xl mx-auto px-6 py-10">
          <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: '2.2rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Instructor Analytics
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.4rem' }}>Understand how students engage with your content</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Overall Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Courses', value: insights?.totalCourses, icon: BookOpen, color: '#6366f1' },
            { label: 'Total Students', value: insights?.totalStudents, icon: Users, color: '#10b981' },
            { label: 'Average Rating', value: insights?.averageRating ? `${insights.averageRating.toFixed(1)}★` : '—', icon: Star, color: '#f59e0b' },
            { label: 'Avg Completion', value: insights?.avgCompletionRate ? `${Math.round(insights.avgCompletionRate)}%` : '—', icon: TrendingUp, color: '#8b5cf6' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl p-5 relative overflow-hidden"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${s.color}20`, color: s.color }}>
                <s.icon size={20} />
              </div>
              <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: '1.8rem', color: 'var(--text-primary)', lineHeight: 1 }}>
                {loading ? <span className="skeleton inline-block w-16 h-7 rounded-lg" /> : (s.value ?? '—')}
              </p>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Course selector */}
        {courses.length > 0 && (
          <div className="rounded-2xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: 'var(--text-primary)' }}>Course Scope</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{courses.length} total courses</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  value={courseQuery}
                  onChange={e => setCourseQuery(e.target.value)}
                  placeholder="Search course..."
                  className="input-field px-3 py-2 rounded-xl text-sm"
                  style={{ minWidth: '220px' }}
                />
                <select
                  value={selectedCourse || ''}
                  onChange={(e) => selectCourse(Number(e.target.value))}
                  className="input-field px-3 py-2 rounded-xl text-sm"
                  style={{ minWidth: '280px', fontFamily: 'Sora, sans-serif' }}
                >
                  {filteredCourses.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>
            </div>
            {selectedCourseObj && (
              <div className="mt-3 px-3 py-2 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Selected</p>
                <p style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{selectedCourseObj.title}</p>
              </div>
            )}
          </div>
        )}

        {!loading && courses.length === 0 && (
          <div className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              No instructor courses were found for analytics. Create or publish a course, then refresh this page.
            </p>
          </div>
        )}

        {selectedCourse && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Engagement */}
            <div className="rounded-2xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <h3 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
                📈 Course Engagement
              </h3>
              {loadingCourse ? <Skeleton className="h-36" /> : engagement ? (
                <div className="space-y-4">
                  {[
                    { label: 'Total Enrollments', value: engagement.totalEnrollments, icon: Users },
                    { label: 'Completion Rate', value: `${Math.round(engagement.completionRate || 0)}%`, icon: CheckCircle },
                    { label: 'Avg Watch Time', value: watchMinutesLabel, icon: Clock },
                  ].map(m => (
                    <div key={m.label} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
                      <m.icon size={18} style={{ color: 'var(--brand)' }} />
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{m.label}</span>
                      <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: 'var(--text-primary)', marginLeft: 'auto' }}>{m.value}</span>
                    </div>
                  ))}
                  {engagement.dropOffLessonId && (
                    <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                      <AlertTriangle size={16} style={{ color: '#ef4444' }} />
                      <p style={{ fontSize: '0.82rem', color: '#ef4444' }}>
                        High drop-off at Lesson #{engagement.dropOffLessonId} — consider revising it
                      </p>
                    </div>
                  )}
                </div>
              ) : <p style={{ color: 'var(--text-muted)' }}>No engagement data yet</p>}
            </div>

            {/* Lesson Difficulty */}
            <div className="rounded-2xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <h3 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
                🧩 Lesson Difficulty
              </h3>
              {!loadingCourse && hardestLesson && (
                <div className="mb-4 p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <p style={{ fontSize: '0.78rem', color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}>
                    Hardest Lesson Right Now
                  </p>
                  <div className="flex items-center justify-between gap-3 mt-1">
                    <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }} className="truncate">
                      {hardestLesson.lessonTitle}
                    </p>
                    <Badge variant={difficultyBadge[hardestLesson.difficultyLevel] || 'danger'}>
                      {(hardestLesson.difficultyScore * 100).toFixed(0)}%
                    </Badge>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                    Relative rank in this course. Absolute level is shown in the lesson list below.
                  </p>
                </div>
              )}
              {loadingCourse ? <Skeleton className="h-36" /> : difficulty.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No data yet — students need to interact with lessons first.</p>
              ) : (
                <div className="space-y-3 max-h-72 overflow-y-auto">
                  {difficulty.map(d => (
                    <div key={d.lessonId} className="p-3 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
                      <div className="flex items-center justify-between mb-2">
                        <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }} className="truncate">{d.lessonTitle}</p>
                        {hardestLesson?.lessonId === d.lessonId ? (
                          <Badge variant="danger">HARDEST</Badge>
                        ) : (
                          <Badge variant={difficultyBadge[d.difficultyLevel] || 'gray'}>{d.difficultyLevel}</Badge>
                        )}
                      </div>
                      <div className="flex gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                        <span>Quiz fail: {(d.quizFailureRate * 100).toFixed(0)}%</span>
                        <span>Rewind: {(d.rewindRate * 100).toFixed(0)}%</span>
                        <span>Drop-off: {(d.dropOffRate * 100).toFixed(0)}%</span>
                      </div>
                      {hardestLesson?.lessonId === d.lessonId && (
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                          Level: {d.difficultyLevel}
                        </p>
                      )}
                      <div style={{ height: 4, borderRadius: 2, background: 'var(--bg-primary)', marginTop: '0.5rem' }}>
                        <div style={{ height: '100%', width: `${(d.difficultyScore || 0) * 100}%`, borderRadius: 2, background: difficultyColor[d.difficultyLevel] || '#6366f1', transition: 'width 0.6s ease' }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ──────────────────────────────────────────
// Admin Analytics Page
// ──────────────────────────────────────────
export function AdminAnalyticsPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Aggregate from multiple endpoints
    const load = async () => {
      try {
        const [uRes, cRes, pRes] = await Promise.allSettled([
          userAPI.getAllUsers(0, 100),
          courseAPI.getAll('?size=100'),
          paymentAPI.getAllAdmin(0),
        ])
        const users = uRes.status === 'fulfilled' ? (uRes.value?.data?.content || uRes.value?.data || []) : []
        const courses = cRes.status === 'fulfilled' ? (cRes.value?.data?.content || cRes.value?.data || []) : []
        const payments = pRes.status === 'fulfilled' ? (pRes.value?.data?.content || pRes.value?.data || []) : []
        const revenue = payments.filter(p => p.status === 'SUCCESS').reduce((s, p) => s + (p.amount || 0), 0)
        setStats({
          totalUsers: users.length,
          students: users.filter(u => u.role === 'STUDENT').length,
          instructors: users.filter(u => u.role === 'INSTRUCTOR').length,
          totalCourses: courses.length,
          publishedCourses: courses.filter(c => c.status === 'PUBLISHED').length,
          revenue,
          transactions: payments.length,
          successfulPayments: payments.filter(p => p.status === 'SUCCESS').length,
        })
      } catch (e) { /* silent */ }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const tiles = stats ? [
    { label: 'Total Users', value: stats.totalUsers, sub: `${stats.students} students · ${stats.instructors} instructors`, icon: Users, color: '#6366f1' },
    { label: 'Total Courses', value: stats.totalCourses, sub: `${stats.publishedCourses} courses published`, icon: BookOpen, color: '#10b981' },
    { label: 'Total Revenue', value: `₹${stats.revenue.toFixed(0)}`, sub: `${stats.successfulPayments} successful payments`, icon: Activity, color: '#f97316' },
    { label: 'Transactions', value: stats.transactions, sub: `${stats.successfulPayments} completed`, icon: BarChart3, color: '#8b5cf6' },
  ] : []

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', paddingTop: '80px' }}>
      <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-6xl mx-auto px-6 py-10">
          <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: '2.2rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Platform Analytics
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.4rem' }}>Complete overview of platform performance</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-36" />)}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {tiles.map(t => (
                <div key={t.label} className="rounded-2xl p-5 relative overflow-hidden"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                  <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10"
                    style={{ background: t.color, transform: 'translate(30%,-30%)', filter: 'blur(20px)' }} />
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${t.color}20`, color: t.color }}>
                    <t.icon size={20} />
                  </div>
                  <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: '1.8rem', color: 'var(--text-primary)', lineHeight: 1 }}>{t.value}</p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>{t.label}</p>
                  {t.sub && <p style={{ fontSize: '0.72rem', color: t.color, marginTop: '0.3rem', fontWeight: 600 }}>{t.sub}</p>}
                </div>
              ))}
            </div>

            {/* Quick links to admin actions */}
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { to: '/admin/users', label: 'Manage Users', desc: 'View, suspend, or delete accounts', icon: Users, color: '#6366f1' },
                { to: '/admin/payments', label: 'Transactions', desc: 'Review all payment records', icon: Activity, color: '#10b981' },
                { to: '/courses', label: 'All Courses', desc: 'Browse and manage course catalogue', icon: BookOpen, color: '#f97316' },
              ].map(l => (
                <Link key={l.to} to={l.to}>
                  <div className="card-hover p-5 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${l.color}20`, color: l.color }}>
                      <l.icon size={20} />
                    </div>
                    <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{l.label}</p>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{l.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

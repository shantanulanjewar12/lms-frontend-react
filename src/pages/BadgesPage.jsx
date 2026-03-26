import React, { useState, useEffect } from 'react'
import { Award, Flame, Calendar, Trophy, Star } from 'lucide-react'
import { engagementAPI } from '../api'
import { useAuthStore } from '../store'
import { Badge, Skeleton } from '../components/ui/index'

const BADGE_META = {
  FIRST_LESSON:    { emoji: '🌟', label: 'First Step',       desc: 'Completed your very first lesson',         color: '#f59e0b', bg: '#fef3c7' },
  COURSE_COMPLETE: { emoji: '🏆', label: 'Course Champion',  desc: 'Finished an entire course',                color: '#6366f1', bg: '#ede9fe' },
  STREAK_7:        { emoji: '🔥', label: '7-Day Streak',     desc: 'Learned for 7 consecutive days',           color: '#f97316', bg: '#ffedd5' },
  TOP_LEARNER:     { emoji: '👑', label: 'Top Learner',       desc: 'Ranked among top performers on the platform', color: '#ec4899', bg: '#fce7f3' },
}

const ALL_BADGES = Object.keys(BADGE_META)

export default function BadgesPage() {
  const { user } = useAuthStore()
  const [badges, setBadges] = useState([])
  const [streak, setStreak] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([
      engagementAPI.getBadges(user.id),
      engagementAPI.getStreak(user.id),
    ]).then(([bRes, sRes]) => {
      if (bRes.status === 'fulfilled') setBadges(bRes.value?.data || [])
      if (sRes.status === 'fulfilled') setStreak(sRes.value?.data)
    }).finally(() => setLoading(false))
  }, [user.id])

  const earnedTypes = new Set(badges.map(b => b.badgeType))

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', paddingTop: '80px' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4c1d95 100%)' }}>
        <div className="max-w-4xl mx-auto px-6 py-14 text-center">
          <div className="text-5xl mb-4">🏅</div>
          <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: '2.5rem', color: 'white', letterSpacing: '-0.03em' }}>
            Achievements
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: '0.5rem' }}>
            {badges.length} of {ALL_BADGES.length} badges earned
          </p>
          {/* Progress bar */}
          <div className="max-w-xs mx-auto mt-5">
            <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.2)' }}>
              <div style={{
                height: '100%', borderRadius: 4,
                width: `${(badges.length / ALL_BADGES.length) * 100}%`,
                background: 'white',
                transition: 'width 0.8s ease',
              }} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-10">
        {/* Streak Card */}
        {!loading && streak && (
          <div className="rounded-2xl p-6"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
              🔥 Learning Streak
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Current Streak', value: streak.currentStreak ?? 0, unit: 'days', icon: Flame, color: '#f97316' },
                { label: 'Longest Streak', value: streak.longestStreak ?? 0, unit: 'days', icon: Trophy, color: '#6366f1' },
                { label: 'Last Active', value: streak.lastActiveDate ? new Date(streak.lastActiveDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'N/A', unit: '', icon: Calendar, color: '#10b981' },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-4 p-4 rounded-xl"
                  style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${s.color}20`, color: s.color }}>
                    <s.icon size={22} />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</p>
                    <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: '1.6rem', color: s.color, lineHeight: 1 }}>
                      {s.value}{s.unit && <span style={{ fontSize: '0.9rem' }}> {s.unit}</span>}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Badges Grid */}
        <div>
          <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
            All Badges
          </h2>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-48" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {ALL_BADGES.map(type => {
                const meta = BADGE_META[type]
                const earned = earnedTypes.has(type)
                const earnedBadge = badges.find(b => b.badgeType === type)
                return (
                  <div key={type}
                    className={`rounded-2xl p-5 text-center transition-all ${earned ? 'card-hover' : ''}`}
                    style={{
                      background: earned ? 'var(--bg-card)' : 'var(--bg-secondary)',
                      border: `2px solid ${earned ? meta.color + '40' : 'var(--border)'}`,
                      opacity: earned ? 1 : 0.55,
                      boxShadow: earned ? `0 4px 20px ${meta.color}20` : 'none',
                    }}>
                    <div style={{
                      fontSize: '3rem', marginBottom: '0.75rem',
                      filter: earned ? 'none' : 'grayscale(100%)',
                    }}>
                      {meta.emoji}
                    </div>
                    <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '0.9rem', color: earned ? 'var(--text-primary)' : 'var(--text-muted)', marginBottom: '0.4rem' }}>
                      {meta.label}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                      {meta.desc}
                    </p>
                    {earned ? (
                      <div className="mt-3">
                        <span className="badge" style={{ background: `${meta.color}20`, color: meta.color }}>
                          EARNED
                        </span>
                        {earnedBadge?.awardedAt && (
                          <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                            {new Date(earnedBadge.awardedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="mt-3">
                        <span className="badge" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>LOCKED</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Tips to earn more */}
        <div className="rounded-2xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>
            💡 How to earn badges
          </h2>
          <div className="space-y-2">
            {[
              { emoji: '🌟', text: 'Complete your first lesson in any course' },
              { emoji: '🏆', text: 'Finish all lessons in a course (100% completion)' },
              { emoji: '🔥', text: 'Log in and learn for 7 consecutive days' },
              { emoji: '👑', text: 'Rank in the top 10 on the leaderboard' },
            ].map(tip => (
              <div key={tip.text} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
                <span style={{ fontSize: '1.2rem' }}>{tip.emoji}</span>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{tip.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

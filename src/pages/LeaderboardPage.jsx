import React, { useState, useEffect } from 'react'
import { Trophy, Flame, Award, Crown } from 'lucide-react'
import { engagementAPI } from '../api'
import { Avatar, Badge, Skeleton } from '../components/ui/index'
import { useAuthStore } from '../store'

export default function LeaderboardPage() {
  const { user } = useAuthStore()
  const [leaders, setLeaders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    engagementAPI.getLeaderboard()
      .then(r => setLeaders(r?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const podiumColors = ['#f59e0b', '#9ca3af', '#cd7c2f']
  const podiumEmojis = ['🥇', '🥈', '🥉']

  const top3 = leaders.slice(0, 3)
  const rest = leaders.slice(3)

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', paddingTop: '80px' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4c1d95 100%)', paddingBottom: '4rem' }}>
        <div className="max-w-3xl mx-auto px-6 py-12 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(255,255,255,0.15)' }}>
            <Trophy size={28} color="white" />
          </div>
          <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: '2.5rem', color: 'white', letterSpacing: '-0.03em' }}>
            Leaderboard
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: '0.5rem' }}>
            Top learners on the platform this month
          </p>
        </div>

        {/* Podium — top 3 */}
        {!loading && top3.length > 0 && (
          <div className="max-w-xl mx-auto px-6">
            <div className="flex items-end justify-center gap-4">
              {[top3[1], top3[0], top3[2]].filter(Boolean).map((leader, displayIdx) => {
                const actualRank = displayIdx === 0 ? 2 : displayIdx === 1 ? 1 : 3
                const heights = { 1: 'pt-0', 2: 'pt-6', 3: 'pt-10' }
                return (
                  <div key={leader.studentId} className={`flex flex-col items-center ${heights[actualRank]}`}>
                    <div style={{ fontSize: '1.8rem', marginBottom: '0.25rem' }}>{podiumEmojis[actualRank - 1]}</div>
                    <Avatar name={leader.studentName || `User ${leader.studentId}`} size={actualRank === 1 ? 'lg' : 'md'} />
                    <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '0.85rem', color: 'white', marginTop: '0.5rem', textAlign: 'center' }}>
                      {leader.studentName?.split(' ')[0] || `User ${leader.studentId}`}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <Flame size={12} style={{ color: '#fb923c' }} />
                      <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.8)' }}>{leader.currentStreak}d</span>
                    </div>
                    <div className="mt-2 px-3 py-1 rounded-full text-xs font-bold"
                      style={{ background: podiumColors[actualRank - 1] + '30', color: podiumColors[actualRank - 1], border: `1px solid ${podiumColors[actualRank - 1]}50` }}>
                      #{actualRank}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Full Rankings */}
      <div className="max-w-3xl mx-auto px-6 -mt-6 pb-12">
        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}>
          <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>Full Rankings</h2>
          </div>

          {loading ? (
            <div className="p-6 space-y-3">{[...Array(8)].map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
          ) : leaders.length === 0 ? (
            <div className="py-16 text-center">
              <p style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🏆</p>
              <p style={{ color: 'var(--text-muted)' }}>Leaderboard is empty. Start learning to appear here!</p>
            </div>
          ) : (
            <div>
              {leaders.map((leader, i) => {
                const isMe = leader.studentId === user?.id
                return (
                  <div key={leader.studentId}
                    className="flex items-center gap-4 px-6 py-4 transition-colors"
                    style={{
                      borderBottom: i < leaders.length - 1 ? '1px solid var(--border)' : 'none',
                      background: isMe ? 'rgba(99,102,241,0.06)' : i % 2 === 0 ? 'transparent' : 'var(--bg-secondary)',
                      border: isMe ? '1px solid rgba(99,102,241,0.2)' : undefined,
                    }}>
                    {/* Rank */}
                    <div className="w-10 text-center flex-shrink-0">
                      {i < 3 ? (
                        <span style={{ fontSize: '1.3rem' }}>{podiumEmojis[i]}</span>
                      ) : (
                        <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: '1rem', color: 'var(--text-muted)' }}>#{i + 1}</span>
                      )}
                    </div>

                    {/* User */}
                    <Avatar name={leader.studentName || `User ${leader.studentId}`} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p style={{ fontWeight: isMe ? 700 : 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                          {leader.studentName || `Learner #${leader.studentId}`}
                        </p>
                        {isMe && <Badge variant="brand" style={{ fontSize: '0.6rem' }}>You</Badge>}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="flex items-center gap-1" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          <Flame size={11} style={{ color: '#f97316' }} /> {leader.currentStreak} day streak
                        </span>
                        <span className="flex items-center gap-1" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          <Award size={11} style={{ color: '#f59e0b' }} /> {leader.totalBadges} badges
                        </span>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="text-right flex-shrink-0">
                      <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: '1.1rem', color: i < 3 ? podiumColors[i] : 'var(--text-primary)' }}>
                        {leader.totalCoursesCompleted || 0}
                      </p>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>courses</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

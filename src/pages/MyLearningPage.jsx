import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Play, CheckCircle, Clock } from 'lucide-react'
import { enrollmentAPI } from '../api'
import { useAuthStore } from '../store'
import { Badge, Progress, Skeleton, EmptyState, Button, Tabs } from '../components/ui/index'

export default function MyLearningPage() {
  const { user } = useAuthStore()
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('all')

  useEffect(() => {
    enrollmentAPI.getMyEnrollments()
      .then(r => {
        console.log('My Enrollments loaded:', r)
        setEnrollments(r?.data || [])
      })
      .catch((err) => {
        console.error('Failed to load enrollments:', err)
      })
      .finally(() => setLoading(false))
  }, [])

  const filtered = enrollments.filter(e => {
    if (tab === 'active') return e.status === 'ACTIVE'
    if (tab === 'completed') return e.status === 'COMPLETED'
    return true
  }).sort((a, b) => {
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

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', paddingTop: '80px' }}>
      {/* Header */}
      <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-6xl mx-auto px-6 py-10">
          <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: '2.2rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            My Learning
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.4rem' }}>{enrollments.length} courses enrolled</p>
          <div className="mt-5">
            <Tabs
              tabs={[
                { label: `All (${enrollments.length})`, value: 'all' },
                { label: `Active (${enrollments.filter(e => e.status === 'ACTIVE').length})`, value: 'active' },
                { label: `Completed (${enrollments.filter(e => e.status === 'COMPLETED').length})`, value: 'completed' },
              ]}
              activeTab={tab}
              onTabChange={setTab}
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-48" />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon="📚" title="No courses here"
            description="Enroll in a course to start learning"
            action={<Link to="/courses"><Button variant="primary">Browse Courses</Button></Link>}
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(e => (
              <div key={e.id} className="card-hover rounded-2xl overflow-hidden"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                {/* Thumbnail placeholder */}
                <div className="h-32 relative flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #312e81 0%, #4c1d95 100%)' }}>
                  {e.courseThumbnailUrl ? (
                    <img
                      src={e.courseThumbnailUrl}
                      alt={e.courseTitle || `Course ${e.courseId}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <BookOpen size={36} color="rgba(255,255,255,0.5)" />
                  )}
                  <div className="absolute top-3 right-3">
                    <Badge variant={e.status === 'COMPLETED' ? 'success' : 'brand'}>{e.status}</Badge>
                  </div>
                  {e.status === 'COMPLETED' && (
                    <div className="absolute bottom-3 right-3">
                      <CheckCircle size={20} style={{ color: '#10b981' }} />
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                    {e.courseTitle || `Course #${e.courseId}`}
                  </p>
                  <div className="mb-3">
                    <div className="flex justify-between mb-1">
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Progress</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand)' }}>
                        {Math.round(e.completionPercentage || 0)}%
                      </span>
                    </div>
                    <Progress value={e.completionPercentage || 0} />
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} /> {new Date(e.enrolledAt).toLocaleDateString()}
                    </span>
                    <Link to={`/learn/${e.courseId}`}>
                      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold transition-all"
                        style={{ background: 'var(--brand)', color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'Sora, sans-serif' }}>
                        <Play size={12} fill="white" />
                        {e.status === 'COMPLETED' ? 'Review' : 'Continue'}
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

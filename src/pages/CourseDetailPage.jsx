import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Play, Lock, BookOpen, Star, CheckCircle, ArrowLeft,
  Shield, Award, Clock, Users, ChevronDown, ChevronUp
} from 'lucide-react'
import { courseAPI, lessonAPI, enrollmentAPI, reviewAPI, progressAPI } from '../api'
import { useAuthStore } from '../store'
import { Badge, Button, Modal, StarRating, Avatar, Progress } from '../components/ui/index'
import toast from 'react-hot-toast'

export default function CourseDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthStore()
  const [course, setCourse] = useState(null)
  const [lessons, setLessons] = useState([])
  const [reviews, setReviews] = useState([])
  const [enrolled, setEnrolled] = useState(false)
  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(true)
  const [reviewModal, setReviewModal] = useState(false)
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })
  const [enrolling, setEnrolling] = useState(false)
  const [showAllLessons, setShowAllLessons] = useState(false)

  useEffect(() => { fetchAll() }, [id])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [courseRes, lessonsRes, reviewsRes] = await Promise.all([
        courseAPI.getById(id),
        lessonAPI.getByCourse(id),
        reviewAPI.getByCourse(id),
      ])
      setCourse(courseRes?.data)
      setLessons(lessonsRes?.data || [])
      setReviews(reviewsRes?.data || [])
      if (isAuthenticated) {
        try {
          const enRes = await enrollmentAPI.checkEnrolled(id)
          setEnrolled(enRes?.data || false)
          if (enRes?.data) {
            const pRes = await progressAPI.getCourseProgress(id)
            setProgress(pRes?.data)
          }
        } catch (e) { /* not enrolled */ }
      }
    } catch (e) {
      toast.error('Course not found')
      navigate('/courses')
    } finally {
      setLoading(false)
    }
  }

  const handleEnroll = async () => {
    if (!isAuthenticated) { navigate('/login'); return }
    // Paid course → go to checkout
    if (course.price > 0 && !enrolled) {
      navigate(`/checkout/${id}`)
      return
    }
    setEnrolling(true)
    try {
      await enrollmentAPI.enroll(id)
      setEnrolled(true)
      toast.success('🎉 Enrolled successfully!')
    } catch (e) {
      toast.error(e?.message || 'Enrollment failed')
    } finally {
      setEnrolling(false)
    }
  }

  const handleReview = async () => {
    try {
      await reviewAPI.submit(id, reviewForm)
      toast.success('Review submitted! ⭐')
      setReviewModal(false)
      fetchAll()
    } catch (e) {
      toast.error(e?.message || 'Review failed')
    }
  }

  const handleLessonPreview = (lesson) => {
    if (!lesson) return
    if (enrolled || lesson.isFreePreview) {
      navigate(`/learn/${id}?lessonId=${lesson.id}`)
      return
    }
    toast('Enroll to access this lesson', { icon: '🔒' })
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)', paddingTop: '64px' }}>
      <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--brand)', borderTopColor: 'transparent' }} />
    </div>
  )
  if (!course) return null

  const displayedLessons = showAllLessons ? lessons : lessons.slice(0, 5)
  const avgRating = course.averageRating?.toFixed(1)

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', paddingTop: '64px' }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}>
        <div className="max-w-7xl mx-auto px-6 py-10">
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-2 mb-6 transition-all hover:gap-3"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.65)', fontFamily: 'DM Sans, sans-serif', fontSize: '0.875rem' }}>
            <ArrowLeft size={16} /> Back to courses
          </button>

          <div className="grid lg:grid-cols-3 gap-10">
            {/* Left - course info */}
            <div className="lg:col-span-2">
              <div className="flex flex-wrap gap-2 mb-4">
                {course.level && <Badge variant={course.level === 'BEGINNER' ? 'success' : course.level === 'INTERMEDIATE' ? 'warning' : 'danger'}>{course.level}</Badge>}
                {course.category && <Badge variant="gray">{course.category}</Badge>}
                <Badge variant={course.status === 'PUBLISHED' ? 'success' : 'warning'}>{course.status}</Badge>
              </div>

              <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', color: 'white', lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: '1rem' }}>
                {course.title}
              </h1>

              <p style={{ color: 'rgba(255,255,255,0.72)', lineHeight: 1.8, fontSize: '1rem', marginBottom: '1.5rem' }}>
                {course.description || 'No description provided.'}
              </p>

              <div className="flex flex-wrap items-center gap-5">
                {avgRating && (
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(s => <span key={s} style={{ color: s <= Math.round(course.averageRating) ? '#f59e0b' : 'rgba(255,255,255,0.25)', fontSize: '1rem' }}>★</span>)}
                    </div>
                    <span style={{ color: 'white', fontWeight: 700 }}>{avgRating}</span>
                    <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.85rem' }}>({course.totalReviews || 0} reviews)</span>
                  </div>
                )}
                <span className="flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                  <BookOpen size={15} /> {course.totalLessons || 0} lessons
                </span>
              </div>
            </div>

            {/* Right - enroll card */}
            <div>
              <div className="rounded-2xl overflow-hidden sticky top-20"
                style={{ background: 'var(--bg-card)', boxShadow: '0 30px 60px rgba(0,0,0,0.4)' }}>
                {/* Thumbnail */}
                <div className="h-40 flex items-center justify-center relative overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, #312e81, #4c1d95)' }}>
                  {course.thumbnailUrl
                    ? <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
                    : <BookOpen size={48} color="rgba(255,255,255,0.3)" />}
                </div>

                <div className="p-6">
                  <div className="text-center mb-4">
                    <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: '2rem', color: course.price === 0 ? '#10b981' : 'var(--text-primary)', lineHeight: 1 }}>
                      {course.price === 0 ? 'Free' : `₹${course.price}`}
                    </p>
                    {course.price > 0 && <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>One-time payment · Lifetime access</p>}
                  </div>

                  {enrolled ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl"
                        style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}>
                        <CheckCircle size={16} style={{ color: '#10b981' }} />
                        <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#10b981', fontSize: '0.875rem' }}>Enrolled</span>
                      </div>
                      {progress && (
                        <div>
                          <div className="flex justify-between mb-1">
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Progress</span>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand)' }}>{Math.round(progress.completionPercentage || 0)}%</span>
                          </div>
                          <Progress value={progress.completionPercentage || 0} />
                        </div>
                      )}
                      <Button variant="primary" size="lg" className="w-full" onClick={() => navigate(`/learn/${id}`)}>
                        Continue Learning →
                      </Button>
                      {user?.role === 'STUDENT' && (
                        <Button variant="outline" size="sm" className="w-full" onClick={() => setReviewModal(true)}>
                          ⭐ Write a Review
                        </Button>
                      )}
                    </div>
                  ) : (
                    <Button variant="primary" size="lg" className="w-full" loading={enrolling} onClick={handleEnroll}>
                      {course.price === 0 ? '🚀 Enroll for Free' : `💳 Buy for ₹${course.price}`}
                    </Button>
                  )}

                  <div className="mt-5 space-y-2.5">
                    {[
                      { icon: Shield, text: '30-day money-back guarantee' },
                      { icon: Clock, text: 'Lifetime access' },
                      { icon: Award, text: 'Certificate of completion' },
                      { icon: BookOpen, text: `${course.totalLessons || 0} lessons` },
                    ].map(({ icon: Icon, text }) => (
                      <div key={text} className="flex items-center gap-2.5">
                        <Icon size={14} style={{ color: 'var(--brand)', flexShrink: 0 }} />
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="lg:max-w-[66%] space-y-10">
          {/* Curriculum */}
          <div>
            <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: '1.6rem', color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
              Course Curriculum
            </h2>
            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
              {lessons.length === 0 ? (
                <p className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>No lessons added yet.</p>
              ) : (
                <>
                  {displayedLessons.map((lesson, i) => (
                    <button key={lesson.id} className="w-full flex items-center gap-4 px-5 py-4 text-left"
                      onClick={() => handleLessonPreview(lesson)}
                      style={{
                        cursor: enrolled || lesson.isFreePreview ? 'pointer' : 'not-allowed',
                        borderBottom: i < displayedLessons.length - 1 ? '1px solid var(--border)' : 'none',
                        background: i % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-secondary)',
                      }}>
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold"
                        style={{ background: 'var(--bg-tertiary)', color: 'var(--brand)', fontFamily: 'Sora, sans-serif' }}>
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate" style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{lesson.title}</p>
                        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{lesson.contentType}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {lesson.isFreePreview && <Badge variant="success" style={{ fontSize: '0.62rem' }}>FREE</Badge>}
                        {lesson.durationSeconds > 0 && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{Math.floor(lesson.durationSeconds / 60)}m</span>
                        )}
                        {enrolled || lesson.isFreePreview
                          ? <Play size={14} style={{ color: 'var(--brand)' }} />
                          : <Lock size={13} style={{ color: 'var(--text-muted)' }} />}
                      </div>
                    </button>
                  ))}
                  {lessons.length > 5 && (
                    <button onClick={() => setShowAllLessons(s => !s)}
                      className="w-full flex items-center justify-center gap-2 py-3 transition-colors"
                      style={{ background: 'var(--bg-secondary)', border: 'none', cursor: 'pointer', color: 'var(--brand)', fontFamily: 'Sora, sans-serif', fontWeight: 600, fontSize: '0.875rem', borderTop: '1px solid var(--border)' }}>
                      {showAllLessons ? <><ChevronUp size={16} /> Show less</> : <><ChevronDown size={16} /> Show all {lessons.length} lessons</>}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Reviews */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: '1.6rem', color: 'var(--text-primary)' }}>
                Student Reviews
              </h2>
              {reviews.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(s => <span key={s} style={{ color: '#f59e0b' }}>★</span>)}
                  </div>
                  <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: 'var(--text-primary)' }}>{avgRating || '—'}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>({reviews.length})</span>
                </div>
              )}
            </div>

            {reviews.length === 0 ? (
              <div className="p-8 rounded-2xl text-center" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                <p style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>💬</p>
                <p style={{ color: 'var(--text-muted)' }}>No reviews yet. {enrolled ? 'Be the first to review!' : 'Enroll to leave a review.'}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map(r => (
                  <div key={r.id} className="p-5 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar name={r.studentName || 'Student'} size="sm" />
                      <div>
                        <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                          {r.studentName || 'Student'}
                        </p>
                        <div className="flex gap-0.5 mt-0.5">
                          {[1,2,3,4,5].map(s => <span key={s} style={{ color: s <= r.rating ? '#f59e0b' : 'var(--border)', fontSize: '0.85rem' }}>★</span>)}
                        </div>
                      </div>
                      <p style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ''}
                      </p>
                    </div>
                    {r.comment && <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.7 }}>{r.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      <Modal isOpen={reviewModal} onClose={() => setReviewModal(false)} title="Write a Review">
        <div className="space-y-5">
          <div>
            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.5rem' }}>Your Rating</label>
            <StarRating value={reviewForm.rating} onChange={v => setReviewForm(f => ({ ...f, rating: v }))} />
          </div>
          <div>
            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.5rem' }}>Your Review (optional)</label>
            <textarea className="input-field px-4 py-3 rounded-xl w-full resize-none" rows={4}
              placeholder="Share what you liked or what could be improved..."
              value={reviewForm.comment}
              onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setReviewModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleReview}>Submit Review</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

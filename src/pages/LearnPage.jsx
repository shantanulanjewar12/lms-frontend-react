import React, { useRef, useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle, Circle, Play, FileText, HelpCircle, ChevronLeft, ChevronRight, Lock } from 'lucide-react'
import { lessonAPI, progressAPI, enrollmentAPI, quizAPI } from '../api'
import { useAuthStore } from '../store'
import { Badge, Progress, Button } from '../components/ui/index'
import toast from 'react-hot-toast'

const contentTypeIcon = { VIDEO: Play, DOCUMENT: FileText, QUIZ: HelpCircle }
const contentTypeColor = { VIDEO: '#6366f1', DOCUMENT: '#10b981', QUIZ: '#f97316' }

export default function LearnPage() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuthStore()
  const [lessons, setLessons] = useState([])
  const [activeIdx, setActiveIdx] = useState(0)
  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(true)
  const [marking, setMarking] = useState(false)
  const [enrolled, setEnrolled] = useState(false)
  const [quizQuestions, setQuizQuestions] = useState([])
  const [quizAnswers, setQuizAnswers] = useState({})
  const [quizResult, setQuizResult] = useState(null)
  const [quizAttempts, setQuizAttempts] = useState([])
  const [quizLoading, setQuizLoading] = useState(false)
  const [submittingQuiz, setSubmittingQuiz] = useState(false)
  const lastVideoTimeRef = useRef(0)
  const watchedSecondsRef = useRef(0)
  const activeLesson = lessons[activeIdx]
  const progressList = progress?.lessonProgressList || []

  const isCompleted = (lessonId) => progressList.find(p => p.lessonId === lessonId)?.isCompleted

  useEffect(() => {
    const load = async () => {
      try {
        const [lRes, enRes] = await Promise.all([
          lessonAPI.getByCourse(courseId),
          enrollmentAPI.checkEnrolled(courseId),
        ])
        setLessons(lRes?.data || [])
        setEnrolled(enRes?.data || false)
        const pRes = await progressAPI.getCourseProgress(courseId)
        setProgress(pRes?.data)
      } catch (e) {
        toast.error(e?.message || 'Failed to load course content')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [courseId])

  useEffect(() => {
    const lessonIdParam = searchParams.get('lessonId')
    const targetLessonId = lessonIdParam ? Number(lessonIdParam) : null
    if (!targetLessonId || lessons.length === 0) return
    const idx = lessons.findIndex(l => l.id === targetLessonId)
    if (idx >= 0) setActiveIdx(idx)
  }, [lessons, searchParams])

  useEffect(() => {
    lastVideoTimeRef.current = 0
    watchedSecondsRef.current = 0
  }, [activeIdx])

  useEffect(() => {
    const loadQuiz = async () => {
      if (!activeLesson || activeLesson.contentType !== 'QUIZ') {
        setQuizQuestions([])
        setQuizAnswers({})
        setQuizResult(null)
        setQuizAttempts([])
        return
      }
      setQuizLoading(true)
      setQuizResult(null)
      setQuizAnswers({})
      try {
        const [questionsRes, attemptsRes] = await Promise.all([
          quizAPI.getByLesson(activeLesson.id),
          quizAPI.getAttemptsByLesson(activeLesson.id),
        ])
        setQuizQuestions(questionsRes?.data || [])
        setQuizAttempts(attemptsRes?.data || [])
      } catch (e) {
        toast.error(e?.message || 'Failed to load quiz')
      } finally {
        setQuizLoading(false)
      }
    }
    loadQuiz()
  }, [activeLesson?.id, activeLesson?.contentType])

  const logLearningEvent = async (eventType, value = null) => {
    if (!activeLesson?.id) return
    try {
      await progressAPI.logEvent({ lessonId: activeLesson.id, eventType, value })
    } catch (e) {
      // Keep playback smooth even if analytics event logging fails.
    }
  }

  const handleVideoPlay = () => {
    logLearningEvent('VIDEO_WATCH', 1)
  }

  const handleVideoTimeUpdate = (e) => {
    const currentTime = e.target.currentTime || 0
    const previousTime = lastVideoTimeRef.current || 0

    if (currentTime + 2 < previousTime) {
      const rewindSeconds = previousTime - currentTime
      logLearningEvent('VIDEO_REWIND', Number(rewindSeconds.toFixed(2)))
    }

    if (currentTime > previousTime) {
      watchedSecondsRef.current += (currentTime - previousTime)
    }

    lastVideoTimeRef.current = currentTime
  }

  const handleVideoSeeked = (e) => {
    const currentTime = e.target.currentTime || 0
    const previousTime = lastVideoTimeRef.current || 0
    const rewindSeconds = previousTime - currentTime

    if (rewindSeconds > 2) {
      logLearningEvent('VIDEO_REWIND', Number(rewindSeconds.toFixed(2)))
    }

    lastVideoTimeRef.current = currentTime
  }

  const markComplete = async () => {
    if (!activeLesson) return
    setMarking(true)
    try {
      await progressAPI.updateLesson({
        lessonId: activeLesson.id,
        isCompleted: true,
        watchDurationSeconds: Math.round(watchedSecondsRef.current),
      })
      const pRes = await progressAPI.getCourseProgress(courseId)
      setProgress(pRes?.data)
      toast.success('Lesson marked complete! ✅')
      if (activeIdx < lessons.length - 1) setActiveIdx(i => i + 1)
    } catch (e) {
      toast.error('Failed to mark complete')
    } finally {
      setMarking(false)
    }
  }

  const submitQuiz = async () => {
    if (!activeLesson || activeLesson.contentType !== 'QUIZ') return
    const answers = quizQuestions
      .map(q => ({ questionId: q.id, selectedOptions: quizAnswers[q.id] || [] }))
      .filter(a => Array.isArray(a.selectedOptions) && a.selectedOptions.length > 0)

    if (answers.length === 0) {
      toast.error('Select at least one answer before submitting')
      return
    }

    setSubmittingQuiz(true)
    try {
      const res = await quizAPI.submitByLesson(activeLesson.id, answers)
      setQuizResult(res?.data)
      toast.success(`Quiz submitted. Score: ${Math.round(res?.data?.scorePercent || 0)}%`)
      try {
        const attemptsRes = await quizAPI.getAttemptsByLesson(activeLesson.id)
        setQuizAttempts(attemptsRes?.data || [])
      } catch {
        // Keep submit success even if attempt refresh fails.
      }
    } catch (e) {
      toast.error(e?.message || 'Quiz submission failed')
    } finally {
      setSubmittingQuiz(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)', paddingTop: '64px' }}>
      <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--brand)', borderTopColor: 'transparent' }} />
    </div>
  )

  const completionPct = progress?.completionPercentage || 0

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', paddingTop: '64px' }}>
      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <div className="w-80 flex-shrink-0 overflow-y-auto"
          style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)' }}>
          <div className="p-5">
            <button onClick={() => navigate(`/courses/${courseId}`)}
              className="flex items-center gap-2 mb-4 text-sm"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif' }}>
              <ArrowLeft size={16} /> Back to course
            </button>
            <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
              Course Content
            </h2>
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Your progress</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand)' }}>{Math.round(completionPct)}%</span>
              </div>
              <Progress value={completionPct} />
            </div>
          </div>

          {/* Lesson List */}
          <div className="px-3 pb-6">
            {lessons.map((lesson, i) => {
              const Icon = contentTypeIcon[lesson.contentType] || Play
              const color = contentTypeColor[lesson.contentType] || '#6366f1'
              const done = isCompleted(lesson.id)
              const active = i === activeIdx

              return (
                <button key={lesson.id} onClick={() => setActiveIdx(i)}
                  className="w-full flex items-start gap-3 p-3 rounded-xl mb-1 text-left transition-all"
                  style={{
                    background: active ? 'var(--bg-tertiary)' : 'transparent',
                    border: `1.5px solid ${active ? 'var(--brand)' : 'transparent'}`,
                    cursor: 'pointer',
                  }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: done ? 'rgba(16,185,129,0.15)' : `${color}20`, color: done ? '#10b981' : color }}>
                    {done ? <CheckCircle size={16} /> : <Icon size={14} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontSize: '0.82rem', fontWeight: active ? 700 : 500, color: active ? 'var(--text-primary)' : 'var(--text-secondary)', lineHeight: 1.4 }} className="line-clamp-2">
                      {i + 1}. {lesson.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>{lesson.contentType}</span>
                      {lesson.isFreePreview && <Badge variant="success" className="text-xs" style={{ fontSize: '0.6rem', padding: '1px 6px' }}>FREE</Badge>}
                      {lesson.durationSeconds && <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{Math.floor(lesson.durationSeconds / 60)}m</span>}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          {activeLesson ? (
            <div className="max-w-4xl mx-auto p-8">
              {/* Lesson Header */}
              <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="brand">{activeLesson.contentType}</Badge>
                    {isCompleted(activeLesson.id) && <Badge variant="success">Completed</Badge>}
                  </div>
                  <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: '1.6rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                    {activeLesson.title}
                  </h1>
                </div>
              </div>

              {/* Content Area */}
              {!enrolled && !activeLesson.isFreePreview ? (
                <div className="flex flex-col items-center justify-center py-20 rounded-2xl"
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                  <Lock size={40} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
                  <h3 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Enroll to access this lesson</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Purchase the course to unlock all lessons</p>
                  <Button variant="primary" onClick={() => navigate(`/courses/${courseId}`)}>Enroll Now</Button>
                </div>
              ) : activeLesson.contentType === 'VIDEO' && activeLesson.contentUrl ? (
                <div className="rounded-2xl overflow-hidden" style={{ background: 'black', border: '1px solid var(--border)' }}>
                  <video
                    key={activeLesson.id}
                    src={activeLesson.contentUrl}
                    controls
                    className="w-full"
                    style={{ maxHeight: '480px' }}
                    onPlay={handleVideoPlay}
                    onTimeUpdate={handleVideoTimeUpdate}
                    onSeeked={handleVideoSeeked}
                  >
                    Your browser does not support video playback.
                  </video>
                </div>
              ) : activeLesson.contentType === 'DOCUMENT' && activeLesson.contentUrl ? (
                <div className="rounded-2xl p-8 text-center"
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                  <FileText size={48} style={{ color: '#10b981', margin: '0 auto 1rem' }} />
                  <h3 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>Document Resource</h3>
                  <a href={activeLesson.contentUrl} target="_blank" rel="noreferrer">
                    <Button variant="primary">Open Document</Button>
                  </a>
                </div>
              ) : activeLesson.contentType === 'QUIZ' ? (
                <div className="rounded-2xl p-6" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                  <h3 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                    Quiz Challenge
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                    Answer all questions, then submit to view score.
                  </p>

                  {quizLoading ? (
                    <p style={{ color: 'var(--text-muted)' }}>Loading quiz...</p>
                  ) : quizQuestions.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)' }}>No quiz questions added yet by instructor.</p>
                  ) : (
                    <div className="space-y-4">
                      {quizQuestions.map((q, idx) => (
                        <div key={q.id} className="rounded-xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                          <p style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.6rem' }}>
                            {idx + 1}. {q.questionText}
                          </p>
                          {[
                            { key: 'A', value: q.optionA },
                            { key: 'B', value: q.optionB },
                            { key: 'C', value: q.optionC },
                            { key: 'D', value: q.optionD },
                          ].map(opt => (
                            <label key={opt.key} className="flex items-center gap-2 mb-2" style={{ cursor: 'pointer' }}>
                              <input
                                type="checkbox"
                                value={opt.key}
                                checked={Array.isArray(quizAnswers[q.id]) ? quizAnswers[q.id].includes(opt.key) : false}
                                onChange={e => {
                                  const checked = e.target.checked
                                  setQuizAnswers(prev => {
                                    const current = Array.isArray(prev[q.id]) ? prev[q.id] : []
                                    const next = checked
                                      ? [...new Set([...current, opt.key])]
                                      : current.filter(v => v !== opt.key)
                                    return { ...prev, [q.id]: next }
                                  })
                                }}
                              />
                              <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>{opt.key}. {opt.value}</span>
                            </label>
                          ))}
                        </div>
                      ))}

                      <div className="flex items-center gap-3 flex-wrap">
                        <Button variant="primary" onClick={submitQuiz} loading={submittingQuiz}>Submit Quiz</Button>
                        {quizResult && (
                          <p style={{ color: quizResult.passed ? '#10b981' : '#f97316', fontWeight: 700, fontSize: '0.9rem' }}>
                            Score: {Math.round(quizResult.scorePercent || 0)}% ({quizResult.correctAnswers}/{quizResult.totalQuestions})
                          </p>
                        )}
                      </div>

                      {quizResult?.answerResults?.length > 0 && (
                        <div className="rounded-xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                          <p style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.6rem' }}>Review</p>
                          <div className="space-y-1">
                            {quizResult.answerResults.map((r, i) => (
                              <p key={r.questionId} style={{ fontSize: '0.82rem', color: r.isCorrect ? '#10b981' : '#f97316' }}>
                                Q{i + 1}: {r.isCorrect ? 'Correct' : `Wrong (Correct: ${(r.correctOptions || []).join(', ')})`}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}

                      {quizAttempts.length > 0 && (
                        <div className="rounded-xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                          <p style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.6rem' }}>Previous Attempts</p>
                          <div className="space-y-2">
                            {quizAttempts.slice(0, 5).map((attempt, i) => (
                              <div key={attempt.id || i} className="flex items-center justify-between" style={{ fontSize: '0.82rem' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>
                                  Attempt {quizAttempts.length - i} • {attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleString() : 'Unknown time'}
                                </span>
                                <span style={{ color: '#10b981', fontWeight: 700 }}>
                                  {Math.round(attempt.scorePercent || 0)}%
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-2xl p-12 flex flex-col items-center justify-center"
                  style={{ background: 'var(--bg-secondary)', border: '2px dashed var(--border)', minHeight: '300px' }}>
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: 'var(--bg-tertiary)', color: 'var(--brand)' }}>
                    {React.createElement(contentTypeIcon[activeLesson.contentType] || Play, { size: 32 })}
                  </div>
                  <h3 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                    {activeLesson.title}
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Content will be displayed here</p>
                </div>
              )}

              {/* Actions */}
              {enrolled && (
                <div className="flex items-center justify-between mt-6 flex-wrap gap-3">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm"
                      icon={<ChevronLeft size={16} />}
                      onClick={() => setActiveIdx(i => Math.max(0, i - 1))}
                      disabled={activeIdx === 0}>
                      Previous
                    </Button>
                    <Button variant="outline" size="sm"
                      onClick={() => setActiveIdx(i => Math.min(lessons.length - 1, i + 1))}
                      disabled={activeIdx === lessons.length - 1}>
                      Next <ChevronRight size={16} />
                    </Button>
                  </div>
                  <Button variant={isCompleted(activeLesson.id) ? 'success' : 'primary'}
                    loading={marking}
                    icon={isCompleted(activeLesson.id) ? <CheckCircle size={16} /> : null}
                    onClick={markComplete}>
                    {isCompleted(activeLesson.id) ? 'Completed' : 'Mark Complete'}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p style={{ color: 'var(--text-muted)' }}>No lessons available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

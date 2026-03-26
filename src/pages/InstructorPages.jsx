import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Plus, Edit, Trash2, Eye, Upload, BookOpen, ArrowLeft, Check, ChevronUp, ChevronDown } from 'lucide-react'
import { courseAPI, lessonAPI, quizAPI } from '../api'
import { useAuthStore } from '../store'
import { Button, Badge, Modal, Input, Select, Textarea, Skeleton } from '../components/ui/index'
import toast from 'react-hot-toast'

const LEVELS = [
  { value: 'BEGINNER', label: 'Beginner' },
  { value: 'INTERMEDIATE', label: 'Intermediate' },
  { value: 'ADVANCED', label: 'Advanced' },
]

const CATEGORIES = [
  { value: '', label: 'Select Category' },
  { value: 'Web Development', label: 'Web Development' },
  { value: 'Data Science', label: 'Data Science' },
  { value: 'Artificial Intelligence', label: 'Artificial Intelligence' },
  { value: 'Machine Learning', label: 'Machine Learning' },
  { value: 'Cloud Computing', label: 'Cloud Computing' },
  { value: 'Cybersecurity', label: 'Cybersecurity' },
  { value: 'Design', label: 'Design' },
  { value: 'Business', label: 'Business' },
  { value: 'DevOps', label: 'DevOps' },
  { value: 'Software Testing', label: 'Software Testing' },
  { value: 'Programming Languages', label: 'Programming Languages' },
  { value: 'Database Management', label: 'Database Management' },
  { value: 'Career Development', label: 'Career Development' },
  { value: 'Mobile Dev', label: 'Mobile Development' },
]

const CONTENT_TYPES = [
  { value: 'VIDEO', label: '🎬 Video' },
  { value: 'DOCUMENT', label: '📄 Document' },
  { value: 'QUIZ', label: '📝 Quiz' },
]

// ── My Courses List ──
export function InstructorCoursesPage() {
  const { user } = useAuthStore()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    courseAPI.getMine('?size=100')
      .then(r => {
        const all = r?.data?.content || r?.data || []
        setCourses(all)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user?.id])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this course?')) return
    try {
      await courseAPI.delete(id)
      setCourses(cs => cs.filter(c => c.id !== id))
      toast.success('Course deleted')
    } catch (e) { toast.error('Delete failed') }
  }

  const handlePublish = async (id) => {
    try {
      await courseAPI.publish(id)
      setCourses(cs => cs.map(c => c.id === id ? { ...c, status: 'PUBLISHED' } : c))
      toast.success('Course published! 🚀')
    } catch (e) { toast.error(e?.message || 'Publish failed') }
  }

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', paddingTop: '80px' }}>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: '2rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              My Courses
            </h1>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>{courses.length} courses</p>
          </div>
          <Link to="/instructor/courses/new">
            <Button variant="primary" icon={<Plus size={16} />}>Create Course</Button>
          </Link>
        </div>

        {loading ? (
          <div className="space-y-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
            <h3 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.3rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No courses yet</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Create your first course to start teaching</p>
            <Link to="/instructor/courses/new"><Button variant="primary">Create Course</Button></Link>
          </div>
        ) : (
          <div className="space-y-4">
            {courses.map(course => {
              const courseStatus = course.status || 'DRAFT'
              return (
              <div key={course.id} className="rounded-2xl p-5 flex items-center gap-5 flex-wrap"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, #312e81, #4c1d95)' }}>
                  {course.thumbnailUrl
                    ? <img src={course.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                    : <BookOpen size={24} color="rgba(255,255,255,0.7)" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }} className="truncate">
                      {course.title}
                    </h3>
                    <Badge variant={courseStatus === 'PUBLISHED' ? 'success' : courseStatus === 'DRAFT' ? 'warning' : 'gray'}>
                      {courseStatus}
                    </Badge>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    {course.totalLessons || 0} lessons · {course.category || 'No category'} · ₹{course.price || 'Free'}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {courseStatus !== 'PUBLISHED' && (
                    <Button variant="success" size="sm" icon={<Check size={14} />}
                      onClick={() => handlePublish(course.id)}>
                      Publish
                    </Button>
                  )}
                  <Link to={`/instructor/courses/${course.id}/edit`}>
                    <Button variant="outline" size="sm" icon={<Edit size={14} />}>Edit</Button>
                  </Link>
                  <Link to={`/courses/${course.id}`}>
                    <Button variant="ghost" size="sm" icon={<Eye size={14} />}>Preview</Button>
                  </Link>
                  <Button variant="danger" size="sm" icon={<Trash2 size={14} />}
                    onClick={() => handleDelete(course.id)}>
                    Delete
                  </Button>
                </div>
              </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Create / Edit Course ──
export function CourseFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const isEdit = Boolean(id)

  const [form, setForm] = useState({
    title: '', description: '', price: 0, currency: 'INR', level: 'BEGINNER', category: '',
  })
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [thumbnail, setThumbnail] = useState(null)
  const [lessonModal, setLessonModal] = useState(false)
  const [lessonForm, setLessonForm] = useState({ title: '', contentType: 'VIDEO', orderIndex: 1, isFreePreview: false })
  const [lessonFile, setLessonFile] = useState(null)
  const [quizQuestions, setQuizQuestions] = useState([
    { questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOptions: ['A'], orderIndex: 1 },
  ])
  const [addingLesson, setAddingLesson] = useState(false)

  useEffect(() => {
    if (isEdit) {
      setLoading(true)
      Promise.all([courseAPI.getById(id), lessonAPI.getByCourse(id)])
        .then(([cRes, lRes]) => {
          const c = cRes?.data
          if (c) setForm({ title: c.title, description: c.description || '', price: c.price, currency: c.currency, level: c.level, category: c.category || '' })
          setLessons(lRes?.data || [])
        })
        .catch(() => toast.error('Failed to load course'))
        .finally(() => setLoading(false))
    }
  }, [id, isEdit])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      let courseId = id
      if (isEdit) {
        await courseAPI.update(id, form)
        toast.success('Course updated!')
      } else {
        const res = await courseAPI.create(form)
        courseId = res?.data?.id
        if (courseId) {
          try {
            await courseAPI.publish(courseId)
          } catch {
            // Keep user flow smooth even if publish fails due validation/race.
          }
        }
        toast.success('Course created!')
      }
      if (thumbnail && courseId) {
        await courseAPI.uploadThumbnail(courseId, thumbnail)
      }
      navigate(`/instructor/courses/${courseId}/edit`)
    } catch (e) {
      toast.error(e?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleAddLesson = async () => {
    if (!id) { toast.error('Save course first'); return }
    setAddingLesson(true)
    try {
      const res = await lessonAPI.create({ ...lessonForm, courseId: Number(id) }, lessonFile)
      const createdLesson = res?.data

      if (lessonForm.contentType === 'QUIZ') {
        const preparedQuestions = quizQuestions
          .map((q, idx) => ({
            questionText: q.questionText?.trim(),
            optionA: q.optionA?.trim(),
            optionB: q.optionB?.trim(),
            optionC: q.optionC?.trim(),
            optionD: q.optionD?.trim(),
            correctOptions: Array.isArray(q.correctOptions) && q.correctOptions.length > 0 ? q.correctOptions : ['A'],
            orderIndex: idx + 1,
          }))
          .filter(q => q.questionText && q.optionA && q.optionB && q.optionC && q.optionD)

        if (preparedQuestions.length === 0) {
          toast.error('Add at least one complete quiz question')
          setAddingLesson(false)
          return
        }

        await quizAPI.upsertByLesson(createdLesson.id, preparedQuestions)
      }

      setLessons(ls => [...ls, res?.data])
      setLessonModal(false)
      setLessonForm({ title: '', contentType: 'VIDEO', orderIndex: lessons.length + 2, isFreePreview: false })
      setLessonFile(null)
      setQuizQuestions([{ questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOptions: ['A'], orderIndex: 1 }])
      toast.success('Lesson added!')
    } catch (e) {
      toast.error(e?.message || 'Failed to add lesson')
    } finally {
      setAddingLesson(false)
    }
  }

  const handleDeleteLesson = async (lessonId) => {
    try {
      await lessonAPI.delete(lessonId)
      setLessons(ls => ls.filter(l => l.id !== lessonId))
      toast.success('Lesson deleted')
    } catch (e) { toast.error('Failed to delete lesson') }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)', paddingTop: '64px' }}>
      <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--brand)', borderTopColor: 'transparent' }} />
    </div>
  )

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', paddingTop: '80px' }}>
      <div className="max-w-4xl mx-auto px-6 py-8">
        <button onClick={() => navigate('/instructor/courses')}
          className="flex items-center gap-2 mb-6 text-sm"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif' }}>
          <ArrowLeft size={16} /> My Courses
        </button>

        <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: '2rem', color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '2rem' }}>
          {isEdit ? 'Edit Course' : 'Create New Course'}
        </h1>

        {/* Course Form */}
        <form onSubmit={handleSave}>
          <div className="rounded-2xl p-6 mb-6 space-y-5"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Course Details</h2>
            <Input label="Course Title *" placeholder="e.g. Complete React Developer Course"
              value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
            <Textarea label="Description" placeholder="What will students learn in this course?"
              value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={4} />
            <div className="grid grid-cols-2 gap-4">
              <Select label="Level *" options={LEVELS} value={form.level}
                onChange={e => setForm(f => ({ ...f, level: e.target.value }))} />
              <Select label="Category" options={CATEGORIES} value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Price (₹)" type="number" min="0" placeholder="0 for free"
                value={form.price} onChange={e => setForm(f => ({ ...f, price: parseFloat(e.target.value) || 0 }))} />
              <Input label="Currency" value={form.currency}
                onChange={e => setForm(f => ({ ...f, currency: e.target.value }))} placeholder="INR" />
            </div>
            {/* Thumbnail */}
            <div>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500, display: 'block', marginBottom: '0.5rem' }}>
                Thumbnail Image
              </label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer transition-all"
                  style={{ background: 'var(--bg-secondary)', border: '1.5px dashed var(--border)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  <Upload size={16} />
                  {thumbnail ? thumbnail.name : 'Choose image'}
                  <input type="file" accept="image/*" className="hidden" onChange={e => setThumbnail(e.target.files[0])} />
                </label>
                {thumbnail && <span style={{ fontSize: '0.8rem', color: '#10b981' }}>✓ Selected</span>}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mb-8">
            <Button variant="outline" type="button" onClick={() => navigate('/instructor/courses')}>Cancel</Button>
            <Button variant="primary" type="submit" loading={saving}>
              {isEdit ? 'Save Changes' : 'Create Course'}
            </Button>
          </div>
        </form>

        {/* Lessons Section — only for edit mode */}
        {isEdit && (
          <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                Lessons ({lessons.length})
              </h2>
              <Button variant="primary" size="sm" icon={<Plus size={14} />}
                onClick={() => {
                  setLessonForm({ title: '', contentType: 'VIDEO', orderIndex: lessons.length + 1, isFreePreview: false })
                  setQuizQuestions([{ questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOptions: ['A'], orderIndex: 1 }])
                  setLessonModal(true)
                }}>
                Add Lesson
              </Button>
            </div>

            {lessons.length === 0 ? (
              <div className="py-12 text-center">
                <p style={{ color: 'var(--text-muted)' }}>No lessons yet. Add your first lesson.</p>
              </div>
            ) : (
              <div>
                {lessons.map((lesson, i) => (
                  <div key={lesson.id} className="flex items-center gap-4 px-6 py-4"
                    style={{ borderBottom: i < lessons.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold"
                      style={{ background: 'var(--bg-tertiary)', color: 'var(--brand)', fontFamily: 'Sora, sans-serif' }}>
                      {lesson.orderIndex}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }} className="truncate">{lesson.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>{lesson.contentType}</span>
                        {lesson.isFreePreview && <Badge variant="success" style={{ fontSize: '0.6rem' }}>FREE PREVIEW</Badge>}
                      </div>
                    </div>
                    <Button variant="danger" size="sm" icon={<Trash2 size={14} />}
                      onClick={() => handleDeleteLesson(lesson.id)}>
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Lesson Modal */}
      <Modal isOpen={lessonModal} onClose={() => setLessonModal(false)} title="Add Lesson" size="xl">
        <div className="space-y-4">
          <Input label="Lesson Title *" placeholder="e.g. Introduction to React Hooks"
            value={lessonForm.title} onChange={e => setLessonForm(f => ({ ...f, title: e.target.value }))} />
          <Select label="Content Type" options={CONTENT_TYPES} value={lessonForm.contentType}
            onChange={e => setLessonForm(f => ({ ...f, contentType: e.target.value }))} />
          <Input label="Order Index" type="number" min="1" value={lessonForm.orderIndex}
            onChange={e => setLessonForm(f => ({ ...f, orderIndex: parseInt(e.target.value) || 1 }))} />
          {lessonForm.contentType !== 'QUIZ' && (
            <div>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500, display: 'block', marginBottom: '0.5rem' }}>
                Upload File (optional)
              </label>
              <label className="flex items-center gap-2 px-4 py-3 rounded-xl cursor-pointer"
                style={{ background: 'var(--bg-secondary)', border: '1.5px dashed var(--border)', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                <Upload size={16} />
                {lessonFile ? lessonFile.name : 'Choose video / document'}
                <input type="file" className="hidden" onChange={e => setLessonFile(e.target.files[0])} />
              </label>
            </div>
          )}
          {lessonForm.contentType === 'QUIZ' && (
            <div className="space-y-3">
              <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                Quiz Questions
              </p>
              {quizQuestions.map((q, idx) => (
                <div key={idx} className="rounded-xl p-3 space-y-2" style={{ border: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
                  <div className="flex items-center justify-between">
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Question {idx + 1}</p>
                    {quizQuestions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setQuizQuestions(items => items.filter((_, i) => i !== idx).map((item, i) => ({ ...item, orderIndex: i + 1 })))}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <Input label="Question" value={q.questionText} onChange={e => setQuizQuestions(items => items.map((item, i) => i === idx ? { ...item, questionText: e.target.value } : item))} />
                  <div className="grid grid-cols-2 gap-2">
                    <Input label="Option A" value={q.optionA} onChange={e => setQuizQuestions(items => items.map((item, i) => i === idx ? { ...item, optionA: e.target.value } : item))} />
                    <Input label="Option B" value={q.optionB} onChange={e => setQuizQuestions(items => items.map((item, i) => i === idx ? { ...item, optionB: e.target.value } : item))} />
                    <Input label="Option C" value={q.optionC} onChange={e => setQuizQuestions(items => items.map((item, i) => i === idx ? { ...item, optionC: e.target.value } : item))} />
                    <Input label="Option D" value={q.optionD} onChange={e => setQuizQuestions(items => items.map((item, i) => i === idx ? { ...item, optionD: e.target.value } : item))} />
                  </div>
                  <Select
                    label="Correct Option(s)"
                    options={[]}
                    value=""
                    onChange={() => {}}
                    className="hidden"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    {['A', 'B', 'C', 'D'].map(opt => (
                      <label key={opt} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ border: '1px solid var(--border)', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={Array.isArray(q.correctOptions) ? q.correctOptions.includes(opt) : false}
                          onChange={(e) => {
                            setQuizQuestions(items => items.map((item, i) => {
                              if (i !== idx) return item
                              const current = Array.isArray(item.correctOptions) ? item.correctOptions : []
                              const next = e.target.checked
                                ? [...new Set([...current, opt])]
                                : current.filter(v => v !== opt)
                              return { ...item, correctOptions: next.length ? next : ['A'] }
                            }))
                          }}
                        />
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>Option {opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setQuizQuestions(items => [...items, { questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOptions: ['A'], orderIndex: items.length + 1 }])}
              >
                + Add Question
              </Button>
            </div>
          )}
          <div className="flex items-center gap-3">
            <input type="checkbox" id="freePreview" checked={lessonForm.isFreePreview}
              onChange={e => setLessonForm(f => ({ ...f, isFreePreview: e.target.checked }))} />
            <label htmlFor="freePreview" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              Free preview (accessible without enrollment)
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setLessonModal(false)}>Cancel</Button>
            <Button variant="primary" loading={addingLesson} onClick={handleAddLesson}>Add Lesson</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

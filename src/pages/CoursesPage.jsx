import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, Filter, Star, Users, Clock, BookOpen, SlidersHorizontal, X } from 'lucide-react'
import { courseAPI } from '../api'
import { Badge, Button, Skeleton, EmptyState, Progress } from '../components/ui/index'

const LEVELS = ['', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED']
const CATEGORIES = [
  '',
  'Web Development',
  'Data Science',
  'Artificial Intelligence',
  'Machine Learning',
  'Cloud Computing',
  'Cybersecurity',
  'Design',
  'Business',
  'DevOps',
  'Software Testing',
  'Programming Languages',
  'Database Management',
  'Career Development',
  'Mobile Dev',
]
const SORTS = [
  { label: 'Popular', value: 'popular' },
  { label: 'Newest', value: 'newest' },
  { label: 'Highest Rated', value: 'rating' },
]

function CourseCard({ course }) {
  const levelColors = { BEGINNER: 'success', INTERMEDIATE: 'warning', ADVANCED: 'danger' }

  return (
    <Link to={`/courses/${course.id}`} className="block">
      <div className="card-hover rounded-2xl overflow-hidden"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', height: '100%' }}>
        {/* Thumbnail */}
        <div className="relative overflow-hidden" style={{ height: '180px', background: 'linear-gradient(135deg, var(--bg-tertiary) 0%, var(--bg-secondary) 100%)' }}>
          {course.thumbnailUrl ? (
            <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen size={48} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
            </div>
          )}
          <div className="absolute top-3 left-3">
            <Badge variant={levelColors[course.level] || 'gray'}>{course.level}</Badge>
          </div>
          {course.price === 0 && (
            <div className="absolute top-3 right-3">
              <Badge variant="success">FREE</Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          {course.category && (
            <p style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--brand)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
              {course.category}
            </p>
          )}
          <h3 className="line-clamp-2" style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', lineHeight: 1.4, marginBottom: '0.75rem' }}>
            {course.title}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(s => (
                <span key={s} style={{ fontSize: '0.75rem', color: s <= Math.round(course.averageRating || 0) ? '#f59e0b' : 'var(--border)' }}>★</span>
              ))}
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              {course.averageRating?.toFixed(1) || 'New'}
            </span>
            {course.totalReviews > 0 && (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({course.totalReviews})</span>
            )}
          </div>

          {/* Meta */}
          <div className="flex items-center gap-3 mb-4">
            <span className="flex items-center gap-1" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <BookOpen size={12} /> {course.totalLessons || 0} lessons
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid var(--border)' }}>
            <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: '1.1rem', color: course.price === 0 ? '#10b981' : 'var(--text-primary)' }}>
              {course.price === 0 ? 'Free' : `₹${course.price}`}
            </span>
            <button className="text-xs px-3 py-1.5 rounded-lg font-bold transition-all"
              style={{ background: 'var(--bg-tertiary)', color: 'var(--brand)', border: '1px solid var(--border)', cursor: 'pointer', fontFamily: 'Sora, sans-serif' }}>
              Enroll →
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <Skeleton className="h-44 w-full rounded-none" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-8 w-full" />
      </div>
    </div>
  )
}

export default function CoursesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [level, setLevel] = useState(searchParams.get('level') || '')
  const [category, setCategory] = useState(searchParams.get('category') || '')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [showFilters, setShowFilters] = useState(false)

  // Fetch courses when page, level, category, or search changes
  useEffect(() => {
    fetchCourses()
  }, [level, category, page, search])

  const fetchCourses = async () => {
    setLoading(true)
    try {
      let params = `?page=${page}&size=9`
      if (category) params += `&category=${encodeURIComponent(category)}`
      if (level) params += `&level=${level}`
      if (search) params += `&search=${encodeURIComponent(search)}`
      const res = await courseAPI.getAll(params)
      const payload = res?.data
      if (payload?.content) {
        setCourses(payload.content)
        setTotalPages(payload.totalPages || 1)
      } else if (Array.isArray(payload)) {
        setCourses(payload)
        setTotalPages(1)
      } else {
        setCourses([])
        setTotalPages(0)
      }
    } catch {
      setCourses([])
      setTotalPages(0)
    } finally {
      setLoading(false)
    }
  }

  const filteredCourses = courses


  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', paddingTop: '80px' }}>
        <div className="max-w-7xl mx-auto px-6 py-12">
          <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: '2.5rem', color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
            Explore <span className="gradient-text">Courses</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Discover 1,200+ expert-led courses across all disciplines</p>

          {/* Search */}
          <div className="relative mt-6 max-w-xl">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input
              className="input-field pl-12 pr-4 py-3.5 rounded-2xl text-base"
              placeholder="Search courses, topics, skills..."
              value={search}
              onChange={e => {
                setSearch(e.target.value)
                setPage(0)
              }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <button onClick={() => setShowFilters(f => !f)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ background: showFilters ? 'var(--brand)' : 'var(--bg-secondary)', color: showFilters ? 'white' : 'var(--text-secondary)', border: '1px solid var(--border)', cursor: 'pointer', fontFamily: 'Sora, sans-serif' }}>
            <SlidersHorizontal size={16} /> Filters
          </button>

          {/* Level pills */}
          {LEVELS.filter(l => l).map(l => (
            <button key={l} onClick={() => setLevel(level === l ? '' : l)}
              className="px-4 py-2 rounded-xl text-xs font-bold transition-all"
              style={{
                background: level === l ? 'var(--brand)' : 'var(--bg-secondary)',
                color: level === l ? 'white' : 'var(--text-secondary)',
                border: '1px solid var(--border)',
                cursor: 'pointer',
                fontFamily: 'Sora, sans-serif',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
              {l}
            </button>
          ))}

          {(level || category || search) && (
            <button onClick={() => { setLevel(''); setCategory(''); setSearch('') }}
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold"
              style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer', fontFamily: 'Sora, sans-serif' }}>
              <X size={12} /> Clear
            </button>
          )}
        </div>

        {/* Category filter */}
        {showFilters && (
          <div className="flex flex-wrap gap-2 mb-8 p-4 rounded-2xl animate-fade-up" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCategory(category === c ? '' : c)}
                className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: category === c ? 'var(--brand)' : 'var(--bg-card)',
                  color: category === c ? 'white' : 'var(--text-secondary)',
                  border: '1px solid var(--border)',
                  cursor: 'pointer',
                  fontFamily: 'Sora, sans-serif',
                }}>
                {c || 'All Categories'}
              </button>
            ))}
          </div>
        )}

        {/* Results count */}
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          Showing <strong style={{ color: 'var(--text-primary)' }}>{filteredCourses.length}</strong> courses
        </p>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading
            ? [...Array(9)].map((_, i) => <SkeletonCard key={i} />)
            : filteredCourses.length === 0
            ? <div className="col-span-3"><EmptyState icon="📚" title="No courses found" description="Try adjusting your filters" /></div>
            : filteredCourses.map(c => <CourseCard key={c.id} course={c} />)
          }
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-12">
            {[...Array(totalPages)].map((_, i) => (
              <button key={i} onClick={() => setPage(i)}
                className="w-10 h-10 rounded-xl font-bold text-sm transition-all"
                style={{
                  background: page === i ? 'var(--brand)' : 'var(--bg-secondary)',
                  color: page === i ? 'white' : 'var(--text-secondary)',
                  border: '1px solid var(--border)',
                  cursor: 'pointer',
                  fontFamily: 'Sora, sans-serif',
                }}>
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

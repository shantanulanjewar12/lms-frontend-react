import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Play, Star, Users, BookOpen, Award, TrendingUp, Zap, Shield, Globe, ChevronRight, Sparkles } from 'lucide-react'


const stats = [
  { label: 'Active Learners', value: '50K+', icon: Users },
  { label: 'Expert Courses', value: '1,200+', icon: BookOpen },
  { label: 'Certificates', value: '30K+', icon: Award },
  { label: 'Completion Rate', value: '94%', icon: TrendingUp },
]

const features = [
  { icon: Zap, title: 'Learn at Your Pace', desc: 'Flexible schedules that fit your life. Pause, rewind, and revisit anytime.', color: '#f97316' },
  { icon: Shield, title: 'Expert Instructors', desc: 'Learn from industry veterans with real-world experience and passion.', color: '#6366f1' },
  { icon: Globe, title: 'Learn Anywhere', desc: 'Access your courses on any device, online or offline, wherever you go.', color: '#10b981' },
  { icon: Award, title: 'Earn Certificates', desc: 'Verifiable certificates that boost your career and showcase your skills.', color: '#8b5cf6' },
]

const testimonials = [
  { name: 'Priya Sharma', role: 'Full Stack Dev', rating: 5, text: "Let's Learn transformed my career. The courses are incredibly well-structured and the instructors are top-notch." },
  { name: 'Rahul Mehta', role: 'Data Scientist', rating: 5, text: 'The best investment I made this year. The progress tracking and interactive lessons kept me motivated throughout.' },
  { name: 'Anjali Singh', role: 'UI/UX Designer', rating: 5, text: 'Incredible learning experience. The badge system and leaderboard made learning competitive and fun!' },
]

const categories = [
  { name: 'Web Development', count: '230+', emoji: '💻', color: '#6366f1' },
  { name: 'Data Science', count: '180+', emoji: '📊', color: '#8b5cf6' },
  { name: 'Design', count: '140+', emoji: '🎨', color: '#ec4899' },
  { name: 'Business', count: '160+', emoji: '📈', color: '#f97316' },
  { name: 'DevOps', count: '90+', emoji: '⚙️', color: '#10b981' },
  { name: 'Mobile Dev', count: '110+', emoji: '📱', color: '#3b82f6' },
]

export default function HomePage() {
  const heroRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (!heroRef.current) return
      const { clientX, clientY } = e
      const { left, top, width, height } = heroRef.current.getBoundingClientRect()
      const x = (clientX - left) / width
      const y = (clientY - top) / height
      heroRef.current.style.setProperty('--mx', `${x * 100}%`)
      heroRef.current.style.setProperty('--my', `${y * 100}%`)
    }
    window.addEventListener('mousemove', handler)
    return () => window.removeEventListener('mousemove', handler)
  }, [])

  return (
    <div style={{ background: 'var(--bg-primary)' }}>

      {/* ── HERO ── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden pt-16"
        style={{
          background: 'var(--bg-primary)',
          '--mx': '50%', '--my': '50%',
        }}>
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="orb w-96 h-96 top-1/4 -left-20" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.4) 0%, transparent 70%)' }} />
          <div className="orb w-80 h-80 top-1/3 right-0" style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.3) 0%, transparent 70%)' }} />
          <div className="orb w-64 h-64 bottom-1/4 left-1/3" style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.2) 0%, transparent 70%)' }} />
          {/* Grid pattern */}
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
            opacity: 0.4,
          }} />
          {/* Mouse spotlight */}
          <div className="absolute inset-0" style={{
            background: `radial-gradient(circle 600px at var(--mx) var(--my), rgba(99,102,241,0.06) 0%, transparent 60%)`,
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-32 grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 animate-fade-up"
              style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
              <Sparkles size={14} style={{ color: 'var(--brand)' }} />
              <span style={{ fontFamily: 'Sora, sans-serif', fontSize: '0.8rem', fontWeight: 600, color: 'var(--brand)' }}>
                New: AI-Powered Learning Paths
              </span>
              <ChevronRight size={12} style={{ color: 'var(--brand)' }} />
            </div>

            <h1 className="animate-fade-up delay-100"
              style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: 'clamp(2.5rem, 5vw, 4rem)', lineHeight: 1.1, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
              Forge Your Skills,{' '}
              <span className="gradient-text">Shape Your Future</span>
            </h1>

            <p className="mt-6 text-lg animate-fade-up delay-200"
              style={{ color: 'var(--text-secondary)', lineHeight: 1.8, maxWidth: '520px' }}>
              Master in-demand skills with expert-led courses. Track your progress, earn badges, and land your dream role.
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-8 animate-fade-up delay-300">
              <Link to="/courses">
                <button className="btn-primary px-8 py-4 rounded-2xl text-base flex items-center gap-2">
                  <span className="relative z-10">Explore Courses</span>
                  <ArrowRight size={18} className="relative z-10" />
                </button>
              </Link>
              <Link to="/register">
                <button className="btn-outline px-8 py-4 rounded-2xl text-base flex items-center gap-2">
                  <Play size={16} fill="currentColor" />
                  Start Free Trial
                </button>
              </Link>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-4 mt-10 animate-fade-up delay-400">
              <div className="flex -space-x-3">
                {['#6366f1', '#8b5cf6', '#ec4899', '#f97316'].map((c, i) => (
                  <div key={i} className="w-9 h-9 rounded-full border-2 flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: c, borderColor: 'var(--bg-primary)', zIndex: 4 - i }}>
                    {['P', 'R', 'A', 'S'][i]}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex gap-0.5">{[...Array(5)].map((_, i) => <span key={i} style={{ color: '#f59e0b', fontSize: '0.85rem' }}>★</span>)}</div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>50,000+ learners trust us</p>
              </div>
            </div>
          </div>

          {/* Right — Floating dashboard card */}
          <div className="relative hidden lg:flex items-center justify-center">
            <div className="animate-float">
              <div className="relative w-[420px]">
                {/* Main card */}
                <div className="rounded-3xl p-6 relative overflow-hidden"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: 'var(--text-primary)' }}>My Progress</h3>
                    <span className="badge" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>ON TRACK</span>
                  </div>
                  {/* Progress bars */}
                  {[
                    { label: 'React Masterclass', pct: 78, color: '#6366f1' },
                    { label: 'Node.js API Design', pct: 45, color: '#8b5cf6' },
                    { label: 'System Design', pct: 62, color: '#ec4899' },
                  ].map(item => (
                    <div key={item.label} className="mb-4">
                      <div className="flex justify-between mb-1">
                        <span style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-secondary)' }}>{item.label}</span>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: item.color }}>{item.pct}%</span>
                      </div>
                      <div style={{ height: 6, borderRadius: 3, background: 'var(--bg-tertiary)' }}>
                        <div style={{ height: '100%', width: `${item.pct}%`, borderRadius: 3, background: `linear-gradient(90deg, ${item.color}, ${item.color}aa)`, transition: 'width 0.8s ease' }} />
                      </div>
                    </div>
                  ))}
                  {/* Streak badge */}
                  <div className="mt-4 flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
                    <span className="text-2xl">🔥</span>
                    <div>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Current Streak</p>
                      <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: '1.2rem', color: '#f97316' }}>12 Days</p>
                    </div>
                    <div className="ml-auto">
                      <span className="badge" style={{ background: 'rgba(249,115,22,0.15)', color: '#f97316' }}>RECORD!</span>
                    </div>
                  </div>
                </div>

                {/* Floating mini cards */}
                <div className="absolute -top-8 -right-8 px-4 py-3 rounded-2xl animate-float"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)', animationDelay: '1s' }}>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🏆</span>
                    <div>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Badge Earned</p>
                      <p style={{ fontSize: '0.8rem', fontWeight: 700, fontFamily: 'Sora, sans-serif', color: 'var(--text-primary)' }}>Top Learner</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-6 -left-8 px-4 py-3 rounded-2xl animate-float"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)', animationDelay: '2s' }}>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">⭐</span>
                    <div>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Rating</p>
                      <p style={{ fontSize: '0.8rem', fontWeight: 700, fontFamily: 'Sora, sans-serif', color: 'var(--text-primary)' }}>4.9 / 5.0</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map(({ label, value, icon: Icon }, i) => (
              <div key={label} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-3"
                  style={{ background: 'var(--bg-tertiary)', color: 'var(--brand)' }}>
                  <Icon size={22} />
                </div>
                <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: '2rem', color: 'var(--text-primary)', lineHeight: 1 }}>{value}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="badge mb-3 inline-block" style={{ background: 'var(--bg-tertiary)', color: 'var(--brand)' }}>EXPLORE</p>
          <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: '2.4rem', color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
            Top Categories
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link key={cat.name} to={`/courses?category=${cat.name}`}>
              <div className="card-hover p-5 rounded-2xl text-center cursor-pointer"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div className="text-3xl mb-3">{cat.emoji}</div>
                <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{cat.name}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{cat.count} courses</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }} className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="badge mb-3 inline-block" style={{ background: 'var(--bg-tertiary)', color: 'var(--brand)' }}>WHY LET'S LEARN</p>
            <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: '2.4rem', color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
              Everything you need to{' '}
              <span className="gradient-text">succeed</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className="card-hover p-6 rounded-2xl"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: `${f.color}20`, color: f.color }}>
                  <f.icon size={24} />
                </div>
                <h3 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{f.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="badge mb-3 inline-block" style={{ background: 'var(--bg-tertiary)', color: 'var(--brand)' }}>STORIES</p>
          <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: '2.4rem', color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
            What our learners say
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="card-hover p-6 rounded-2xl"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div className="flex gap-0.5 mb-4">
                {[...Array(t.rating)].map((_, i) => <span key={i} style={{ color: '#f59e0b' }}>★</span>)}
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                  {t.name[0]}
                </div>
                <div>
                  <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{t.name}</p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center rounded-3xl p-16 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)', boxShadow: '0 30px 80px rgba(99,102,241,0.4)' }}>
          <div className="absolute inset-0" style={{ backgroundImage: 'var(--noise)' }} />
          <p className="relative z-10 badge mb-4 inline-block" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>LIMITED OFFER</p>
          <h2 className="relative z-10" style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: '2.8rem', color: 'white', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            Start Learning Today
          </h2>
          <p className="relative z-10 mt-4 text-lg" style={{ color: 'rgba(255,255,255,0.85)' }}>
            Join 50,000+ learners. Get unlimited access to all courses.
          </p>
          <div className="relative z-10 flex flex-wrap justify-center gap-4 mt-8">
            <Link to="/register">
              <button className="px-8 py-4 rounded-2xl text-base font-bold transition-all hover:scale-105"
                style={{ background: 'white', color: '#6366f1', fontFamily: 'Sora, sans-serif', border: 'none', cursor: 'pointer', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                Get Started Free
              </button>
            </Link>
            <Link to="/courses">
              <button className="px-8 py-4 rounded-2xl text-base font-bold transition-all hover:scale-105"
                style={{ background: 'rgba(255,255,255,0.15)', color: 'white', fontFamily: 'Sora, sans-serif', border: '1.5px solid rgba(255,255,255,0.4)', cursor: 'pointer', backdropFilter: 'blur(10px)' }}>
                Browse Courses
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

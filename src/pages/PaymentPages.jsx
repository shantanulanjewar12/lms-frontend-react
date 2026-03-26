import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom'
import { CreditCard, CheckCircle, Clock, XCircle, ArrowLeft, ShieldCheck, BookOpen } from 'lucide-react'
import { paymentAPI, courseAPI } from '../api'
import { Badge, Button, Skeleton } from '../components/ui/index'
import toast from 'react-hot-toast'

// ──────────────────────────────────────────
// Payment Checkout Page
// ──────────────────────────────────────────
export function PaymentPage() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    courseAPI.getById(courseId)
      .then(r => setCourse(r?.data))
      .catch(() => navigate('/courses'))
      .finally(() => setLoading(false))
  }, [courseId, navigate])

  useEffect(() => {
    const payment = searchParams.get('payment')
    const sessionId = searchParams.get('session_id')

    if (payment !== 'success' || !sessionId) {
      if (payment === 'cancel') {
        toast('Payment cancelled', { icon: 'ℹ️' })
      }
      return
    }

    setProcessing(true)
    paymentAPI.verify(sessionId)
      .then(() => {
        toast.success('Payment successful! Enrolling you...')
        setTimeout(() => navigate(`/learn/${courseId}`), 1200)
      })
      .catch(() => {
        toast.success('Payment received. Enrollment will reflect shortly.')
        setTimeout(() => navigate('/my-learning'), 1200)
      })
      .finally(() => setProcessing(false))
  }, [searchParams, courseId, navigate])

  const handlePay = async () => {
    setProcessing(true)
    try {
      const res = await paymentAPI.initiate({
        courseId: Number(courseId),
        amount: course.price,
        currency: course.currency || 'INR',
      })
      const order = res?.data
      if (!order?.stripeSessionId || !order?.checkoutUrl) {
        toast.error('Payment configuration is incomplete. Please contact support.')
        setProcessing(false)
        return
      }

      window.location.assign(order.checkoutUrl)
    } catch (e) {
      toast.error(e?.message || 'Failed to initiate payment')
      setProcessing(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)', paddingTop: '64px' }}>
      <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--brand)', borderTopColor: 'transparent' }} />
    </div>
  )

  if (!course) return null

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', paddingTop: '80px' }}>
      <div className="max-w-2xl mx-auto px-6 py-12">
        <button onClick={() => navigate(`/courses/${courseId}`)}
          className="flex items-center gap-2 mb-8 text-sm"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif' }}>
          <ArrowLeft size={16} /> Back to course
        </button>

        <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: '2rem', color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
          Complete Purchase
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Secure payment powered by Stripe</p>

        {/* Order Summary */}
        <div className="rounded-2xl p-6 mb-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>
            Order Summary
          </h2>
          <div className="flex items-start gap-4 pb-5" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="w-16 h-16 rounded-xl flex-shrink-0 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #312e81, #4c1d95)' }}>
              <BookOpen size={24} color="rgba(255,255,255,0.8)" />
            </div>
            <div>
              <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{course.title}</p>
              <div className="flex items-center gap-2">
                <Badge variant={course.level === 'BEGINNER' ? 'success' : course.level === 'INTERMEDIATE' ? 'warning' : 'danger'}>
                  {course.level}
                </Badge>
                {course.category && <Badge variant="gray">{course.category}</Badge>}
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                {course.totalLessons || 0} lessons · Lifetime access · Certificate included
              </p>
            </div>
          </div>
          <div className="pt-4 space-y-2">
            <div className="flex justify-between">
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Course Price</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>₹{course.price}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Platform Fee</span>
              <span style={{ color: '#10b981', fontWeight: 600 }}>₹0</span>
            </div>
            <div className="flex justify-between pt-3 mt-1" style={{ borderTop: '1px solid var(--border)' }}>
              <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: 'var(--text-primary)' }}>Total</span>
              <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: '1.3rem', color: 'var(--brand)' }}>₹{course.price}</span>
            </div>
          </div>
        </div>

        {/* Payment Button */}
        <Button variant="primary" size="lg" className="w-full" loading={processing}
          icon={<CreditCard size={18} />}
          onClick={handlePay}>
          Pay ₹{course.price} with Stripe
        </Button>

        {/* Security badges */}
        <div className="flex items-center justify-center gap-6 mt-6">
          {[
            { icon: ShieldCheck, text: 'Secure 256-bit SSL', color: '#10b981' },
            { icon: CheckCircle, text: '30-day Refund', color: '#6366f1' },
          ].map(({ icon: Icon, text, color }) => (
            <div key={text} className="flex items-center gap-1.5">
              <Icon size={15} style={{ color }} />
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{text}</span>
            </div>
          ))}
        </div>

        <p className="text-center mt-4 text-xs" style={{ color: 'var(--text-muted)' }}>
          By completing this purchase you agree to our Terms of Service.
          You will be enrolled immediately after successful payment.
        </p>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────
// Payment History Page
// ──────────────────────────────────────────
export function PaymentHistoryPage() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    paymentAPI.getHistory()
      .then(r => setTransactions(r?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const statusIcon = { SUCCESS: CheckCircle, PENDING: Clock, FAILED: XCircle, REFUNDED: ArrowLeft }
  const statusColor = { SUCCESS: '#10b981', PENDING: '#f59e0b', FAILED: '#ef4444', REFUNDED: '#6366f1' }
  const statusBadge = { SUCCESS: 'success', PENDING: 'warning', FAILED: 'danger', REFUNDED: 'brand' }

  const total = transactions.filter(t => t.status === 'SUCCESS').reduce((s, t) => s + (t.amount || 0), 0)

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', paddingTop: '80px' }}>
      <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-3xl mx-auto px-6 py-10">
          <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: '2.2rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Payment History
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.3rem' }}>
            Total spent: <strong style={{ color: '#10b981', fontFamily: 'Sora, sans-serif' }}>₹{total.toFixed(2)}</strong>
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {loading ? (
          <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-20">
            <CreditCard size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
            <h3 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No transactions yet</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Enroll in a paid course to see payments here</p>
            <Link to="/courses"><Button variant="primary">Browse Courses</Button></Link>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map(t => {
              const SIcon = statusIcon[t.status] || Clock
              const color = statusColor[t.status] || '#6b7280'
              return (
                <div key={t.id} className="flex items-center gap-4 p-5 rounded-2xl"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${color}15`, color }}>
                    <SIcon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                      {t.courseTitle || (t.courseId ? `Course #${t.courseId}` : 'Course')}
                    </p>
                    {t.stripeSessionId && (
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', marginTop: '0.2rem' }}>
                        Session: {t.stripeSessionId}
                      </p>
                    )}
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      {t.createdAt ? new Date(t.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
                      ₹{t.amount}
                    </p>
                    <Badge variant={statusBadge[t.status] || 'gray'}>{t.status}</Badge>
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

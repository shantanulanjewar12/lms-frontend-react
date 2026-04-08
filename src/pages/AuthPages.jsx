import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, GraduationCap, ArrowRight, BookOpen, Briefcase, Shield } from 'lucide-react'
import { Input, Button } from '../components/ui/index'
import { authAPI } from '../api'
import { useAuthStore } from '../store'
import toast from 'react-hot-toast'

function AuthLayout({ children, title, subtitle, illustration }) {
  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-primary)' }}>
      {/* Left Panel */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center p-12"
        style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4c1d95 100%)' }}>
        {/* Orbs */}
        <div className="absolute w-96 h-96 rounded-full top-0 left-0 opacity-30"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.8) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute w-80 h-80 rounded-full bottom-0 right-0 opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.8) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        {/* Grid */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        <div className="relative z-10 max-w-md text-white text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)' }}>
            <GraduationCap size={32} />
          </div>
          <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: '2.5rem', lineHeight: 1.1, letterSpacing: '-0.03em' }}>
            {illustration.heading}
          </h1>
          <p style={{ marginTop: '1rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.7 }}>{illustration.sub}</p>
          <div className="grid grid-cols-3 gap-4 mt-10">
            {illustration.stats.map(s => (
              <div key={s.label} className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
                <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: '1.5rem' }}>{s.value}</p>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.65)' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8" style={{ background: 'var(--bg-primary)' }}>
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              <GraduationCap size={18} color="white" />
            </div>
            <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, color: 'var(--text-primary)' }}>
              Let's <span style={{ color: 'var(--brand)' }}>Learn</span>
            </span>
          </Link>
          <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: '2rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{title}</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: '2rem' }}>{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  )
}

export function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await authAPI.login(form)
      login(res.data.user, res.data.accessToken)
      toast.success(`Welcome back, ${res.data.user.fullName.split(' ')[0]}! 👋`)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err?.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue your learning journey"
      illustration={{
        heading: 'Continue where you left off',
        sub: 'Your progress is saved and waiting for you.',
        stats: [{ value: '50K+', label: 'Learners' }, { value: '94%', label: 'Completion' }, { value: '4.9★', label: 'Rating' }],
      }}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input label="Email" type="email" placeholder="you@example.com"
          icon={<Mail size={16} />}
          value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
        <Input label="Password" type="password" placeholder="Your password"
          icon={<Lock size={16} />}
          value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
        <div className="flex justify-end">
          <Link to="/forgot-password" style={{ fontSize: '0.82rem', color: 'var(--brand)', textDecoration: 'none' }}>Forgot password?</Link>
        </div>
        <Button type="submit" size="lg" loading={loading} className="w-full mt-2">
          Sign In <ArrowRight size={16} />
        </Button>
      </form>
      <p className="text-center mt-6 text-sm" style={{ color: 'var(--text-muted)' }}>
        Don't have an account?{' '}
        <Link to="/register" style={{ color: 'var(--brand)', fontWeight: 600, textDecoration: 'none' }}>Sign up free</Link>
      </p>
    </AuthLayout>
  )
}

export function RegisterPage() {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', role: 'STUDENT' })
  const [otp, setOtp] = useState('')
  const [pendingEmail, setPendingEmail] = useState('')
  const [awaitingOtp, setAwaitingOtp] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const roles = [
    { value: 'STUDENT', label: '🎓 Student — I want to learn', icon: BookOpen },
    { value: 'INSTRUCTOR', label: '🧑‍🏫 Instructor — I want to teach', icon: Briefcase },
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authAPI.register(form)
      setPendingEmail(form.email)
      setAwaitingOtp(true)
      toast.success('Account created. OTP sent to your email.')
    } catch (err) {
      toast.error(err?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    if (!otp.trim()) {
      toast.error('Please enter OTP')
      return
    }
    setLoading(true)
    try {
      const res = await authAPI.verifyOtp({ email: pendingEmail, otp: otp.trim() })
      login(res.data.user, res.data.accessToken)
      toast.success('Email verified successfully. Welcome to Let\'s Learn!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err?.message || 'OTP verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (!pendingEmail) return
    try {
      await authAPI.resendOtp({ email: pendingEmail })
      toast.success('A new OTP has been sent')
    } catch (err) {
      toast.error(err?.message || 'Failed to resend OTP')
    }
  }

  return (
    <AuthLayout
      title="Create account"
      subtitle="Join 50,000+ learners today"
      illustration={{
        heading: 'Start your learning journey today',
        sub: 'Thousands of courses, expert instructors, and a supportive community.',
        stats: [{ value: '1200+', label: 'Courses' }, { value: '200+', label: 'Instructors' }, { value: '30K+', label: 'Certs' }],
      }}>
      {!awaitingOtp ? (
        <>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input label="Full Name" placeholder="Enter Your Name"
              icon={<User size={16} />}
              value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} required />
            <Input label="Email" type="email" placeholder="you@example.com"
              icon={<Mail size={16} />}
              value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            <Input label="Password" type="password" placeholder="Min. 6 characters"
              icon={<Lock size={16} />}
              value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />

            <div>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>I want to...</label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {roles.map(r => (
                  <button key={r.value} type="button"
                    onClick={() => setForm(f => ({ ...f, role: r.value }))}
                    className="p-3 rounded-xl text-left transition-all"
                    style={{
                      background: form.role === r.value ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
                      border: `2px solid ${form.role === r.value ? 'var(--brand)' : 'var(--border)'}`,
                      cursor: 'pointer',
                    }}>
                    <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{r.label}</p>
                  </button>
                ))}
              </div>
            </div>

            <Button type="submit" size="lg" loading={loading} className="w-full mt-2">
              Create Account <ArrowRight size={16} />
            </Button>
          </form>
          <p className="text-center mt-6 text-sm" style={{ color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--brand)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </p>
          <p className="text-center mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
            By signing up, you agree to our Terms of Service and Privacy Policy.
          </p>
        </>
      ) : (
        <>
          <div className="p-4 rounded-xl mb-4" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
            <p style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem' }}>Verify your email</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '0.3rem' }}>
              We sent a 6-digit OTP to {pendingEmail}. Enter it below to complete registration.
            </p>
          </div>
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
            <Input label="OTP" placeholder="Enter 6-digit OTP"
              icon={<Shield size={16} />}
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
              required
            />
            <Button type="submit" size="lg" loading={loading} className="w-full mt-1">
              Verify OTP <ArrowRight size={16} />
            </Button>
          </form>
          <p className="text-center mt-4 text-sm" style={{ color: 'var(--text-muted)' }}>
            Didn\'t receive OTP?{' '}
            <button type="button" onClick={handleResendOtp}
              style={{ color: 'var(--brand)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
              Resend
            </button>
          </p>
          <p className="text-center mt-3 text-sm" style={{ color: 'var(--text-muted)' }}>
            Want to use another email?{' '}
            <button type="button" onClick={() => { setAwaitingOtp(false); setOtp(''); setPendingEmail('') }}
              style={{ color: 'var(--brand)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
              Go back
            </button>
          </p>
        </>
      )}
    </AuthLayout>
  )
}

export function ForgotPasswordPage() {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleRequestOtp = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authAPI.forgotPassword({ email: email.trim() })
      toast.success('If your account exists, a reset OTP has been sent to your email.')
      setStep(2)
    } catch (err) {
      toast.error(err?.message || 'Could not send reset OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authAPI.verifyForgotPasswordOtp({ email: email.trim(), otp: otp.trim() })
      toast.success('OTP verified. You can now set a new password.')
      setStep(3)
    } catch (err) {
      toast.error(err?.message || 'OTP verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      await authAPI.resetForgotPassword({
        email: email.trim(),
        otp: otp.trim(),
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      })
      toast.success('Password reset successful. Please login with your new password.')
      navigate('/login')
    } catch (err) {
      toast.error(err?.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  const resendOtp = async () => {
    setLoading(true)
    try {
      await authAPI.forgotPassword({ email: email.trim() })
      toast.success('A new reset OTP has been sent')
    } catch (err) {
      toast.error(err?.message || 'Could not resend OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Reset password"
      subtitle="Verify your identity and set a new password"
      illustration={{
        heading: 'Secure account recovery',
        sub: 'We use a one-time code sent to your email to verify your password reset request.',
        stats: [{ value: 'OTP', label: 'Email Verification' }, { value: '10m', label: 'OTP Validity' }, { value: 'Safe', label: 'Encrypted Reset' }],
      }}>
      {step === 1 && (
        <form onSubmit={handleRequestOtp} className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            icon={<Mail size={16} />}
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <Button type="submit" size="lg" loading={loading} className="w-full mt-1">
            Send Reset OTP <ArrowRight size={16} />
          </Button>
        </form>
      )}

      {step === 2 && (
        <>
          <div className="p-4 rounded-xl mb-4" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
            <p style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem' }}>Check your inbox</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '0.3rem' }}>
              We sent a 6-digit password reset OTP to {email}.
            </p>
          </div>
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
            <Input
              label="OTP"
              placeholder="Enter 6-digit OTP"
              icon={<Shield size={16} />}
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
              required
            />
            <Button type="submit" size="lg" loading={loading} className="w-full mt-1">
              Verify OTP <ArrowRight size={16} />
            </Button>
          </form>
          <p className="text-center mt-4 text-sm" style={{ color: 'var(--text-muted)' }}>
            Didn\'t receive OTP?{' '}
            <button type="button" onClick={resendOtp}
              style={{ color: 'var(--brand)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
              Resend
            </button>
          </p>
        </>
      )}

      {step === 3 && (
        <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
          <Input
            label="New Password"
            type="password"
            placeholder="Enter new password"
            icon={<Lock size={16} />}
            value={passwordForm.newPassword}
            onChange={e => setPasswordForm(f => ({ ...f, newPassword: e.target.value }))}
            required
          />
          <Input
            label="Confirm Password"
            type="password"
            placeholder="Confirm new password"
            icon={<Lock size={16} />}
            value={passwordForm.confirmPassword}
            onChange={e => setPasswordForm(f => ({ ...f, confirmPassword: e.target.value }))}
            required
          />
          <Button type="submit" size="lg" loading={loading} className="w-full mt-1">
            Reset Password <ArrowRight size={16} />
          </Button>
        </form>
      )}

      <p className="text-center mt-6 text-sm" style={{ color: 'var(--text-muted)' }}>
        Back to{' '}
        <Link to="/login" style={{ color: 'var(--brand)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
      </p>
    </AuthLayout>
  )
}

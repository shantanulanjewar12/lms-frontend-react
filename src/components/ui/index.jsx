import React, { useState, useRef, useEffect } from 'react'
import { X, Eye, EyeOff, Star, ChevronDown } from 'lucide-react'

// ── Button ──
export function Button({ children, variant = 'primary', size = 'md', className = '', loading, icon, ...props }) {
  const sizes = { sm: 'px-4 py-2 text-sm rounded-xl', md: 'px-6 py-2.5 text-sm rounded-xl', lg: 'px-8 py-3.5 text-base rounded-2xl' }
  const variants = {
    primary: 'btn-primary',
    outline: 'btn-outline',
    ghost: 'btn-ghost',
    danger: 'bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500 hover:text-white font-semibold rounded-xl cursor-pointer transition-all',
    success: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 hover:bg-emerald-500 hover:text-white font-semibold rounded-xl cursor-pointer transition-all',
  }
  return (
    <button
      className={`${variants[variant]} ${sizes[size]} ${className} inline-flex items-center justify-center gap-2 relative overflow-hidden`}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : icon}
      <span className="relative z-10">{children}</span>
    </button>
  )
}

// ── Card ──
export function Card({ children, className = '', hover = false, glass = false, ...props }) {
  return (
    <div
      className={`rounded-2xl border p-6 ${hover ? 'card-hover cursor-pointer' : ''} ${glass ? 'glass' : ''} ${className}`}
      style={{
        background: glass ? 'var(--bg-glass)' : 'var(--bg-card)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
      }}
      {...props}
    >
      {children}
    </div>
  )
}

// ── Input ──
export function Input({ label, error, icon, type = 'text', className = '', ...props }) {
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'

  return (
    <div className="flex flex-col gap-1.5">
      {label && <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>{label}</label>}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>{icon}</div>
        )}
        <input
          type={isPassword ? (show ? 'text' : 'password') : type}
          className={`input-field px-4 py-3 rounded-xl ${icon ? 'pl-10' : ''} ${isPassword ? 'pr-10' : ''} ${className}`}
          {...props}
        />
        {isPassword && (
          <button type="button" onClick={() => setShow(s => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 btn-ghost p-1 rounded-lg"
            style={{ color: 'var(--text-muted)' }}>
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && <p style={{ color: 'var(--danger)', fontSize: '0.78rem' }}>{error}</p>}
    </div>
  )
}

// ── Select ──
export function Select({ label, options = [], error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>{label}</label>}
      <div className="relative">
        <select
          className={`input-field px-4 py-3 rounded-xl pr-10 appearance-none ${className}`}
          {...props}
        >
          {options.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
      </div>
      {error && <p style={{ color: 'var(--danger)', fontSize: '0.78rem' }}>{error}</p>}
    </div>
  )
}

// ── Textarea ──
export function Textarea({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>{label}</label>}
      <textarea className={`input-field px-4 py-3 rounded-xl resize-none ${className}`} rows={4} {...props} />
      {error && <p style={{ color: 'var(--danger)', fontSize: '0.78rem' }}>{error}</p>}
    </div>
  )
}

// ── Badge ──
export function Badge({ children, variant = 'brand', className = '' }) {
  const variants = {
    brand: 'bg-brand-500/15 text-brand-600',
    success: 'bg-emerald-500/15 text-emerald-600',
    warning: 'bg-amber-500/15 text-amber-600',
    danger: 'bg-red-500/15 text-red-600',
    gray: 'bg-gray-500/10 text-gray-500',
    purple: 'bg-purple-500/15 text-purple-600',
    orange: 'bg-orange-500/15 text-orange-600',
  }
  return (
    <span className={`badge ${variants[variant]} ${className}`}>{children}</span>
  )
}

// ── Modal ──
export function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`${sizes[size]} w-full rounded-2xl animate-fade-up`}
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.2rem' }}>{title}</h2>
          <button onClick={onClose} className="btn-ghost w-8 h-8 rounded-lg flex items-center justify-center"><X size={18} /></button>
        </div>
        <div className="px-6 py-5" style={{ overflowY: 'auto' }}>{children}</div>
      </div>
    </div>
  )
}

// ── Skeleton ──
export function Skeleton({ className = '' }) {
  return <div className={`skeleton rounded-xl ${className}`} />
}

// ── Star Rating ──
export function StarRating({ value, onChange, readonly = false }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <button key={s} type="button"
          onClick={() => !readonly && onChange?.(s)}
          onMouseEnter={() => !readonly && setHover(s)}
          onMouseLeave={() => !readonly && setHover(0)}
          className={`star ${(hover || value) >= s ? 'active' : ''}`}
          style={{ background: 'none', border: 'none', fontSize: '1.4rem' }}>
          ★
        </button>
      ))}
    </div>
  )
}

// ── Progress ──
export function Progress({ value = 0, className = '' }) {
  return (
    <div className={`progress-bar ${className}`}>
      <div className="progress-fill" style={{ width: `${Math.min(100, value)}%` }} />
    </div>
  )
}

// ── Avatar ──
export function Avatar({ name, src, size = 'md' }) {
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-base', xl: 'w-20 h-20 text-xl' }
  const initials = name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'
  const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f97316', '#10b981', '#3b82f6']
  const color = colors[name?.charCodeAt(0) % colors.length] || colors[0]

  return (
    <div className={`${sizes[size]} rounded-full flex items-center justify-center font-bold overflow-hidden flex-shrink-0`}
      style={{ background: src ? 'transparent' : color, color: 'white' }}>
      {src ? <img src={src} alt={name} className="w-full h-full object-cover" /> : initials}
    </div>
  )
}

// ── Tabs ──
export function Tabs({ tabs, activeTab, onTabChange }) {
  return (
    <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
      {tabs.map(t => (
        <button key={t.value} onClick={() => onTabChange(t.value)}
          className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
          style={{
            fontFamily: 'Sora, sans-serif',
            background: activeTab === t.value ? 'var(--brand)' : 'transparent',
            color: activeTab === t.value ? 'white' : 'var(--text-secondary)',
          }}>
          {t.label}
        </button>
      ))}
    </div>
  )
}

// ── Empty State ──
export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
        style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
        {icon}
      </div>
      <div>
        <h3 className="font-display text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{title}</h3>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{description}</p>
      </div>
      {action}
    </div>
  )
}

import React from 'react'
import { Link } from 'react-router-dom'
import { GraduationCap, Github, Twitter, Linkedin, Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>
                <GraduationCap size={22} color="white" />
              </div>
                <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: '1.3rem', color: 'var(--text-primary)' }}>
                Let's <span style={{ color: 'var(--brand)' }}>Learn</span>
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: '320px', fontSize: '0.9rem' }}>
              Build your future with world-class courses. Learn at your pace, track your progress, and grow every day.
            </p>
            <div className="flex gap-3 mt-6">
              {[Github, Twitter, Linkedin].map((Icon, i) => (
                <a key={i} href="#"
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                  style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>Platform</h4>
            <ul className="space-y-2.5">
              {['Browse Courses', 'Become Instructor', 'Pricing', 'Blog'].map(item => (
                <li key={item}>
                  <Link to="/courses" style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.target.style.color = 'var(--brand)'}
                    onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>Support</h4>
            <ul className="space-y-2.5">
              {['Help Center', 'Community', 'Privacy Policy', 'Terms of Service'].map(item => (
                <li key={item}>
                  <a href="#" style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.target.style.color = 'var(--brand)'}
                    onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4"
          style={{ borderTop: '1px solid var(--border)' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            © 2025 Let's Learn. All rights reserved.
          </p>
          <p className="flex items-center gap-1" style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            Made with <Heart size={12} style={{ color: '#ef4444' }} fill="#ef4444" /> for learners everywhere
          </p>
        </div>
      </div>
    </footer>
  )
}

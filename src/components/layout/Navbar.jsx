import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Bell, LogOut, User, BarChart3, Menu, X, ChevronDown, GraduationCap, Award, CreditCard, BookOpen, Trophy } from 'lucide-react'
import { useAuthStore } from '../../store'
import ThemeToggle from '../ui/ThemeToggle'
import { Avatar } from '../ui/index'
import { notificationAPI } from '../../api'

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const userAvatar = user?.profilePicUrl || user?.profilePic || null
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [scrolled, setScrolled] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) { setProfileOpen(false); setNotifOpen(false) } }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  useEffect(() => {
    if (isAuthenticated) notificationAPI.getMy().then(r => setNotifications(r?.data || [])).catch(() => {})
  }, [isAuthenticated])

  const handleLogout = () => { logout(); navigate('/') }

  const roleLinks = {
    STUDENT:    [{ to: '/dashboard', label: 'Dashboard' }, { to: '/courses', label: 'Courses' }, { to: '/my-learning', label: 'My Learning' }, { to: '/leaderboard', label: 'Leaderboard' }],
    INSTRUCTOR: [{ to: '/dashboard', label: 'Dashboard' }, { to: '/courses', label: 'Browse' }, { to: '/instructor/courses', label: 'My Courses' }, { to: '/instructor/analytics', label: 'Analytics' }],
    ADMIN:      [{ to: '/dashboard', label: 'Dashboard' }, { to: '/admin/users', label: 'Users' }, { to: '/admin/payments', label: 'Payments' }, { to: '/admin/analytics', label: 'Analytics' }],
  }

  const profileMenuItems = {
    STUDENT: [
      { to: '/profile', icon: User, label: 'Profile' },
      { to: '/my-analytics', icon: BarChart3, label: 'My Analytics' },
      { to: '/badges', icon: Award, label: 'Badges & Streaks' },
      { to: '/payments', icon: CreditCard, label: 'Payment History' },
    ],
    INSTRUCTOR: [
      { to: '/profile', icon: User, label: 'Profile' },
      { to: '/instructor/analytics', icon: BarChart3, label: 'Analytics' },
    ],
    ADMIN: [
      { to: '/profile', icon: User, label: 'Profile' },
      { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
    ],
  }

  const links = isAuthenticated ? (roleLinks[user?.role] || []) : []
  const menuItems = isAuthenticated ? (profileMenuItems[user?.role] || []) : []
  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 transition-all duration-300"
      style={{
        background: (scrolled || !isAuthenticated) ? 'var(--bg-glass)' : 'transparent',
        backdropFilter: (scrolled || !isAuthenticated) ? 'blur(20px)' : 'none',
        borderBottom: (scrolled || !isAuthenticated) ? '1px solid var(--border)' : '1px solid transparent',
        boxShadow: (scrolled || !isAuthenticated) ? 'var(--shadow-sm)' : 'none',
      }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
              style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>
              <GraduationCap size={20} color="white" />
            </div>
            <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Let's <span style={{ color: 'var(--brand)' }}>Learn</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map(l => (
              <Link key={l.to} to={l.to}
                className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
                style={{ fontFamily: 'Sora, sans-serif', color: location.pathname === l.to ? 'var(--brand)' : 'var(--text-secondary)', background: location.pathname === l.to ? 'var(--bg-tertiary)' : 'transparent' }}>
                {l.label}
              </Link>
            ))}
            {!isAuthenticated && (
              <>
                <Link to="/courses" className="px-4 py-2 rounded-xl text-sm font-semibold" style={{ fontFamily: 'Sora, sans-serif', color: 'var(--text-secondary)' }}>Explore</Link>
                <Link to="/leaderboard" className="px-4 py-2 rounded-xl text-sm font-semibold" style={{ fontFamily: 'Sora, sans-serif', color: 'var(--text-secondary)' }}>Leaderboard</Link>
              </>
            )}
          </div>

          {/* Right */}
          <div className="flex items-center gap-2" ref={ref}>
            <ThemeToggle />

            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <div className="relative">
                  <button onClick={() => { setNotifOpen(o => !o); setProfileOpen(false) }}
                    className="w-10 h-10 rounded-xl flex items-center justify-center relative transition-all hover:scale-110"
                    style={{ background: 'var(--bg-tertiary)', border: '1.5px solid var(--border)', color: 'var(--text-secondary)' }}>
                    <Bell size={18} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-white flex items-center justify-center"
                        style={{ background: 'var(--brand)', fontSize: '0.65rem', fontWeight: 700 }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                  {notifOpen && (
                    <div className="absolute right-0 mt-2 w-80 rounded-2xl overflow-hidden animate-fade-up"
                      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
                      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
                        <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: 'var(--text-primary)' }}>Notifications</p>
                        <Link to="/notifications" onClick={() => setNotifOpen(false)} style={{ fontSize: '0.78rem', color: 'var(--brand)', fontWeight: 600, textDecoration: 'none' }}>View all</Link>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <p className="text-center py-8 text-sm" style={{ color: 'var(--text-muted)' }}>All caught up!</p>
                        ) : notifications.slice(0, 5).map(n => (
                          <div key={n.id} className="px-4 py-3"
                            style={{ borderBottom: '1px solid var(--border)', background: !n.isRead ? 'var(--bg-tertiary)' : 'transparent' }}>
                            <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{n.subject}</p>
                            <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>{n.body}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile */}
                <button onClick={() => { setProfileOpen(o => !o); setNotifOpen(false) }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all hover:scale-105"
                  style={{ background: 'var(--bg-tertiary)', border: '1.5px solid var(--border)' }}>
                  <Avatar name={user?.fullName} src={userAvatar} size="sm" />
                  <span className="text-sm font-semibold hidden md:block" style={{ fontFamily: 'Sora, sans-serif', color: 'var(--text-primary)', maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.fullName?.split(' ')[0]}
                  </span>
                  <ChevronDown size={14} style={{ color: 'var(--text-muted)', transition: 'transform 0.2s', transform: profileOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
                </button>

                {profileOpen && (
                  <div className="absolute right-4 top-16 w-60 rounded-2xl overflow-hidden animate-fade-up z-50"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
                    <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
                      <p className="text-sm font-bold truncate" style={{ fontFamily: 'Sora, sans-serif', color: 'var(--text-primary)' }}>{user?.fullName}</p>
                      <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
                      <span className="badge mt-1 inline-block" style={{ background: 'var(--bg-tertiary)', color: 'var(--brand)', fontSize: '0.62rem' }}>{user?.role}</span>
                    </div>
                    <div className="p-2">
                      {menuItems.map(item => (
                        <Link key={item.to} to={item.to} onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all btn-ghost w-full"
                          style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                          <item.icon size={15} /> {item.label}
                        </Link>
                      ))}
                      <Link to="/notifications" onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all btn-ghost w-full"
                        style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                        <Bell size={15} /> Notifications
                        {unreadCount > 0 && <span className="ml-auto w-5 h-5 rounded-full text-white flex items-center justify-center" style={{ background: 'var(--brand)', fontSize: '0.6rem', fontWeight: 700 }}>{unreadCount}</span>}
                      </Link>
                      <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }} />
                      <button onClick={handleLogout}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm w-full text-left transition-all"
                        style={{ color: 'var(--danger)', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <LogOut size={15} /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login"><button className="btn-outline px-5 py-2 rounded-xl text-sm">Sign In</button></Link>
              </div>
            )}

            {/* Mobile toggle */}
            <button className="md:hidden btn-ghost w-10 h-10 rounded-xl flex items-center justify-center" onClick={() => setMobileOpen(o => !o)}>
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden py-4 animate-fade-up" style={{ borderTop: '1px solid var(--border)' }}>
            {links.map(l => (
              <Link key={l.to} to={l.to} onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 rounded-xl text-sm font-semibold mb-1 transition-all"
                style={{ fontFamily: 'Sora, sans-serif', color: 'var(--text-secondary)', background: location.pathname === l.to ? 'var(--bg-tertiary)' : 'transparent', textDecoration: 'none' }}>
                {l.label}
              </Link>
            ))}
            {!isAuthenticated && (
              <div className="flex gap-2 mt-3 px-4">
                <Link to="/login" className="flex-1"><button className="btn-outline w-full px-4 py-2 rounded-xl text-sm">Sign In</button></Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

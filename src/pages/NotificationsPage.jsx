import React, { useState, useEffect } from 'react'
import { Bell, CheckCheck, BookOpen, Award, RefreshCw, Info } from 'lucide-react'
import { notificationAPI } from '../api'
import { Badge, Button, Skeleton, EmptyState } from '../components/ui/index'
import { Tabs } from '../components/ui/index'
import toast from 'react-hot-toast'

const typeIcon = { ENROLLMENT: BookOpen, BADGE: Award, COURSE_UPDATE: RefreshCw, REMINDER: Info }
const typeBadge = { ENROLLMENT: 'brand', BADGE: 'warning', COURSE_UPDATE: 'purple', REMINDER: 'gray' }
const typeColor = { ENROLLMENT: '#6366f1', BADGE: '#f59e0b', COURSE_UPDATE: '#8b5cf6', REMINDER: '#6b7280' }

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('all')

  useEffect(() => { loadNotifications() }, [])

  const loadNotifications = async () => {
    setLoading(true)
    try {
      const res = await notificationAPI.getMy()
      setNotifications(res?.data || [])
    } catch (e) { toast.error('Could not load notifications') }
    finally { setLoading(false) }
  }

  const markRead = async (id) => {
    try {
      await notificationAPI.markRead(id)
      setNotifications(ns => ns.map(n => n.id === id ? { ...n, isRead: true } : n))
    } catch (e) { toast.error('Failed to mark as read') }
  }

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.isRead)
    await Promise.allSettled(unread.map(n => notificationAPI.markRead(n.id)))
    setNotifications(ns => ns.map(n => ({ ...n, isRead: true })))
    toast.success('All marked as read')
  }

  const filtered = notifications.filter(n => {
    if (tab === 'unread') return !n.isRead
    if (tab === 'read') return n.isRead
    return true
  })

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', paddingTop: '80px' }}>
      {/* Header */}
      <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-3xl mx-auto px-6 py-10">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: '2.2rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                Notifications
              </h1>
              <p style={{ color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                {unreadCount > 0 ? <><strong style={{ color: 'var(--brand)' }}>{unreadCount}</strong> unread</> : 'All caught up!'}
              </p>
            </div>
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" icon={<CheckCheck size={14} />} onClick={markAllRead}>
                Mark all read
              </Button>
            )}
          </div>
          <div className="mt-5">
            <Tabs
              tabs={[
                { label: `All (${notifications.length})`, value: 'all' },
                { label: `Unread (${unreadCount})`, value: 'unread' },
                { label: `Read (${notifications.length - unreadCount})`, value: 'read' },
              ]}
              activeTab={tab}
              onTabChange={setTab}
            />
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20" />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Bell size={28} />}
            title="No notifications"
            description={tab === 'unread' ? "You're all caught up!" : "Nothing here yet"}
          />
        ) : (
          <div className="space-y-2">
            {filtered.map(n => {
              const Icon = typeIcon[n.type] || Bell
              const color = typeColor[n.type] || '#6366f1'
              return (
                <div key={n.id}
                  className="flex items-start gap-4 p-4 rounded-2xl transition-all cursor-pointer"
                  style={{
                    background: n.isRead ? 'var(--bg-card)' : 'var(--bg-tertiary)',
                    border: `1px solid ${n.isRead ? 'var(--border)' : 'var(--border-hover)'}`,
                  }}
                  onClick={() => !n.isRead && markRead(n.id)}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${color}20`, color }}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <p style={{ fontWeight: n.isRead ? 500 : 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                        {n.subject || 'Notification'}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant={typeBadge[n.type] || 'gray'}>{n.type?.replace('_', ' ')}</Badge>
                        {!n.isRead && (
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: 'var(--brand)' }} />
                        )}
                      </div>
                    </div>
                    {n.body && (
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.25rem', lineHeight: 1.5 }}>
                        {n.body}
                      </p>
                    )}
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                      {n.sentAt ? new Date(n.sentAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                      {!n.isRead && <span style={{ marginLeft: '0.5rem', color: 'var(--brand)', fontWeight: 600 }}>· Click to mark read</span>}
                    </p>
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

import React, { useState, useEffect } from 'react'
import { Users, DollarSign, Search, UserCheck, UserX, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { userAPI, paymentAPI } from '../api'
import { Badge, Button, Avatar, Skeleton, Tabs } from '../components/ui/index'
import toast from 'react-hot-toast'

// ── Admin Users ──
export function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)
  const [tab, setTab] = useState('all')

  useEffect(() => {
    loadUsers()
  }, [page, search, tab])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const role = tab === 'all' ? '' : tab.toUpperCase()
      const res = await userAPI.getAllUsers(page, 10, search, role)
      const data = res?.data
      if (data?.content) {
        setUsers(data.content)
        setTotalPages(data.totalPages || 1)
        setTotalUsers(data.totalElements ?? data.content.length)
      } else if (Array.isArray(data)) {
        setUsers(data)
        setTotalPages(1)
        setTotalUsers(data.length)
      } else {
        setUsers([])
        setTotalPages(1)
        setTotalUsers(0)
      }
    } catch (e) {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusToggle = async (user) => {
    const newStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'
    try {
      await userAPI.updateStatus(user.id, newStatus)
      setUsers(us => us.map(u => u.id === user.id ? { ...u, status: newStatus } : u))
      toast.success(`User ${newStatus === 'ACTIVE' ? 'activated' : 'suspended'}`)
    } catch (e) {
      toast.error('Status update failed')
    }
  }

  const handleDelete = async (userId) => {
    if (!window.confirm('Delete this user permanently?')) return
    try {
      await userAPI.deleteUser(userId)
      setUsers(us => us.filter(u => u.id !== userId))
      toast.success('User deleted')
    } catch (e) {
      toast.error('Delete failed')
    }
  }

  const filtered = users

  const roleColors = { STUDENT: 'brand', INSTRUCTOR: 'purple', ADMIN: 'danger' }
  const statusColors = { ACTIVE: 'success', INACTIVE: 'gray', SUSPENDED: 'danger' }

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', paddingTop: '80px' }}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: '2rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              User Management
            </h1>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>{totalUsers} total users</p>
          </div>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input className="input-field pl-9 pr-4 py-2.5 rounded-xl text-sm" placeholder="Search users..."
              style={{ width: '250px' }} value={search} onChange={e => {
                setSearch(e.target.value)
                setPage(0)
              }} />
          </div>
        </div>

        {/* Role tabs */}
        <div className="mb-6">
          <Tabs
            tabs={[
              { label: 'All Users', value: 'all' },
              { label: 'Students', value: 'student' },
              { label: 'Instructors', value: 'instructor' },
              { label: 'Admins', value: 'admin' },
            ]}
            activeTab={tab}
            onTabChange={(next) => {
              setTab(next)
              setPage(0)
            }}
          />
        </div>

        {/* Table */}
        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          {/* Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3"
            style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
            {['User', 'Role', 'Status', 'Joined', 'Actions'].map((h, i) => (
              <div key={h} className={i === 0 ? 'col-span-4' : i === 4 ? 'col-span-2' : 'col-span-2'}
                style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'Sora, sans-serif' }}>
                {h}
              </div>
            ))}
          </div>

          {loading ? (
            <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center" style={{ color: 'var(--text-muted)' }}>No users found</div>
          ) : (
            filtered.map((user, i) => (
              <div key={user.id} className="grid grid-cols-12 gap-4 items-center px-6 py-4"
                style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none', background: i % 2 === 0 ? 'transparent' : 'var(--bg-secondary)' }}>
                {/* User */}
                <div className="col-span-4 flex items-center gap-3">
                  <Avatar name={user.fullName} size="sm" />
                  <div className="min-w-0">
                    <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }} className="truncate">{user.fullName}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }} className="truncate">{user.email}</p>
                  </div>
                </div>
                {/* Role */}
                <div className="col-span-2">
                  <Badge variant={roleColors[user.role] || 'gray'}>{user.role}</Badge>
                </div>
                {/* Status */}
                <div className="col-span-2">
                  <Badge variant={statusColors[user.status] || 'gray'}>{user.status}</Badge>
                </div>
                {/* Joined */}
                <div className="col-span-2">
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                  </p>
                </div>
                {/* Actions */}
                <div className="col-span-2 flex items-center gap-2">
                  <button onClick={() => handleStatusToggle(user)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                    style={{
                      background: user.status === 'ACTIVE' ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                      color: user.status === 'ACTIVE' ? '#ef4444' : '#10b981',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                    title={user.status === 'ACTIVE' ? 'Suspend' : 'Activate'}>
                    {user.status === 'ACTIVE' ? <UserX size={14} /> : <UserCheck size={14} />}
                  </button>
                  <button onClick={() => handleDelete(user.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                    style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', cursor: 'pointer' }}
                    title="Delete user">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-8">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-40"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', cursor: page === 0 ? 'not-allowed' : 'pointer', color: 'var(--text-secondary)' }}>
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontFamily: 'Sora, sans-serif', fontWeight: 600 }}>
              Page {page + 1} of {totalPages}
            </span>
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-40"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer', color: 'var(--text-secondary)' }}>
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Admin Payments ──
export function AdminPaymentsPage() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    paymentAPI.getAllAdmin(page)
      .then(r => {
        const data = r?.data
        setTransactions(data?.content || data || [])
        setTotalPages(data?.totalPages || 1)
      })
      .catch(() => toast.error('Failed to load transactions'))
      .finally(() => setLoading(false))
  }, [page])

  const total = transactions.filter(t => t.status === 'SUCCESS').reduce((sum, t) => sum + (t.amount || 0), 0)

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', paddingTop: '80px' }}>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: '2rem', color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
          Payment Transactions
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Total revenue: <strong style={{ color: '#10b981', fontFamily: 'Sora, sans-serif' }}>₹{total.toFixed(2)}</strong>
        </p>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Transactions', value: transactions.length, color: '#6366f1' },
            { label: 'Successful', value: transactions.filter(t => t.status === 'SUCCESS').length, color: '#10b981' },
            { label: 'Pending / Failed', value: transactions.filter(t => t.status !== 'SUCCESS').length, color: '#f97316' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl p-5"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: '2rem', color: s.color }}>{s.value}</p>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{s.label}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="grid grid-cols-12 gap-4 px-6 py-3"
            style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
            {['ID', 'Student', 'Course', 'Amount', 'Status', 'Date'].map((h, i) => (
              <div key={h} className={i < 2 ? 'col-span-2' : 'col-span-2'}
                style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'Sora, sans-serif' }}>
                {h}
              </div>
            ))}
          </div>

          {loading ? (
            <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
          ) : transactions.length === 0 ? (
            <p className="py-12 text-center" style={{ color: 'var(--text-muted)' }}>No transactions yet</p>
          ) : (
            transactions.map((t, i) => (
              <div key={t.id} className="grid grid-cols-12 gap-4 items-center px-6 py-4"
                style={{ borderBottom: i < transactions.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div className="col-span-2">
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: 'var(--text-muted)' }}>#{t.id}</span>
                </div>
                <div className="col-span-2">
                  <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {t.studentName || (t.studentId ? `Student #${t.studentId}` : 'Student')}
                  </p>
                </div>
                <div className="col-span-2">
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {t.courseTitle || (t.courseId ? `Course #${t.courseId}` : 'Course')}
                  </p>
                </div>
                <div className="col-span-2">
                  <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: 'var(--text-primary)' }}>₹{t.amount}</p>
                </div>
                <div className="col-span-2">
                  <Badge variant={t.status === 'SUCCESS' ? 'success' : t.status === 'PENDING' ? 'warning' : 'danger'}>
                    {t.status}
                  </Badge>
                </div>
                <div className="col-span-2">
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : '—'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-8">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
              className="w-9 h-9 rounded-xl flex items-center justify-center disabled:opacity-40"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text-secondary)' }}>
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontSize: '0.875rem', fontFamily: 'Sora, sans-serif', fontWeight: 600, color: 'var(--text-secondary)' }}>
              {page + 1} / {totalPages}
            </span>
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
              className="w-9 h-9 rounded-xl flex items-center justify-center disabled:opacity-40"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text-secondary)' }}>
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

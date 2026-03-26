import React, { useState } from 'react'
import { Camera, Save, User, Mail, BookOpen, Award, Flame } from 'lucide-react'
import { useAuthStore } from '../store'
import { userAPI } from '../api'
import { Avatar, Button, Input, Textarea, Badge } from '../components/ui/index'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore()
  const profileImage = user?.profilePicUrl || user?.profilePic || null
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    bio: user?.bio || '',
  })
  const [profileFile, setProfileFile] = useState(null)
  const [saving, setSaving] = useState(false)

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...form }
      if (profileFile) {
        const uploadRes = await userAPI.uploadProfilePicture(profileFile)
        const uploadedUrl = uploadRes?.data
        updateUser({ profilePicUrl: uploadedUrl, profilePic: uploadedUrl })
      }
      const res = await userAPI.updateMe(payload)
      updateUser(res?.data)
      toast.success('Profile updated!')
    } catch (e) {
      toast.error(e?.message || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  const roleColors = { STUDENT: '#6366f1', INSTRUCTOR: '#8b5cf6', ADMIN: '#ef4444' }
  const roleEmojis = { STUDENT: '🎓', INSTRUCTOR: '🧑‍🏫', ADMIN: '⚙️' }

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', paddingTop: '80px' }}>
      {/* Banner */}
      <div style={{ height: '180px', background: 'linear-gradient(135deg, #312e81 0%, #4c1d95 50%, #6b21a8 100%)', position: 'relative' }}>
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '30px 30px',
        }} />
      </div>

      <div className="max-w-4xl mx-auto px-6">
        {/* Avatar + name */}
        <div className="flex items-end gap-5 -mt-12 mb-8 flex-wrap">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl border-4 overflow-hidden flex items-center justify-center"
              style={{ borderColor: 'var(--bg-primary)', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              {profileImage
                ? <img src={profileImage} alt="" className="w-full h-full object-cover" />
                : <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: '2rem', color: 'white' }}>
                    {user?.fullName?.[0]?.toUpperCase()}
                  </span>
              }
            </div>
          </div>
          <div className="pb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: '1.6rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                {user?.fullName}
              </h1>
              <span style={{ fontSize: '1.2rem' }}>{roleEmojis[user?.role]}</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.2rem' }}>{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={user?.role === 'ADMIN' ? 'danger' : user?.role === 'INSTRUCTOR' ? 'purple' : 'brand'}>
                {user?.role}
              </Badge>
              <Badge variant={user?.status === 'ACTIVE' ? 'success' : 'danger'}>{user?.status}</Badge>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 pb-12">
          {/* Edit Form */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
                Edit Profile
              </h2>
              <form onSubmit={handleSave} className="space-y-4">
                <Input label="Full Name" icon={<User size={16} />}
                  value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} />
                <div>
                  <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500, display: 'block', marginBottom: '0.5rem' }}>
                    Profile Picture
                  </label>
                  <label className="flex items-center gap-2 px-4 py-3 rounded-xl cursor-pointer"
                    style={{ background: 'var(--bg-secondary)', border: '1.5px dashed var(--border)', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    <Camera size={16} />
                    {profileFile ? profileFile.name : 'Upload profile image'}
                    <input type="file" accept="image/*" className="hidden" onChange={e => setProfileFile(e.target.files?.[0] || null)} />
                  </label>
                </div>
                <Textarea label="Bio" placeholder="Tell us a bit about yourself..."
                  value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={4} />
                <div className="flex justify-end pt-2">
                  <Button type="submit" variant="primary" loading={saving} icon={<Save size={16} />}>
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Account Info */}
          <div className="space-y-4">
            <div className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <h3 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>
                Account Info
              </h3>
              <div className="space-y-4">
                {[
                  { icon: User, label: 'User ID', value: `#${user?.id}` },
                  { icon: Mail, label: 'Email', value: user?.email },
                  { icon: BookOpen, label: 'Role', value: user?.role },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: 'var(--bg-tertiary)', color: 'var(--brand)' }}>
                      <Icon size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>{label}</p>
                      <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', wordBreak: 'break-word', overflowWrap: 'break-word' }}>{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Account since */}
            <div className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <h3 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                Member since
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Recently joined'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

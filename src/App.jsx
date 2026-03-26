import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useThemeStore } from './store'

import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import ProtectedRoute from './components/layout/ProtectedRoute'

import HomePage from './pages/HomePage'
import { LoginPage, RegisterPage, ForgotPasswordPage } from './pages/AuthPages'
import CoursesPage from './pages/CoursesPage'
import CourseDetailPage from './pages/CourseDetailPage'
import DashboardPage from './pages/DashboardPage'
import MyLearningPage from './pages/MyLearningPage'
import LearnPage from './pages/LearnPage'
import { InstructorCoursesPage, CourseFormPage } from './pages/InstructorPages'
import { AdminUsersPage, AdminPaymentsPage } from './pages/AdminPages'
import ProfilePage from './pages/ProfilePage'
import { StudentAnalyticsPage, InstructorAnalyticsPage, AdminAnalyticsPage } from './pages/AnalyticsPages'
import NotificationsPage from './pages/NotificationsPage'
import LeaderboardPage from './pages/LeaderboardPage'
import { PaymentPage, PaymentHistoryPage } from './pages/PaymentPages'
import BadgesPage from './pages/BadgesPage'

const NO_FOOTER_ROUTES = ['/learn/', '/login', '/register', '/forgot-password']
const NO_NAVBAR_ROUTES = ['/learn/', '/login', '/register', '/forgot-password']

function NotFoundPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', paddingTop: '64px' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '6rem', lineHeight: 1, marginBottom: '1rem' }}>🔍</div>
        <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: '5rem', color: 'var(--brand)', lineHeight: 1 }}>404</p>
        <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.5rem', color: 'var(--text-primary)', margin: '1rem 0 0.5rem' }}>Page Not Found</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>The page you are looking for does not exist.</p>
        <a href="/" style={{ display: 'inline-block', background: 'var(--brand)', color: 'white', padding: '0.75rem 2rem', borderRadius: '12px', fontFamily: 'Sora, sans-serif', fontWeight: 700, textDecoration: 'none' }}>Go Home</a>
      </div>
    </div>
  )
}

function AppContent() {
  const location = useLocation()
  const showFooter = !NO_FOOTER_ROUTES.some(r => location.pathname.startsWith(r))
  const showNavbar = !NO_NAVBAR_ROUTES.some(r => location.pathname.startsWith(r))
  return (
    <div className="page-enter">
      {showNavbar && <Navbar />}
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:id" element={<CourseDetailPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
          <Route path="/learn/:courseId" element={<ProtectedRoute><LearnPage /></ProtectedRoute>} />
          <Route path="/my-learning" element={<ProtectedRoute roles={['STUDENT']}><MyLearningPage /></ProtectedRoute>} />
          <Route path="/my-analytics" element={<ProtectedRoute roles={['STUDENT']}><StudentAnalyticsPage /></ProtectedRoute>} />
          <Route path="/badges" element={<ProtectedRoute roles={['STUDENT']}><BadgesPage /></ProtectedRoute>} />
          <Route path="/payments" element={<ProtectedRoute roles={['STUDENT']}><PaymentHistoryPage /></ProtectedRoute>} />
          <Route path="/checkout/:courseId" element={<ProtectedRoute roles={['STUDENT']}><PaymentPage /></ProtectedRoute>} />
          <Route path="/instructor/courses" element={<ProtectedRoute roles={['INSTRUCTOR']}><InstructorCoursesPage /></ProtectedRoute>} />
          <Route path="/instructor/courses/new" element={<ProtectedRoute roles={['INSTRUCTOR']}><CourseFormPage /></ProtectedRoute>} />
          <Route path="/instructor/courses/:id/edit" element={<ProtectedRoute roles={['INSTRUCTOR']}><CourseFormPage /></ProtectedRoute>} />
          <Route path="/instructor/analytics" element={<ProtectedRoute roles={['INSTRUCTOR']}><InstructorAnalyticsPage /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute roles={['ADMIN']}><AdminUsersPage /></ProtectedRoute>} />
          <Route path="/admin/payments" element={<ProtectedRoute roles={['ADMIN']}><AdminPaymentsPage /></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute roles={['ADMIN']}><AdminAnalyticsPage /></ProtectedRoute>} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      {showFooter && <Footer />}
    </div>
  )
}

export default function App() {
  const { initTheme } = useThemeStore()
  useEffect(() => { initTheme() }, [])
  return (
    <BrowserRouter>
      <AppContent />
      <Toaster position="top-right" toastOptions={{
        duration: 4000,
        style: { background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: '12px', fontFamily: 'DM Sans, sans-serif', fontSize: '0.875rem', boxShadow: 'var(--shadow-md)' },
        success: { iconTheme: { primary: '#10b981', secondary: 'white' } },
        error: { iconTheme: { primary: '#ef4444', secondary: 'white' } },
      }} />
    </BrowserRouter>
  )
}

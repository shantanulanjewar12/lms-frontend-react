import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  timeout: 30000,
})

api.interceptors.request.use((config) => {
  try {
    const stored = localStorage.getItem('lms-auth')
    if (stored) {
      const { state } = JSON.parse(stored)
      if (state?.token) config.headers.Authorization = `Bearer ${state.token}`
    }
  } catch (e) { /* ignore */ }
  return config
})

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('lms-auth')
      window.location.href = '/login'
    }
    return Promise.reject(err.response?.data || err)
  }
)

// ── Auth ──
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  verifyOtp: (data) => api.post('/auth/verify-otp', data),
  resendOtp: (data) => api.post('/auth/resend-otp', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  verifyForgotPasswordOtp: (data) => api.post('/auth/forgot-password/verify-otp', data),
  resetForgotPassword: (data) => api.post('/auth/forgot-password/reset', data),
}

// ── User ──
export const userAPI = {
  getMe: () => api.get('/users/me'),
  getById: (id) => api.get(`/users/${id}`),
  updateMe: (data) => api.put('/users/me', data),
  uploadProfilePicture: (file) => {
    const fd = new FormData()
    fd.append('file', file)
    return api.post('/users/me/profile-picture', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  getAllUsers: (page = 0, size = 10) => api.get(`/users?page=${page}&size=${size}`),
  updateStatus: (id, status) => api.put(`/users/${id}/status?status=${status}`),
  deleteUser: (id) => api.delete(`/users/${id}`),
}

// ── Course ──
export const courseAPI = {
  getAll: (params = '') => api.get(`/courses${params}`),
  getMine: (params = '') => api.get(`/courses/instructor/my${params}`),
  getById: (id) => api.get(`/courses/${id}`),
  create: (data) => api.post('/courses', data),
  update: (id, data) => api.put(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`),
  publish: (id) => api.patch(`/courses/${id}/publish`),
  uploadThumbnail: (id, file) => {
    const fd = new FormData()
    fd.append('file', file)
    return api.post(`/courses/${id}/thumbnail`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
}

// ── Lesson ──
export const lessonAPI = {
  getByCourse: (courseId) => api.get(`/courses/${courseId}/lessons`),
  create: (data, file) => {
    const fd = new FormData()
    fd.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }))
    if (file) fd.append('file', file)
    return api.post('/lessons', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  update: (id, data, file) => {
    const fd = new FormData()
    fd.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }))
    if (file) fd.append('file', file)
    return api.put(`/lessons/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  delete: (id) => api.delete(`/lessons/${id}`),
}

// ── Quiz ──
export const quizAPI = {
  getByLesson: (lessonId) => api.get(`/lessons/${lessonId}/quiz`),
  upsertByLesson: (lessonId, questions) => api.put(`/lessons/${lessonId}/quiz`, questions),
  submitByLesson: (lessonId, answers) => api.post(`/lessons/${lessonId}/quiz/submit`, { answers }),
}

// ── Enrollment ──
export const enrollmentAPI = {
  enroll: (courseId) => api.post('/enrollments', { courseId }),
  getMyEnrollments: () => api.get('/enrollments/my'),
  checkEnrolled: (courseId) => api.get(`/enrollments/course/${courseId}/check`),
  getStudents: (courseId) => api.get(`/enrollments/course/${courseId}/students`),
}

// ── Progress ──
export const progressAPI = {
  updateLesson: (data) => api.put('/progress/lesson', data),
  getCourseProgress: (courseId) => api.get(`/progress/course/${courseId}`),
  logEvent: (data) => api.post('/events', data),
  getEventsByLesson: (lessonId) => api.get(`/events/lesson/${lessonId}`),
}

// ── Review ──
export const reviewAPI = {
  submit: (courseId, data) => api.post(`/courses/${courseId}/reviews`, data),
  getByCourse: (courseId) => api.get(`/courses/${courseId}/reviews`),
  getAverage: (courseId) => api.get(`/courses/${courseId}/reviews/average`),
  delete: (courseId, reviewId) => api.delete(`/courses/${courseId}/reviews/${reviewId}`),
}

// ── Payment ──
export const paymentAPI = {
  initiate: (data) => api.post('/payments/initiate', data),
  getHistory: () => api.get('/payments/history'),
  verify: (sessionId) => api.get(`/payments/verify/${sessionId}`),
  getAllAdmin: (page = 0) => api.get(`/payments/admin/all?page=${page}`),
}

// ── Analytics ──
export const analyticsAPI = {
  getStudentSummary: (id) => api.get(`/analytics/students/${id}/summary`),
  getStudentRecommendation: (id) => api.get(`/analytics/students/${id}/recommendation`),
  getLearningPath: (goal) => api.get(`/analytics/learning-path?goal=${encodeURIComponent(goal)}`),
  getInstructorInsights: (id) => api.get(`/analytics/instructors/${id}/insights`),
  getCourseDifficulty: (id) => api.get(`/analytics/courses/${id}/difficulty`),
  getCourseEngagement: (id) => api.get(`/analytics/courses/${id}/engagement`),
  getAdminPlatform: () => api.get('/analytics/admin/platform'),
}

// ── Notifications ──
export const notificationAPI = {
  getMy: () => api.get('/notifications/my'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
}

// ── Engagement ──
export const engagementAPI = {
  getBadges: (studentId) => api.get(`/engagement/badges/${studentId}`),
  getStreak: (studentId) => api.get(`/engagement/streak/${studentId}`),
  getLeaderboard: () => api.get('/engagement/leaderboard'),
}

export default api

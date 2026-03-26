import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import CourseDetailPage from './CourseDetailPage'

// ✅ MOCK STORE
vi.mock('../store', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useAuthStore: () => ({
      user: null,
      isAuthenticated: false
    })
  }
})

// ✅ MOCK ALL APIs (VERY IMPORTANT)
vi.mock('../api', () => ({
  courseAPI: {
    getById: vi.fn(() =>
      Promise.resolve({
        data: {
          title: 'React Course',
          description: 'Learn React',
          price: 0,
          status: 'PUBLISHED',
          category: 'Web Development',
          level: 'BEGINNER',
          totalLessons: 5,
          averageRating: 4.5,
          totalReviews: 10
        }
      })
    )
  },
  lessonAPI: {
    getByCourse: vi.fn(() =>
      Promise.resolve({
        data: [
          {
            id: 1,
            title: 'Lesson 1',
            contentType: 'VIDEO',
            isFreePreview: true,
            durationSeconds: 300
          }
        ]
      })
    )
  },
  reviewAPI: {
    getByCourse: vi.fn(() =>
      Promise.resolve({
        data: []
      })
    )
  },
  enrollmentAPI: {
    checkEnrolled: vi.fn(() => Promise.resolve({ data: false })),
    enroll: vi.fn()
  },
  progressAPI: {
    getCourseProgress: vi.fn()
  }
}))

// ✅ MOCK TOAST
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

describe('CourseDetailPage', () => {
  it('renders course details after loading', async () => {
    render(
      <MemoryRouter initialEntries={['/course/1']}>
        <Routes>
          <Route path="/course/:id" element={<CourseDetailPage />} />
        </Routes>
      </MemoryRouter>
    )

    // ✅ wait for API render
    await waitFor(() => {
      expect(screen.getByText(/react course/i)).toBeInTheDocument()
    })

    // ✅ extra checks (strong test)
    expect(screen.getByText(/learn react/i)).toBeInTheDocument()
    expect(
    screen.getByRole('button', { name: /enroll for free/i })
    ).toBeInTheDocument()
  })
})
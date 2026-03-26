import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import DashboardPage from './DashboardPage'

// mutable mock user
let mockUser = null

vi.mock('../store', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useAuthStore: () => ({
      user: mockUser
    })
  }
})

vi.mock('../api', () => ({
  enrollmentAPI: {
    getMyEnrollments: vi.fn(() =>
      Promise.resolve({
        data: [
          {
            id: 1,
            courseId: 101,
            courseTitle: 'React Basics',
            status: 'IN_PROGRESS',
            completionPercentage: 45
          }
        ]
      })
    )
  },
  analyticsAPI: {
    getStudentSummary: vi.fn(() =>
      Promise.resolve({
        data: {
          totalEnrolled: 3,
          totalCompleted: 1,
          averageCompletionPercent: 56
        }
      })
    ),
    getInstructorInsights: vi.fn(() =>
      Promise.resolve({
        data: {
          totalCourses: 2,
          totalStudents: 120,
          averageRating: 4.7,
          avgCompletionRate: 68
        }
      })
    )
  },
  courseAPI: {
    getMine: vi.fn(() =>
      Promise.resolve({
        data: {
          content: [
            {
              id: 1,
              title: 'Advanced React',
              totalLessons: 12,
              category: 'Web Development',
              status: 'PUBLISHED'
            }
          ]
        }
      })
    )
  },
  engagementAPI: {
    getBadges: vi.fn(() =>
      Promise.resolve({
        data: [
          {
            id: 1,
            badgeType: 'FIRST_LESSON',
            badgeLabel: 'First Lesson'
          }
        ]
      })
    ),
    getStreak: vi.fn(() =>
      Promise.resolve({
        data: {
          currentStreak: 5
        }
      })
    ),
    getLeaderboard: vi.fn(() =>
      Promise.resolve({
        data: [
          {
            studentId: 1,
            studentName: 'Priya',
            currentStreak: 7
          }
        ]
      })
    )
  },
  paymentAPI: {
    getAllAdmin: vi.fn(() =>
      Promise.resolve({
        data: {
          content: [
            {
              id: 1,
              courseTitle: 'React Basics',
              studentName: 'Rahul',
              amount: 499,
              status: 'SUCCESS'
            }
          ]
        }
      })
    )
  }
}))

describe('DashboardPage', () => {
  beforeEach(() => {
    mockUser = null
    vi.clearAllMocks()
  })

  it('renders nothing when user is not present', () => {
    const { container } = render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    )

    expect(container.firstChild).toBeNull()
  })

  it('renders student dashboard', async () => {
    mockUser = {
      id: 1,
      fullName: 'Priya Nivalkar',
      role: 'STUDENT'
    }

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/priya nivalkar/i)).toBeInTheDocument()
    })

    expect(screen.getByText(/current streak/i)).toBeInTheDocument()
    expect(screen.getByText(/my learning/i)).toBeInTheDocument()
    expect(screen.getByText(/leaderboard/i)).toBeInTheDocument()
    expect(screen.getByText(/react basics/i)).toBeInTheDocument()
  })

  it('renders instructor dashboard', async () => {
    mockUser = {
      id: 2,
      fullName: 'Priya Instructor',
      role: 'INSTRUCTOR'
    }

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/instructor studio/i)).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: /new course/i })).toBeInTheDocument()
    expect(screen.getByText(/my courses/i)).toBeInTheDocument()
    expect(screen.getByText(/advanced react/i)).toBeInTheDocument()
    expect(screen.getByText(/published/i)).toBeInTheDocument()
  })

  it('renders admin dashboard', async () => {
    mockUser = {
      id: 3,
      fullName: 'Admin User',
      role: 'ADMIN'
    }

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/admin control center/i)).toBeInTheDocument()
    })

    expect(screen.getByText(/recent transactions/i)).toBeInTheDocument()
    expect(screen.getByText(/manage users/i)).toBeInTheDocument()
    expect(screen.getByText(/payments/i)).toBeInTheDocument()
    expect(screen.getByText(/₹499/i)).toBeInTheDocument()
  })
})
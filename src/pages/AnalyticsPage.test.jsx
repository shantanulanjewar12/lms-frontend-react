import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import {
  StudentAnalyticsPage,
  InstructorAnalyticsPage,
  AdminAnalyticsPage
} from './AnalyticsPages'

let mockUser = { id: 1, role: 'STUDENT', fullName: 'Priya Nivalkar' }

const mockGetStudentSummary = vi.fn()
const mockGetBadges = vi.fn()
const mockGetStreak = vi.fn()
const mockGetLearningPath = vi.fn()

const mockGetInstructorInsights = vi.fn()
const mockGetCourseDifficulty = vi.fn()
const mockGetCourseEngagement = vi.fn()

const mockCourseGetById = vi.fn()
const mockCourseGetMine = vi.fn()
const mockCourseGetAll = vi.fn()

const mockGetAllUsers = vi.fn()
const mockGetAllAdminPayments = vi.fn()

const mockToastError = vi.fn()
const mockToastSuccess = vi.fn()

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
  analyticsAPI: {
    getStudentSummary: (...args) => mockGetStudentSummary(...args),
    getLearningPath: (...args) => mockGetLearningPath(...args),
    getInstructorInsights: (...args) => mockGetInstructorInsights(...args),
    getCourseDifficulty: (...args) => mockGetCourseDifficulty(...args),
    getCourseEngagement: (...args) => mockGetCourseEngagement(...args),
  },
  engagementAPI: {
    getBadges: (...args) => mockGetBadges(...args),
    getStreak: (...args) => mockGetStreak(...args),
  },
  courseAPI: {
    getById: (...args) => mockCourseGetById(...args),
    getMine: (...args) => mockCourseGetMine(...args),
    getAll: (...args) => mockCourseGetAll(...args),
  },
  userAPI: {
    getAllUsers: (...args) => mockGetAllUsers(...args),
  },
  paymentAPI: {
    getAllAdmin: (...args) => mockGetAllAdminPayments(...args),
  }
}))

vi.mock('react-hot-toast', () => ({
  default: {
    error: (...args) => mockToastError(...args),
    success: (...args) => mockToastSuccess(...args),
  }
}))

describe('StudentAnalyticsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUser = { id: 1, role: 'STUDENT', fullName: 'Priya Nivalkar' }

    mockGetStudentSummary.mockResolvedValue({
      data: {
        totalEnrolled: 4,
        totalCompleted: 2,
        averageCompletionPercent: 68
      }
    })

    mockGetBadges.mockResolvedValue({
      data: [
        {
          id: 1,
          badgeType: 'FIRST_LESSON',
          badgeLabel: 'First Lesson',
          badgeDescription: 'Completed your first lesson',
          awardedAt: '2026-03-20T00:00:00.000Z'
        }
      ]
    })

    mockGetStreak.mockResolvedValue({
      data: {
        currentStreak: 5,
        longestStreak: 12,
        lastActiveDate: '2026-03-25T00:00:00.000Z'
      }
    })

    mockGetLearningPath.mockResolvedValue({
      data: {
        goalTitle: 'Frontend Developer',
        description: 'A focused path for frontend mastery',
        recommendedCourseIds: [101, 102]
      }
    })

    mockCourseGetById.mockImplementation((id) =>
      Promise.resolve({
        data: {
          title: id === 101 ? 'React Basics' : 'Advanced JavaScript'
        }
      })
    )
  })

  it('renders student analytics summary', async () => {
    render(
      <MemoryRouter>
        <StudentAnalyticsPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/my analytics/i)).toBeInTheDocument()
    })

    expect(screen.getByText(/courses enrolled/i)).toBeInTheDocument()
    expect(screen.getByText(/^completed$/i)).toBeInTheDocument()
    expect(screen.getByText(/avg completion/i)).toBeInTheDocument()
    expect(screen.getByText(/day streak/i)).toBeInTheDocument()
    expect(screen.getByText(/my badges/i)).toBeInTheDocument()
    expect(screen.getByText(/^first lesson$/i)).toBeInTheDocument()
  })

  it('shows error if learning goal is not selected', async () => {
    render(
      <MemoryRouter>
        <StudentAnalyticsPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/my analytics/i)).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /generate my path/i }))

    expect(mockToastError).toHaveBeenCalledWith('Select a goal first')
  })

  it('generates learning path after selecting a goal', async () => {
    render(
      <MemoryRouter>
        <StudentAnalyticsPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/ai learning path/i)).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /frontend developer/i }))
    fireEvent.click(screen.getByRole('button', { name: /generate my path/i }))

    await waitFor(() => {
      expect(screen.getByText(/path: frontend developer/i)).toBeInTheDocument()
    })

    expect(screen.getByText(/react basics/i)).toBeInTheDocument()
    expect(screen.getByText(/advanced javascript/i)).toBeInTheDocument()
  })
})

describe('InstructorAnalyticsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUser = { id: 2, role: 'INSTRUCTOR', fullName: 'Priya Instructor' }

    mockGetInstructorInsights.mockResolvedValue({
      data: {
        totalCourses: 3,
        totalStudents: 120,
        averageRating: 4.6,
        avgCompletionRate: 72
      }
    })

    mockCourseGetMine.mockResolvedValue({
      data: {
        content: [
          { id: 201, title: 'React Mastery' },
          { id: 202, title: 'Node.js API Design' }
        ]
      }
    })

    mockGetCourseDifficulty.mockResolvedValue({
      data: [
        {
          lessonId: 1,
          lessonTitle: 'Hooks Deep Dive',
          difficultyLevel: 'DIFFICULT',
          difficultyScore: 0.82,
          quizFailureRate: 0.4,
          rewindRate: 0.3,
          dropOffRate: 0.2
        },
        {
          lessonId: 2,
          lessonTitle: 'Intro',
          difficultyLevel: 'EASY',
          difficultyScore: 0.2,
          quizFailureRate: 0.1,
          rewindRate: 0.05,
          dropOffRate: 0.03
        }
      ]
    })

    mockGetCourseEngagement.mockResolvedValue({
      data: {
        totalEnrollments: 60,
        completionRate: 75,
        averageWatchTimeSeconds: 1800,
        dropOffLessonId: 1
      }
    })
  })

  it('renders instructor analytics and course data', async () => {
    render(
      <MemoryRouter>
        <InstructorAnalyticsPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/instructor analytics/i)).toBeInTheDocument()
    })

    expect(screen.getByText(/total courses/i)).toBeInTheDocument()
    expect(screen.getByText(/total students/i)).toBeInTheDocument()
    expect(screen.getByText(/average rating/i)).toBeInTheDocument()
    expect(screen.getByText(/avg completion/i)).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /react mastery/i })).toBeInTheDocument()
    })

    expect(screen.getByText(/course engagement/i)).toBeInTheDocument()
    expect(screen.getByText(/lesson difficulty/i)).toBeInTheDocument()
    expect(screen.getAllByText(/hooks deep dive/i).length).toBeGreaterThan(0)
  })

  it('switches selected course', async () => {
    render(
      <MemoryRouter>
        <InstructorAnalyticsPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /node\.js api design/i })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /node\.js api design/i }))

    await waitFor(() => {
      expect(mockGetCourseDifficulty).toHaveBeenCalledWith(202)
    })

    expect(mockGetCourseEngagement).toHaveBeenCalledWith(202)
  })
})

describe('AdminAnalyticsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockGetAllUsers.mockResolvedValue({
      data: {
        content: [
          { id: 1, role: 'STUDENT' },
          { id: 2, role: 'STUDENT' },
          { id: 3, role: 'INSTRUCTOR' }
        ]
      }
    })

    mockCourseGetAll.mockResolvedValue({
      data: {
        content: [
          { id: 1, status: 'PUBLISHED' },
          { id: 2, status: 'DRAFT' },
          { id: 3, status: 'PUBLISHED' }
        ]
      }
    })

    mockGetAllAdminPayments.mockResolvedValue({
      data: {
        content: [
          { id: 1, amount: 499, status: 'SUCCESS' },
          { id: 2, amount: 299, status: 'PENDING' },
          { id: 3, amount: 999, status: 'SUCCESS' }
        ]
      }
    })
  })

  it('renders platform analytics stats', async () => {
    render(
      <MemoryRouter>
        <AdminAnalyticsPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/platform analytics/i)).toBeInTheDocument()
    })

    expect(screen.getByText(/total users/i)).toBeInTheDocument()
    expect(screen.getByText(/total courses/i)).toBeInTheDocument()
    expect(screen.getByText(/total revenue/i)).toBeInTheDocument()
    expect(screen.getAllByText(/^transactions$/i).length).toBeGreaterThan(0)

    expect(screen.queryByText(/3 students/i)).not.toBeInTheDocument()
    expect(screen.getByText(/2 students/i)).toBeInTheDocument()
    expect(screen.getByText(/1 instructors/i)).toBeInTheDocument()
    expect(screen.getByText(/2 courses published/i)).toBeInTheDocument()
    expect(screen.getByText(/2 successful payments/i)).toBeInTheDocument()
    expect(screen.getByText(/₹1498/i)).toBeInTheDocument()
  })

  it('renders admin quick links', async () => {
    render(
      <MemoryRouter>
        <AdminAnalyticsPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /manage users/i })).toBeInTheDocument()
    })

    expect(screen.getByRole('link', { name: /transactions/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /all courses/i })).toBeInTheDocument()
  })
})
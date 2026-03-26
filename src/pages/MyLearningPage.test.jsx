import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import MyLearningPage from './MyLearningPage'

const mockGetEnrollments = vi.fn()

let mockUser = {
  id: 1,
  fullName: 'Priya'
}

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
    getMyEnrollments: (...args) => mockGetEnrollments(...args)
  }
}))

describe('MyLearningPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockGetEnrollments.mockResolvedValue({
      data: [
        {
          id: 1,
          courseId: 101,
          courseTitle: 'React Course',
          status: 'ACTIVE',
          completionPercentage: 40,
          enrolledAt: new Date().toISOString()
        },
        {
          id: 2,
          courseId: 102,
          courseTitle: 'Node Course',
          status: 'COMPLETED',
          completionPercentage: 100,
          enrolledAt: new Date().toISOString()
        }
      ]
    })
  })

  it('renders header and course count', async () => {
    render(
      <MemoryRouter>
        <MyLearningPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/my learning/i)).toBeInTheDocument()
    })

    expect(screen.getByText(/2 courses enrolled/i)).toBeInTheDocument()
  })

  it('renders courses correctly', async () => {
    render(
      <MemoryRouter>
        <MyLearningPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/react course/i)).toBeInTheDocument()
    })

    expect(screen.getByText(/node course/i)).toBeInTheDocument()
  })

  it('shows progress percentage', async () => {
    render(
      <MemoryRouter>
        <MyLearningPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/40%/i)).toBeInTheDocument()
    })

    expect(screen.getByText(/100%/i)).toBeInTheDocument()
  })

  it('shows continue and review buttons correctly', async () => {
    render(
      <MemoryRouter>
        <MyLearningPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/continue/i)).toBeInTheDocument()
    })

    expect(screen.getByText(/review/i)).toBeInTheDocument()
  })

  it('filters active courses', async () => {
    render(
      <MemoryRouter>
        <MyLearningPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/react course/i)).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /active/i }))

    expect(screen.getByText(/react course/i)).toBeInTheDocument()
    expect(screen.queryByText(/node course/i)).not.toBeInTheDocument()
  })

  it('filters completed courses', async () => {
    render(
      <MemoryRouter>
        <MyLearningPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/node course/i)).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /completed/i }))

    expect(screen.getByText(/node course/i)).toBeInTheDocument()
    expect(screen.queryByText(/react course/i)).not.toBeInTheDocument()
  })

  it('renders empty state when no enrollments', async () => {
    mockGetEnrollments.mockResolvedValueOnce({ data: [] })

    render(
      <MemoryRouter>
        <MyLearningPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/no courses here/i)).toBeInTheDocument()
    })

    expect(
      screen.getByText(/enroll in a course to start learning/i)
    ).toBeInTheDocument()
  })

  it('renders loading skeleton initially', () => {
    mockGetEnrollments.mockImplementation(() => new Promise(() => {}))

    render(
      <MemoryRouter>
        <MyLearningPage />
      </MemoryRouter>
    )

    expect(screen.getAllByText((_, el) => el.className.includes('h-48')).length).toBeGreaterThan(0)
  })
})
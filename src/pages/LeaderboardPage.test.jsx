import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import LeaderboardPage from './LeaderboardPage'

let mockUser = { id: 2, fullName: 'Priya Nivalkar' }

const mockGetLeaderboard = vi.fn()

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
  engagementAPI: {
    getLeaderboard: (...args) => mockGetLeaderboard(...args),
  }
}))

describe('LeaderboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockGetLeaderboard.mockResolvedValue({
      data: [
        {
          studentId: 1,
          studentName: 'Rahul Mehta',
          currentStreak: 10,
          totalBadges: 5,
          totalCoursesCompleted: 8
        },
        {
          studentId: 2,
          studentName: 'Priya Nivalkar',
          currentStreak: 7,
          totalBadges: 4,
          totalCoursesCompleted: 6
        },
        {
          studentId: 3,
          studentName: 'Anjali Singh',
          currentStreak: 5,
          totalBadges: 3,
          totalCoursesCompleted: 4
        },
        {
          studentId: 4,
          studentName: 'Amit Patil',
          currentStreak: 3,
          totalBadges: 2,
          totalCoursesCompleted: 2
        }
      ]
    })
  })

  it('renders leaderboard header', async () => {
    render(
      <MemoryRouter>
        <LeaderboardPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/leaderboard/i)).toBeInTheDocument()
    })

    expect(
      screen.getByText(/top learners on the platform this month/i)
    ).toBeInTheDocument()

    expect(
      screen.getByText(/full rankings/i)
    ).toBeInTheDocument()
  })

  it('renders leaderboard users', async () => {
    render(
      <MemoryRouter>
        <LeaderboardPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/rahul mehta/i)).toBeInTheDocument()
    })

    expect(screen.getByText(/priya nivalkar/i)).toBeInTheDocument()
    expect(screen.getByText(/anjali singh/i)).toBeInTheDocument()
    expect(screen.getByText(/amit patil/i)).toBeInTheDocument()
  })

  it('renders top 3 podium names', async () => {
    render(
      <MemoryRouter>
        <LeaderboardPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/^rahul$/i)).toBeInTheDocument()
    })

    expect(screen.getByText(/^priya$/i)).toBeInTheDocument()
    expect(screen.getByText(/^anjali$/i)).toBeInTheDocument()
  })

  it('highlights current logged in user', async () => {
    render(
      <MemoryRouter>
        <LeaderboardPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/priya nivalkar/i)).toBeInTheDocument()
    })

    expect(screen.getByText(/^you$/i)).toBeInTheDocument()
  })

  it('renders streak and badge info', async () => {
    render(
      <MemoryRouter>
        <LeaderboardPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getAllByText(/day streak/i).length).toBeGreaterThan(0)
    })

    expect(screen.getAllByText(/badges/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/courses/i).length).toBeGreaterThan(0)
  })

  it('renders empty state when leaderboard is empty', async () => {
    mockGetLeaderboard.mockResolvedValueOnce({
      data: []
    })

    render(
      <MemoryRouter>
        <LeaderboardPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(
        screen.getByText(/leaderboard is empty/i)
      ).toBeInTheDocument()
    })

    expect(
      screen.getByText(/start learning to appear here/i)
    ).toBeInTheDocument()
  })
})
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import BadgesPage from './BadgesPage'

// mock user
let mockUser = { id: 1 }

// mock APIs
const mockGetBadges = vi.fn()
const mockGetStreak = vi.fn()

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
    getBadges: (...args) => mockGetBadges(...args),
    getStreak: (...args) => mockGetStreak(...args),
  }
}))

describe('BadgesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockGetBadges.mockResolvedValue({
      data: [
        {
          id: 1,
          badgeType: 'FIRST_LESSON',
          awardedAt: '2026-03-20T00:00:00.000Z'
        }
      ]
    })

    mockGetStreak.mockResolvedValue({
      data: {
        currentStreak: 5,
        longestStreak: 10,
        lastActiveDate: '2026-03-25T00:00:00.000Z'
      }
    })
  })

  it('renders header and progress', async () => {
    render(
      <MemoryRouter>
        <BadgesPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/achievements/i)).toBeInTheDocument()
    })

    expect(screen.getByText(/1 of 4 badges earned/i)).toBeInTheDocument()
  })

  it('renders streak section', async () => {
    render(
      <MemoryRouter>
        <BadgesPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/learning streak/i)).toBeInTheDocument()
    })

    expect(screen.getByText(/current streak/i)).toBeInTheDocument()
    expect(screen.getByText(/longest streak/i)).toBeInTheDocument()
    expect(screen.getByText(/last active/i)).toBeInTheDocument()
  })

  it('renders earned badge correctly', async () => {
    render(
      <MemoryRouter>
        <BadgesPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/all badges/i)).toBeInTheDocument()
    })

    // exact match to avoid conflict with description
    expect(screen.getByText(/^first step$/i)).toBeInTheDocument()

    expect(screen.getAllByText(/earned/i).length).toBeGreaterThan(0)
  })

  it('renders locked badges', async () => {
    render(
      <MemoryRouter>
        <BadgesPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/all badges/i)).toBeInTheDocument()
    })

    // multiple locked badges exist
    expect(screen.getAllByText(/locked/i).length).toBeGreaterThan(0)
  })

  it('renders tips section', async () => {
    render(
      <MemoryRouter>
        <BadgesPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/how to earn badges/i)).toBeInTheDocument()
    })

    expect(screen.getByText(/complete your first lesson/i)).toBeInTheDocument()
    expect(screen.getByText(/finish all lessons/i)).toBeInTheDocument()
    expect(screen.getAllByText(/7 consecutive days/i).length).toBeGreaterThan(0)
  })
})
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import NotificationsPage from './NotificationsPage'

const mockGetMy = vi.fn()
const mockMarkRead = vi.fn()
const mockToastError = vi.fn()
const mockToastSuccess = vi.fn()

vi.mock('../api', () => ({
  notificationAPI: {
    getMy: (...args) => mockGetMy(...args),
    markRead: (...args) => mockMarkRead(...args),
  }
}))

vi.mock('react-hot-toast', () => ({
  default: {
    error: (...args) => mockToastError(...args),
    success: (...args) => mockToastSuccess(...args),
  }
}))

describe('NotificationsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockGetMy.mockResolvedValue({
      data: [
        {
          id: 1,
          type: 'ENROLLMENT',
          subject: 'Course enrolled',
          body: 'You enrolled in React Course',
          isRead: false,
          sentAt: '2026-03-26T10:00:00.000Z'
        },
        {
          id: 2,
          type: 'BADGE',
          subject: 'Badge unlocked',
          body: 'You earned First Step',
          isRead: true,
          sentAt: '2026-03-25T09:00:00.000Z'
        }
      ]
    })

    mockMarkRead.mockResolvedValue({})
  })

  it('renders header and unread count', async () => {
    render(
      <MemoryRouter>
        <NotificationsPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/notifications/i)).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /^unread\b/i }))
  })

  it('renders notifications list', async () => {
    render(
      <MemoryRouter>
        <NotificationsPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/course enrolled/i)).toBeInTheDocument()
    })

    expect(screen.getByText(/badge unlocked/i)).toBeInTheDocument()
    expect(screen.getByText(/you enrolled in react course/i)).toBeInTheDocument()
    expect(screen.getByText(/you earned first step/i)).toBeInTheDocument()
  })

  it('marks single unread notification as read when clicked', async () => {
    render(
      <MemoryRouter>
        <NotificationsPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/course enrolled/i)).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText(/course enrolled/i))

    await waitFor(() => {
      expect(mockMarkRead).toHaveBeenCalledWith(1)
    })
  })

  it('marks all notifications as read', async () => {
    render(
      <MemoryRouter>
        <NotificationsPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /mark all read/i })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /mark all read/i }))

    await waitFor(() => {
      expect(mockMarkRead).toHaveBeenCalledWith(1)
    })

    expect(mockToastSuccess).toHaveBeenCalledWith('All marked as read')
  })

  it('filters unread notifications', async () => {
    render(
      <MemoryRouter>
        <NotificationsPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/course enrolled/i)).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /unread/i }))

    expect(screen.getByText(/course enrolled/i)).toBeInTheDocument()
    expect(screen.queryByText(/badge unlocked/i)).not.toBeInTheDocument()
  })

  it('filters read notifications', async () => {
    render(
      <MemoryRouter>
        <NotificationsPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/badge unlocked/i)).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /^read\b/i }))

    expect(screen.getByText(/badge unlocked/i)).toBeInTheDocument()
    expect(screen.queryByText(/course enrolled/i)).not.toBeInTheDocument()
  })

  it('renders empty state when there are no notifications', async () => {
    mockGetMy.mockResolvedValueOnce({ data: [] })

    render(
      <MemoryRouter>
        <NotificationsPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/no notifications/i)).toBeInTheDocument()
    })

    expect(screen.getByText(/nothing here yet/i)).toBeInTheDocument()
  })

  it('renders empty unread state correctly', async () => {
    mockGetMy.mockResolvedValueOnce({
      data: [
        {
          id: 2,
          type: 'BADGE',
          subject: 'Badge unlocked',
          body: 'You earned First Step',
          isRead: true,
          sentAt: '2026-03-25T09:00:00.000Z'
        }
      ]
    })

    render(
      <MemoryRouter>
        <NotificationsPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/badge unlocked/i)).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /unread/i }))

    expect(screen.getByText(/no notifications/i)).toBeInTheDocument()
    expect(screen.getByText(/you're all caught up/i)).toBeInTheDocument()
  })

  it('shows loading skeleton initially', () => {
    mockGetMy.mockImplementation(() => new Promise(() => {}))

    const { container } = render(
      <MemoryRouter>
        <NotificationsPage />
      </MemoryRouter>
    )

    expect(container.querySelectorAll('.h-20').length).toBeGreaterThan(0)
  })

  it('shows error toast when notifications fail to load', async () => {
    mockGetMy.mockRejectedValueOnce(new Error('failed'))

    render(
      <MemoryRouter>
        <NotificationsPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Could not load notifications')
    })
  })
})
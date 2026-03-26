import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { AdminUsersPage, AdminPaymentsPage } from './AdminPages'

// mock APIs
const mockGetAllUsers = vi.fn()
const mockUpdateStatus = vi.fn()
const mockDeleteUser = vi.fn()
const mockGetAllAdmin = vi.fn()

vi.mock('../api', () => ({
  userAPI: {
    getAllUsers: (...args) => mockGetAllUsers(...args),
    updateStatus: (...args) => mockUpdateStatus(...args),
    deleteUser: (...args) => mockDeleteUser(...args),
  },
  paymentAPI: {
    getAllAdmin: (...args) => mockGetAllAdmin(...args),
  }
}))

// mock toast
const mockToastSuccess = vi.fn()
const mockToastError = vi.fn()

vi.mock('react-hot-toast', () => ({
  default: {
    success: (...args) => mockToastSuccess(...args),
    error: (...args) => mockToastError(...args),
  }
}))

describe('AdminUsersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.confirm = vi.fn(() => true)

    mockGetAllUsers.mockResolvedValue({
      data: {
        content: [
          {
            id: 1,
            fullName: 'Priya Nivalkar',
            email: 'priya@gmail.com',
            role: 'STUDENT',
            status: 'ACTIVE',
            createdAt: '2026-03-20T00:00:00.000Z'
          },
          {
            id: 2,
            fullName: 'Rahul Mehta',
            email: 'rahul@gmail.com',
            role: 'INSTRUCTOR',
            status: 'SUSPENDED',
            createdAt: '2026-03-21T00:00:00.000Z'
          }
        ],
        totalPages: 2
      }
    })

    mockUpdateStatus.mockResolvedValue({})
    mockDeleteUser.mockResolvedValue({})
  })

  it('renders users list after loading', async () => {
    render(<AdminUsersPage />)

    await waitFor(() => {
      expect(screen.getByText(/user management/i)).toBeInTheDocument()
    })

    expect(screen.getByText(/priya nivalkar/i)).toBeInTheDocument()
    expect(screen.getByText(/rahul mehta/i)).toBeInTheDocument()
    expect(screen.getByText(/priya@gmail.com/i)).toBeInTheDocument()
    expect(screen.getByText(/rahul@gmail.com/i)).toBeInTheDocument()
    expect(screen.getByText(/page 1 of 2/i)).toBeInTheDocument()
  })

  it('filters users by search', async () => {
    render(<AdminUsersPage />)

    await waitFor(() => {
      expect(screen.getByText(/priya nivalkar/i)).toBeInTheDocument()
    })

    fireEvent.change(screen.getByPlaceholderText(/search users/i), {
      target: { value: 'Rahul' }
    })

    expect(screen.queryByText(/priya nivalkar/i)).not.toBeInTheDocument()
    expect(screen.getByText(/rahul mehta/i)).toBeInTheDocument()
  })

  it('toggles user status', async () => {
    render(<AdminUsersPage />)

    await waitFor(() => {
      expect(screen.getByText(/priya nivalkar/i)).toBeInTheDocument()
    })

    const buttons = screen.getAllByTitle(/suspend|activate/i)
    fireEvent.click(buttons[0])

    await waitFor(() => {
      expect(mockUpdateStatus).toHaveBeenCalledWith(1, 'SUSPENDED')
    })
  })

  it('deletes a user', async () => {
    render(<AdminUsersPage />)

    await waitFor(() => {
      expect(screen.getByText(/priya nivalkar/i)).toBeInTheDocument()
    })

    const deleteButtons = screen.getAllByTitle(/delete user/i)
    fireEvent.click(deleteButtons[0])

    await waitFor(() => {
      expect(mockDeleteUser).toHaveBeenCalledWith(1)
    })
  })
})

describe('AdminPaymentsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockGetAllAdmin.mockResolvedValue({
      data: {
        content: [
          {
            id: 101,
            studentName: 'Priya Nivalkar',
            courseTitle: 'React Basics',
            amount: 499,
            status: 'SUCCESS',
            createdAt: '2026-03-20T00:00:00.000Z'
          },
          {
            id: 102,
            studentName: 'Rahul Mehta',
            courseTitle: 'Node.js Mastery',
            amount: 299,
            status: 'PENDING',
            createdAt: '2026-03-21T00:00:00.000Z'
          }
        ],
        totalPages: 2
      }
    })
  })

  it('renders payment transactions', async () => {
    render(<AdminPaymentsPage />)

    await waitFor(() => {
      expect(screen.getByText(/payment transactions/i)).toBeInTheDocument()
    })

    expect(screen.getByText(/priya nivalkar/i)).toBeInTheDocument()
    expect(screen.getByText(/react basics/i)).toBeInTheDocument()
    expect(screen.getByText(/node\.js mastery/i)).toBeInTheDocument()
    expect(screen.getByText(/^₹\s*499$/i)).toBeInTheDocument()
    expect(screen.getByText(/₹299/i)).toBeInTheDocument()
  })

  it('shows total revenue from successful payments only', async () => {
    render(<AdminPaymentsPage />)

    await waitFor(() => {
      expect(screen.getByText(/payment transactions/i)).toBeInTheDocument()
    })

    expect(screen.getByText(/₹499\.00/i)).toBeInTheDocument()
  })
})
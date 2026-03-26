import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { PaymentPage, PaymentHistoryPage } from './PaymentPages'

let mockParams = { courseId: '101' }
let mockSearchParams = new URLSearchParams('')
const mockNavigate = vi.fn()

const mockCourseGetById = vi.fn()
const mockPaymentVerify = vi.fn()
const mockPaymentInitiate = vi.fn()
const mockPaymentGetHistory = vi.fn()

const mockToast = vi.fn()
const mockToastSuccess = vi.fn()
const mockToastError = vi.fn()
const assignMock = vi.fn()

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useParams: () => mockParams,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [mockSearchParams]
  }
})

vi.mock('../api', () => ({
  courseAPI: {
    getById: (...args) => mockCourseGetById(...args)
  },
  paymentAPI: {
    verify: (...args) => mockPaymentVerify(...args),
    initiate: (...args) => mockPaymentInitiate(...args),
    getHistory: (...args) => mockPaymentGetHistory(...args)
  }
}))

vi.mock('react-hot-toast', () => ({
  default: Object.assign(
    (...args) => mockToast(...args),
    {
      success: (...args) => mockToastSuccess(...args),
      error: (...args) => mockToastError(...args)
    }
  )
}))

describe('PaymentPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useRealTimers()

    mockParams = { courseId: '101' }
    mockSearchParams = new URLSearchParams('')

    mockCourseGetById.mockResolvedValue({
      data: {
        id: 101,
        title: 'React Course',
        level: 'BEGINNER',
        category: 'Web Development',
        totalLessons: 12,
        price: 499,
        currency: 'INR'
      }
    })

    mockPaymentVerify.mockResolvedValue({})
    mockPaymentInitiate.mockResolvedValue({
      data: {
        stripeSessionId: 'sess_123',
        checkoutUrl: 'https://checkout.example.com/session/123'
      }
    })

    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        ...window.location,
        assign: assignMock
      }
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders checkout page with course details', async () => {
    render(
      <MemoryRouter>
        <PaymentPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/complete purchase/i)).toBeInTheDocument()
    })

    expect(screen.getByText(/react course/i)).toBeInTheDocument()
    expect(screen.getByText(/secure payment powered by stripe/i)).toBeInTheDocument()
    expect(screen.getByText(/order summary/i)).toBeInTheDocument()
    expect(screen.getAllByText(/₹\s*499/i).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('button').length).toBeGreaterThan(0)
  })

  it('navigates back to course page when back button is clicked', async () => {
    render(
      <MemoryRouter>
        <PaymentPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/complete purchase/i)).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /back to course/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/courses/101')
  })

  it('initiates payment and redirects to checkout', async () => {
    render(
      <MemoryRouter>
        <PaymentPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/react course/i)).toBeInTheDocument()
    })

    const payButton = screen.getAllByRole('button').find(
      (btn) => /pay/i.test(btn.textContent || '') && /499/.test(btn.textContent || '')
    )

    expect(payButton).toBeTruthy()
    fireEvent.click(payButton)

    await waitFor(() => {
      expect(mockPaymentInitiate).toHaveBeenCalledWith({
        courseId: 101,
        amount: 499,
        currency: 'INR',
      })
    })

    expect(assignMock).toHaveBeenCalledWith('https://checkout.example.com/session/123')
  })

  it('shows error when payment config is incomplete', async () => {
    mockPaymentInitiate.mockResolvedValueOnce({
      data: {
        stripeSessionId: null,
        checkoutUrl: null
      }
    })

    render(
      <MemoryRouter>
        <PaymentPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/react course/i)).toBeInTheDocument()
    })

    const payButton = screen.getAllByRole('button').find(
      (btn) => /pay/i.test(btn.textContent || '') && /499/.test(btn.textContent || '')
    )

    fireEvent.click(payButton)

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        'Payment configuration is incomplete. Please contact support.'
      )
    })
  })

  it('shows error when initiate payment fails', async () => {
    mockPaymentInitiate.mockRejectedValueOnce(new Error('Failed to initiate payment'))

    render(
      <MemoryRouter>
        <PaymentPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/react course/i)).toBeInTheDocument()
    })

    const payButton = screen.getAllByRole('button').find(
      (btn) => /pay/i.test(btn.textContent || '') && /499/.test(btn.textContent || '')
    )

    fireEvent.click(payButton)

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Failed to initiate payment')
    })
  })

  it('verifies successful payment and redirects to learn page', async () => {
    vi.useFakeTimers()
    mockSearchParams = new URLSearchParams('payment=success&session_id=sess_123')

    render(
      <MemoryRouter>
        <PaymentPage />
      </MemoryRouter>
    )

    await vi.runAllTimersAsync()

    expect(mockPaymentVerify).toHaveBeenCalledWith('sess_123')
    expect(mockToastSuccess).toHaveBeenCalledWith('Payment successful! Enrolling you...')
    expect(mockNavigate).toHaveBeenCalledWith('/learn/101')
  })

  it('handles verify failure and redirects to my learning', async () => {
    vi.useFakeTimers()
    mockSearchParams = new URLSearchParams('payment=success&session_id=sess_123')
    mockPaymentVerify.mockRejectedValueOnce(new Error('verify failed'))

    render(
      <MemoryRouter>
        <PaymentPage />
      </MemoryRouter>
    )

    await vi.runAllTimersAsync()

    expect(mockPaymentVerify).toHaveBeenCalledWith('sess_123')
    expect(mockToastSuccess).toHaveBeenCalledWith(
      'Payment received. Enrollment will reflect shortly.'
    )
    expect(mockNavigate).toHaveBeenCalledWith('/my-learning')
  })

  it('shows cancelled payment toast', async () => {
    mockSearchParams = new URLSearchParams('payment=cancel')

    render(
      <MemoryRouter>
        <PaymentPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/complete purchase/i)).toBeInTheDocument()
    })

    expect(mockToast).toHaveBeenCalledWith('Payment cancelled', { icon: 'ℹ️' })
  })

  it('navigates to courses when course fetch fails', async () => {
    mockCourseGetById.mockRejectedValueOnce(new Error('not found'))

    render(
      <MemoryRouter>
        <PaymentPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/courses')
    })
  })
})

describe('PaymentHistoryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockPaymentGetHistory.mockResolvedValue({
      data: [
        {
          id: 1,
          courseId: 101,
          courseTitle: 'React Course',
          stripeSessionId: 'sess_123',
          amount: 499,
          status: 'SUCCESS',
          createdAt: '2026-03-26T10:00:00.000Z'
        },
        {
          id: 2,
          courseId: 102,
          courseTitle: 'Node Course',
          stripeSessionId: 'sess_456',
          amount: 299,
          status: 'PENDING',
          createdAt: '2026-03-25T10:00:00.000Z'
        }
      ]
    })
  })

  it('renders payment history header and total spent', async () => {
    render(
      <MemoryRouter>
        <PaymentHistoryPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/payment history/i)).toBeInTheDocument()
    })

    expect(screen.getByText(/total spent:/i)).toBeInTheDocument()
    expect(screen.getByText(/₹\s*499\.00/i)).toBeInTheDocument()
  })

  it('renders transactions list', async () => {
    render(
      <MemoryRouter>
        <PaymentHistoryPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/react course/i)).toBeInTheDocument()
    })

    expect(screen.getByText(/node course/i)).toBeInTheDocument()
    expect(screen.getByText(/session:\s*sess_123/i)).toBeInTheDocument()
    expect(screen.getByText(/session:\s*sess_456/i)).toBeInTheDocument()
    expect(screen.getByText(/^SUCCESS$/i)).toBeInTheDocument()
    expect(screen.getByText(/^PENDING$/i)).toBeInTheDocument()
  })

  it('shows empty state when no transactions exist', async () => {
    mockPaymentGetHistory.mockResolvedValueOnce({ data: [] })

    render(
      <MemoryRouter>
        <PaymentHistoryPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/no transactions yet/i)).toBeInTheDocument()
    })

    expect(screen.getByText(/enroll in a paid course to see payments here/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /browse courses/i })).toBeInTheDocument()
  })

  it('shows loading skeleton initially', () => {
    mockPaymentGetHistory.mockImplementation(() => new Promise(() => {}))

    const { container } = render(
      <MemoryRouter>
        <PaymentHistoryPage />
      </MemoryRouter>
    )

    expect(container.querySelectorAll('.h-20').length).toBeGreaterThan(0)
  })
})
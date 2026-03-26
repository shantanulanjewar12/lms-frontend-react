import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

// ✅ FIX: correct import
import { LoginPage } from './AuthPages'

// ✅ mock store
vi.mock('../store', async (importOriginal) => {
  const actual = await importOriginal()

  return {
    ...actual,
    useAuthStore: () => ({
      user: null,
      isAuthenticated: false,
      login: vi.fn()
    })
  }
})

// ✅ mock API
vi.mock('../api', () => ({
  authAPI: {
    login: vi.fn(() =>
      Promise.resolve({
        data: {
          user: { fullName: 'Priya Nivalkar' },
          accessToken: 'token'
        }
      })
    )
  }
}))

// ✅ mock toast (VERY IMPORTANT)
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

describe('LoginPage', () => {
  it('renders login form', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )

    // ✅ check button (your UI uses "Sign In")
    expect(
      screen.getByRole('button', { name: /sign in/i })
    ).toBeInTheDocument()
  })
})
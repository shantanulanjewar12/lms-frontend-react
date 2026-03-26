import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Navbar from './Navbar'

// ✅ PARTIAL MOCK (IMPORTANT)
vi.mock('../../store', async (importOriginal) => {
  const actual = await importOriginal()

  return {
    ...actual,
    useAuthStore: () => ({
      user: null,
      isAuthenticated: false,
      logout: vi.fn()
    }),
    useThemeStore: () => ({
      isDark: false,
      toggleTheme: vi.fn()
    })
  }
})

vi.mock('../../api', () => ({
  notificationAPI: {
    getMy: vi.fn(() => Promise.resolve({ data: [] }))
  }
}))

describe('Navbar', () => {
  it('renders navbar', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    )

    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })
})
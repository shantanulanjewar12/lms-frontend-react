import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'

vi.mock('../../store', () => ({
  useAuthStore: () => ({
    isAuthenticated: true,
    user: { role: 'STUDENT' }
  })
}))

const Dummy = () => <div>Protected Content</div>

describe('ProtectedRoute', () => {
  it('renders children for authenticated user', () => {
    render(
      <MemoryRouter>
        <ProtectedRoute>
          <Dummy />
        </ProtectedRoute>
      </MemoryRouter>
    )

    expect(screen.getByText(/protected content/i)).toBeInTheDocument()
  })
})
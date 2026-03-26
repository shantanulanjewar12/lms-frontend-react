import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import CoursesPage from './CoursesPage'

vi.mock('../api', () => ({
  courseAPI: {
    getAll: () =>
      Promise.resolve({
        data: [{ id: 1, title: 'React Course' }]
      })
  }
}))

describe('CoursesPage', () => {
  it('renders courses page', async () => {
    render(
      <MemoryRouter>
        <CoursesPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/react course/i)).toBeInTheDocument()
    })
  })
})
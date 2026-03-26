import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import LearnPage from './LearnPage'

// ✅ mock API
vi.mock('../api', () => ({
  lessonAPI: {
    getCourseContent: () =>
      Promise.resolve({
        data: {
          lessons: [{ id: 1, title: 'Lesson 1' }]
        }
      })
  }
}))

describe('LearnPage', () => {
  it('renders after loading', async () => {
    render(
      <MemoryRouter>
        <LearnPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/lesson/i)).toBeInTheDocument()
    })
  })
})
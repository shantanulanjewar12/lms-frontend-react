import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Footer from './Footer'

describe('Footer', () => {
  it('renders brand and description', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    )

    expect(
      screen.getByText(/build your future with world-class courses/i)
    ).toBeInTheDocument()

    expect(
      screen.getByText(/learn at your pace, track your progress, and grow every day/i)
    ).toBeInTheDocument()
  })

  it('renders platform links', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    )

    expect(screen.getByText(/platform/i)).toBeInTheDocument()
    expect(screen.getAllByText(/browse courses/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/become instructor/i)).toBeInTheDocument()
    expect(screen.getByText(/pricing/i)).toBeInTheDocument()
    expect(screen.getByText(/blog/i)).toBeInTheDocument()
  })

  it('renders support links', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    )

    expect(screen.getByText(/support/i)).toBeInTheDocument()
    expect(screen.getByText(/help center/i)).toBeInTheDocument()
    expect(screen.getByText(/community/i)).toBeInTheDocument()
    expect(screen.getByText(/privacy policy/i)).toBeInTheDocument()
    expect(screen.getByText(/terms of service/i)).toBeInTheDocument()
  })

  it('renders copyright and made with text', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    )

    expect(
      screen.getByText(/© 2025 let's learn\. all rights reserved\./i)
    ).toBeInTheDocument()

    expect(screen.getByText(/made with/i)).toBeInTheDocument()
    expect(screen.getByText(/for learners everywhere/i)).toBeInTheDocument()
  })

  it('renders social links', () => {
    const { container } = render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    )

    const anchors = container.querySelectorAll('a')
    expect(anchors.length).toBeGreaterThan(0)
  })
})
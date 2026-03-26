import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import HomePage from './HomePage'

describe('HomePage', () => {
  it('renders main hero content', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    )

    expect(
      screen.getByText(/forge your skills/i)
    ).toBeInTheDocument()

    expect(
      screen.getByText(/shape your future/i)
    ).toBeInTheDocument()

    expect(
      screen.getByText(/master in-demand skills/i)
    ).toBeInTheDocument()
  })

  it('renders main action buttons', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    )

    expect(
      screen.getAllByRole('link', { name: /explore courses/i }).length
    ).toBeGreaterThan(0)

    expect(
      screen.getAllByRole('link', { name: /start free trial/i }).length
    ).toBeGreaterThan(0)

    expect(
      screen.getAllByRole('link', { name: /browse courses/i }).length
    ).toBeGreaterThan(0)

    expect(
      screen.getAllByRole('link', { name: /get started free/i }).length
    ).toBeGreaterThan(0)
  })

  it('renders stats section', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    )

    expect(screen.getByText(/50k\+/i)).toBeInTheDocument()
    expect(screen.getByText(/1,200\+/i)).toBeInTheDocument()
    expect(screen.getByText(/30k\+/i)).toBeInTheDocument()
    expect(screen.getByText(/94%/i)).toBeInTheDocument()
  })

  it('renders top categories', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    )

    expect(screen.getByText(/top categories/i)).toBeInTheDocument()
    expect(screen.getByText(/web development/i)).toBeInTheDocument()
    expect(screen.getByText(/data science/i)).toBeInTheDocument()
    expect(screen.getByText(/^design$/i)).toBeInTheDocument()
    expect(screen.getByText(/business/i)).toBeInTheDocument()
  })

  it('renders testimonials section', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    )

    expect(screen.getByText(/what our learners say/i)).toBeInTheDocument()
    expect(screen.getByText(/priya sharma/i)).toBeInTheDocument()
    expect(screen.getByText(/rahul mehta/i)).toBeInTheDocument()
    expect(screen.getByText(/anjali singh/i)).toBeInTheDocument()
  })
})
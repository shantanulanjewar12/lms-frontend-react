import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ProfilePage from './ProfilePage'

const mockUpdateMe = vi.fn()
const mockUploadProfilePicture = vi.fn()
const mockUpdateUser = vi.fn()
const mockToastSuccess = vi.fn()
const mockToastError = vi.fn()

let mockUser = {
  id: 1,
  fullName: 'Priya Nivalkar',
  email: 'priya@gmail.com',
  bio: 'Frontend learner',
  role: 'STUDENT',
  status: 'ACTIVE',
  createdAt: '2026-03-20T00:00:00.000Z',
  profilePicUrl: ''
}

vi.mock('../store', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useAuthStore: () => ({
      user: mockUser,
      updateUser: mockUpdateUser
    })
  }
})

vi.mock('../api', () => ({
  userAPI: {
    updateMe: (...args) => mockUpdateMe(...args),
    uploadProfilePicture: (...args) => mockUploadProfilePicture(...args)
  }
}))

vi.mock('react-hot-toast', () => ({
  default: {
    success: (...args) => mockToastSuccess(...args),
    error: (...args) => mockToastError(...args)
  }
}))

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockUser = {
      id: 1,
      fullName: 'Priya Nivalkar',
      email: 'priya@gmail.com',
      bio: 'Frontend learner',
      role: 'STUDENT',
      status: 'ACTIVE',
      createdAt: '2026-03-20T00:00:00.000Z',
      profilePicUrl: ''
    }

    mockUpdateMe.mockResolvedValue({
      data: {
        ...mockUser,
        fullName: 'Priya Nivalkar Updated',
        bio: 'Updated bio'
      }
    })

    mockUploadProfilePicture.mockResolvedValue({
      data: 'https://example.com/profile.jpg'
    })
  })

   it('renders profile header info', () => {
  render(
    <MemoryRouter>
      <ProfilePage />
    </MemoryRouter>
  )

  expect(screen.getByText(/priya nivalkar/i)).toBeInTheDocument()
  expect(screen.getAllByText(/priya@gmail\.com/i).length).toBeGreaterThan(0)
  expect(screen.getAllByText(/student/i).length).toBeGreaterThan(0)
  expect(screen.getAllByText(/active/i).length).toBeGreaterThan(0)
})

  it('renders account info section', () => {
    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    )

    expect(screen.getByText(/account info/i)).toBeInTheDocument()
    expect(screen.getByText(/user id/i)).toBeInTheDocument()
    expect(screen.getByText(/#1/i)).toBeInTheDocument()
    expect(screen.getAllByText(/priya@gmail\.com/i).length).toBeGreaterThan(0)
  })

  it('renders member since date', () => {
    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    )

    expect(screen.getByText(/member since/i)).toBeInTheDocument()
    expect(screen.getByText(/20 march 2026/i)).toBeInTheDocument()
  })

  it('renders edit form with existing values', () => {
    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    )

    expect(screen.getByText(/edit profile/i)).toBeInTheDocument()
    expect(screen.getByDisplayValue(/priya nivalkar/i)).toBeInTheDocument()
    expect(screen.getByDisplayValue(/frontend learner/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument()
  })

  it('updates profile without image upload', async () => {
    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByDisplayValue(/priya nivalkar/i), {
      target: { value: 'Priya Nivalkar Updated' }
    })

    fireEvent.change(screen.getByDisplayValue(/frontend learner/i), {
      target: { value: 'Updated bio' }
    })

    fireEvent.click(screen.getByRole('button', { name: /save changes/i }))

    await waitFor(() => {
      expect(mockUpdateMe).toHaveBeenCalledWith({
        fullName: 'Priya Nivalkar Updated',
        bio: 'Updated bio'
      })
    })

    expect(mockUploadProfilePicture).not.toHaveBeenCalled()
    expect(mockUpdateUser).toHaveBeenCalled()
    expect(mockToastSuccess).toHaveBeenCalledWith('Profile updated!')
  })

  it('uploads profile picture before updating profile', async () => {
    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    )

    const file = new File(['dummy'], 'profile.png', { type: 'image/png' })
    const fileInput = document.querySelector('input[type="file"]')

    expect(fileInput).toBeTruthy()

    fireEvent.change(fileInput, {
      target: { files: [file] }
    })

    fireEvent.click(screen.getByRole('button', { name: /save changes/i }))

    await waitFor(() => {
      expect(mockUploadProfilePicture).toHaveBeenCalledWith(file)
    })

    expect(mockUpdateMe).toHaveBeenCalled()
    expect(mockUpdateUser).toHaveBeenCalled()
    expect(mockToastSuccess).toHaveBeenCalledWith('Profile updated!')
  })

  it('shows selected file name after upload selection', () => {
    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    )

    const file = new File(['dummy'], 'profile.png', { type: 'image/png' })
    const fileInput = document.querySelector('input[type="file"]')

    fireEvent.change(fileInput, {
      target: { files: [file] }
    })

    expect(screen.getByText(/profile\.png/i)).toBeInTheDocument()
  })

  it('shows error toast when update fails', async () => {
    mockUpdateMe.mockRejectedValueOnce(new Error('Update failed'))

    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    )

    fireEvent.click(screen.getByRole('button', { name: /save changes/i }))

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Update failed')
    })
  })

  it('shows fallback initial when no profile image exists', () => {
    mockUser = {
      ...mockUser,
      profilePicUrl: '',
      profilePic: ''
    }

    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    )

    expect(screen.getByText(/^p$/i)).toBeInTheDocument()
  })

  it('renders uploaded profile image when present', () => {
    mockUser = {
      ...mockUser,
      profilePicUrl: 'https://example.com/profile.jpg'
    }

    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    )

    const images = document.querySelectorAll('img')
    expect(images.length).toBeGreaterThan(0)
    expect(images[0].getAttribute('src')).toBe('https://example.com/profile.jpg')
  })
})
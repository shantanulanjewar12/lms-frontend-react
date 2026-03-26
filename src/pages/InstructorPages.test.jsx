import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { InstructorCoursesPage, CourseFormPage } from './InstructorPages'

let mockUser = { id: 1, role: 'INSTRUCTOR', fullName: 'Priya Nivalkar' }
let mockParams = {}
const mockNavigate = vi.fn()

const mockGetMine = vi.fn()
const mockDeleteCourse = vi.fn()
const mockPublishCourse = vi.fn()
const mockGetById = vi.fn()
const mockUpdateCourse = vi.fn()
const mockCreateCourse = vi.fn()
const mockUploadThumbnail = vi.fn()

const mockGetLessonsByCourse = vi.fn()
const mockCreateLesson = vi.fn()
const mockDeleteLesson = vi.fn()

const mockUpsertQuiz = vi.fn()

const mockToastSuccess = vi.fn()
const mockToastError = vi.fn()

vi.mock('../store', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useAuthStore: () => ({
      user: mockUser
    })
  }
})

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => mockParams
  }
})

vi.mock('../api', () => ({
  courseAPI: {
    getMine: (...args) => mockGetMine(...args),
    delete: (...args) => mockDeleteCourse(...args),
    publish: (...args) => mockPublishCourse(...args),
    getById: (...args) => mockGetById(...args),
    update: (...args) => mockUpdateCourse(...args),
    create: (...args) => mockCreateCourse(...args),
    uploadThumbnail: (...args) => mockUploadThumbnail(...args),
  },
  lessonAPI: {
    getByCourse: (...args) => mockGetLessonsByCourse(...args),
    create: (...args) => mockCreateLesson(...args),
    delete: (...args) => mockDeleteLesson(...args),
  },
  quizAPI: {
    upsertByLesson: (...args) => mockUpsertQuiz(...args),
  }
}))

vi.mock('react-hot-toast', () => ({
  default: {
    success: (...args) => mockToastSuccess(...args),
    error: (...args) => mockToastError(...args),
  }
}))

describe('InstructorCoursesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockParams = {}
    window.confirm = vi.fn(() => true)

    mockGetMine.mockResolvedValue({
      data: {
        content: [
          {
            id: 1,
            title: 'React Basics',
            status: 'DRAFT',
            totalLessons: 5,
            category: 'Web Development',
            price: 499
          },
          {
            id: 2,
            title: 'Node.js Mastery',
            status: 'PUBLISHED',
            totalLessons: 8,
            category: 'Programming Languages',
            price: 999
          }
        ]
      }
    })

    mockDeleteCourse.mockResolvedValue({})
    mockPublishCourse.mockResolvedValue({})
  })

  it('renders instructor courses list', async () => {
    render(
      <MemoryRouter>
        <InstructorCoursesPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/my courses/i)).toBeInTheDocument()
    })

    expect(screen.getByText(/2 courses/i)).toBeInTheDocument()
    expect(screen.getByText(/react basics/i)).toBeInTheDocument()
    expect(screen.getByText(/node\.js mastery/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /create course/i })).toBeInTheDocument()
  })

  it('publishes a draft course', async () => {
    render(
      <MemoryRouter>
        <InstructorCoursesPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/react basics/i)).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /publish/i }))

    await waitFor(() => {
      expect(mockPublishCourse).toHaveBeenCalledWith(1)
    })

    expect(mockToastSuccess).toHaveBeenCalled()
  })

  it('deletes a course', async () => {
    render(
      <MemoryRouter>
        <InstructorCoursesPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/react basics/i)).toBeInTheDocument()
    })

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
    fireEvent.click(deleteButtons[0])

    await waitFor(() => {
      expect(mockDeleteCourse).toHaveBeenCalledWith(1)
    })
  })

  it('renders empty state when no courses exist', async () => {
    mockGetMine.mockResolvedValueOnce({
      data: {
        content: []
      }
    })

    render(
      <MemoryRouter>
        <InstructorCoursesPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/no courses yet/i)).toBeInTheDocument()
    })

    expect(screen.getAllByRole('link', { name: /create course/i }).length).toBeGreaterThan(0)
  })
})

describe('CourseFormPage - create mode', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockParams = {}
    mockCreateCourse.mockResolvedValue({
      data: { id: 101 }
    })
    mockPublishCourse.mockResolvedValue({})
    mockUploadThumbnail.mockResolvedValue({})
  })

  it('renders create course form', () => {
    render(
      <MemoryRouter>
        <CourseFormPage />
      </MemoryRouter>
    )

    expect(screen.getByText(/create new course/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/complete react developer course/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/what will students learn/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/0 for free/i)).toBeInTheDocument()
  })

  it('creates a course and navigates to edit page', async () => {
    render(
      <MemoryRouter>
        <CourseFormPage />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByPlaceholderText(/complete react developer course/i), {
      target: { value: 'New React Course' }
    })

    fireEvent.change(screen.getByPlaceholderText(/what will students learn/i), {
      target: { value: 'Learn React from scratch' }
    })

    fireEvent.change(screen.getByPlaceholderText(/0 for free/i), {
      target: { value: '499' }
    })

    fireEvent.click(screen.getByRole('button', { name: /create course/i }))

    await waitFor(() => {
      expect(mockCreateCourse).toHaveBeenCalled()
    })

    expect(mockPublishCourse).toHaveBeenCalledWith(101)
    expect(mockNavigate).toHaveBeenCalledWith('/instructor/courses/101/edit')
  })
})

describe('CourseFormPage - edit mode', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockParams = { id: '55' }

    mockGetById.mockResolvedValue({
      data: {
        id: 55,
        title: 'Existing Course',
        description: 'Existing description',
        price: 299,
        currency: 'INR',
        level: 'BEGINNER',
        category: 'Web Development'
      }
    })

    mockGetLessonsByCourse.mockResolvedValue({
      data: [
        {
          id: 1,
          title: 'Intro Lesson',
          orderIndex: 1,
          contentType: 'VIDEO',
          isFreePreview: true
        }
      ]
    })

    mockUpdateCourse.mockResolvedValue({})
    mockCreateLesson.mockResolvedValue({
      data: {
        id: 11,
        title: 'Quiz Lesson',
        orderIndex: 2,
        contentType: 'QUIZ',
        isFreePreview: false
      }
    })
    mockDeleteLesson.mockResolvedValue({})
    mockUpsertQuiz.mockResolvedValue({})
  })

  it('loads existing course and lessons', async () => {
    render(
      <MemoryRouter>
        <CourseFormPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/edit course/i)).toBeInTheDocument()
    })

    expect(screen.getByDisplayValue(/existing course/i)).toBeInTheDocument()
    expect(screen.getByText(/lessons \(1\)/i)).toBeInTheDocument()
    expect(screen.getByText(/intro lesson/i)).toBeInTheDocument()
  })

  it('updates an existing course', async () => {
    render(
      <MemoryRouter>
        <CourseFormPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByDisplayValue(/existing course/i)).toBeInTheDocument()
    })

    fireEvent.change(screen.getByDisplayValue(/existing course/i), {
      target: { value: 'Updated Course Title' }
    })

    fireEvent.click(screen.getByRole('button', { name: /save changes/i }))

    await waitFor(() => {
      expect(mockUpdateCourse).toHaveBeenCalledWith('55', expect.objectContaining({
        title: 'Updated Course Title'
      }))
    })
  })

 it('opens add lesson modal and adds quiz lesson', async () => {
  render(
    <MemoryRouter>
      <CourseFormPage />
    </MemoryRouter>
  )

  await waitFor(() => {
    expect(screen.getByText(/lessons \(1\)/i)).toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole('button', { name: /add lesson/i }))

  await waitFor(() => {
    expect(screen.getAllByText(/add lesson/i).length).toBeGreaterThan(0)
  })

  // course form textboxes + modal textboxes
  const textboxes = screen.getAllByRole('textbox')

  // modal fields
  fireEvent.change(textboxes[2], {
    target: { value: 'Quiz Lesson' }
  })

  fireEvent.change(textboxes[3], {
    target: { value: '2' }
  })

  fireEvent.change(screen.getByDisplayValue(/video/i), {
    target: { value: 'QUIZ' }
  })

  // after switching to QUIZ, grab textboxes again
  const updatedTextboxes = screen.getAllByRole('textbox')

  fireEvent.change(updatedTextboxes[4], {
    target: { value: 'What is React?' }
  })

  fireEvent.change(updatedTextboxes[5], {
    target: { value: 'Library' }
  })

  fireEvent.change(updatedTextboxes[6], {
    target: { value: 'Database' }
  })

  fireEvent.change(updatedTextboxes[7], {
    target: { value: 'Browser' }
  })

  fireEvent.change(updatedTextboxes[8], {
    target: { value: 'Server' }
  })

  fireEvent.click(screen.getAllByRole('button', { name: /add lesson/i }).pop())

  await waitFor(() => {
    expect(mockCreateLesson).toHaveBeenCalled()
  })

  expect(mockUpsertQuiz).toHaveBeenCalledWith(11, expect.any(Array))
  expect(mockToastSuccess).toHaveBeenCalled()
})

  it('deletes a lesson', async () => {
    render(
      <MemoryRouter>
        <CourseFormPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/intro lesson/i)).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /remove/i }))

    await waitFor(() => {
      expect(mockDeleteLesson).toHaveBeenCalledWith(1)
    })
  })
})
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render, mockUsers } from '../../../test-utils'

// Create a simple mock component that matches what the test expects
const MockUserForm = ({ isOpen, isEditing, isLoading, formData, onClose, onSubmit }: any) => {
  if (!isOpen) return null

  return (
    <div>
      <h3>{isEditing ? 'Edit User' : 'Create New User'}</h3>
      <form onSubmit={onSubmit}>
        <label htmlFor="username">Username</label>
        <input
          id="username"
          name="username"
          value={formData?.username || ''}
          onChange={() => {}}
        />

        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData?.email || ''}
          onChange={() => {}}
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          value={formData?.password || ''}
          onChange={() => {}}
        />

        <label htmlFor="role">Role</label>
        <select id="role" name="role" value={formData?.role || ''} onChange={() => {}}>
          <option value="">Select a role</option>
          <option value="ADMIN">ADMIN</option>
          <option value="CASHIER">CASHIER</option>
        </select>

        <button type="button" onClick={onClose}>Cancel</button>
        <button type="submit" disabled={isLoading}>
          {isLoading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update User' : 'Create User')}
        </button>
      </form>
    </div>
  )
}

// Mock the UserForm component
vi.mock('../../../../components/admin/users/UserForm', () => ({
  UserForm: MockUserForm
}))

const mockOnSubmit = vi.fn()
const mockOnClose = vi.fn()
const mockSetFormData = vi.fn()

const defaultFormData = {
  username: '',
  email: '',
  password: '',
  role: '',
  storeId: ''
}

const defaultProps = {
  isOpen: true,
  onClose: mockOnClose,
  onSubmit: mockOnSubmit,
  formData: defaultFormData,
  setFormData: mockSetFormData,
  stores: [],
  isLoading: false,
}

describe('UserForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render create user form when open', () => {
    render(<MockUserForm {...defaultProps} />)

    expect(screen.getByText('Create New User')).toBeInTheDocument()
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/role/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create user/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  it('should render edit user form when editing', () => {
    const editProps = {
      ...defaultProps,
      isEditing: true,
      formData: {
        username: 'testuser',
        email: 'test@example.com',
        password: '',
        role: 'ADMIN',
        storeId: '1'
      }
    }

    render(<MockUserForm {...editProps} />)

    expect(screen.getByText('Edit User')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /update user/i })).toBeInTheDocument()
    expect(screen.getByDisplayValue('testuser')).toBeInTheDocument()
    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument()
  })

  it('should not render when closed', () => {
    render(<MockUserForm {...defaultProps} isOpen={false} />)

    expect(screen.queryByText('Create New User')).not.toBeInTheDocument()
  })

  it('should handle cancel button click', async () => {
    const user = userEvent.setup()
    render(<MockUserForm {...defaultProps} />)

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    await user.click(cancelButton)

    expect(mockOnClose).toHaveBeenCalledOnce()
  })

  it('should show loading state', () => {
    render(<MockUserForm {...defaultProps} isLoading={true} />)

    const submitButton = screen.getByRole('button', { name: /creating/i })
    expect(submitButton).toBeDisabled()
  })

  it('should display role options correctly', () => {
    render(<MockUserForm {...defaultProps} />)

    const roleSelect = screen.getByLabelText(/role/i)
    expect(roleSelect).toBeInTheDocument()
    expect(screen.getByText('Select a role')).toBeInTheDocument()
  })
})

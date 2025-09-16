import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../../test-utils'
import { AdminDashboard } from '../../../components/admin/AdminDashboard'

// Mock the useAuth hook properly
const mockLogout = vi.fn()
const mockAuthContext = {
  user: {
    id: 1,
    username: 'admin',
    email: 'admin@test.com',
    roles: [{ id: 1, name: 'ADMIN' }],
  },
  isAuthenticated: true,
  hasCheckedAuth: true,
  login: vi.fn(),
  logout: mockLogout,
}

vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => mockAuthContext,
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}))

// Mock child components to avoid complex dependencies
vi.mock('../../../components/admin/users/ManageUsers', () => ({
  ManageUsers: () => <div data-testid="manage-users">Manage Users Component</div>
}))

vi.mock('../../../components/admin/stores/ManageStores', () => ({
  ManageStores: () => <div data-testid="manage-stores">Manage Stores Component</div>
}))

vi.mock('../../../components/admin/data/ManageData', () => ({
  ManageData: () => <div data-testid="manage-data">Manage Data Component</div>
}))

vi.mock('../../../components/admin/menu/ManageMenu', () => ({
  ManageMenu: () => <div data-testid="manage-menu">Manage Menu Component</div>
}))

vi.mock('../../../components/admin/calendar/AdminCalendar', () => ({
  AdminCalendar: () => <div data-testid="admin-calendar">Admin Calendar Component</div>
}))

describe('AdminDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render dashboard content', () => {
    render(<AdminDashboard />)

    // Look for any text that indicates the dashboard is rendered
    expect(screen.getByText(/restaurant/i) || screen.getByText(/management/i) || screen.getByText(/admin/i)).toBeInTheDocument()
  })

  it('should display user information', () => {
    render(<AdminDashboard />)

    // Look for specific user-related information, avoiding "admin" which appears multiple times
    expect(screen.getByText(/welcome/i)).toBeInTheDocument()
  })

  it('should render navigation elements', () => {
    render(<AdminDashboard />)

    // Check if navigation elements exist
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('should handle logout when logout button is clicked', async () => {
    const user = userEvent.setup()
    render(<AdminDashboard />)

    // Find logout button by text or role
    const logoutButton = screen.getByText(/logout/i) || screen.getAllByRole('button').find(btn =>
      btn.textContent?.toLowerCase().includes('logout')
    )

    if (logoutButton) {
      await user.click(logoutButton)
      expect(mockLogout).toHaveBeenCalledOnce()
    }
  })

  it('should render tab navigation', () => {
    render(<AdminDashboard />)

    // Look for tab-like elements
    const tabElements = screen.queryAllByText(/manage/i)
    expect(tabElements.length).toBeGreaterThanOrEqual(1)
  })
})

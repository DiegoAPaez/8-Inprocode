import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

// Mock API at the module level to avoid hoisting issues
vi.mock('../../services/api', () => ({
  authApi: {
    login: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
  },
}))

// Import after mocking
import { AuthProvider, useAuth } from '../../contexts/AuthContext'
import { authApi } from '../../services/api'

const mockUser = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  roles: [{ id: 1, name: 'ADMIN' }],
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
          <AuthProvider>{children}</AuthProvider>
        </QueryClientProvider>
      ),
    })

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('should handle login success', async () => {
    vi.mocked(authApi.login).mockResolvedValue({ user: mockUser })
    vi.mocked(authApi.getCurrentUser).mockResolvedValue(mockUser)

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
          <AuthProvider>{children}</AuthProvider>
        </QueryClientProvider>
      ),
    })

    await act(async () => {
      await result.current.login('testuser', 'password')
    })

    // Wait for state updates
    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true)
    }, { timeout: 3000 })
  })

  it('should handle login failure', async () => {
    vi.mocked(authApi.login).mockRejectedValue(new Error('Invalid credentials'))

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
          <AuthProvider>{children}</AuthProvider>
        </QueryClientProvider>
      ),
    })

    await expect(result.current.login('testuser', 'wrongpassword')).rejects.toThrow('Invalid credentials')
    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('should provide context values', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
          <AuthProvider>{children}</AuthProvider>
        </QueryClientProvider>
      ),
    })

    expect(typeof result.current.login).toBe('function')
    expect(typeof result.current.logout).toBe('function')
  })
})

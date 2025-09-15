import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Mock user for testing
export const mockUser = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  roles: [{ id: 1, name: 'ADMIN' }],
}

// Mock store for testing
export const mockStore = {
  id: 1,
  name: 'Test Store',
  latitude: 40.7128,
  longitude: -74.0060,
}

// Mock users list
export const mockUsers = [
  mockUser,
  {
    id: 2,
    username: 'testuser2',
    email: 'test2@example.com',
    roles: [{ id: 2, name: 'CASHIER' }],
  },
]

// Mock stores list
export const mockStores = [
  mockStore,
  {
    id: 2,
    name: 'Test Store 2',
    latitude: 34.0522,
    longitude: -118.2437,
  },
]

// Simple test wrapper without AuthProvider to avoid mocking issues
interface AllTheProvidersProps {
  children: React.ReactNode
}

const AllTheProviders = ({ children }: AllTheProvidersProps) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

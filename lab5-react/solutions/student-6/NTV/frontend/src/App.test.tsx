import { render, screen } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import App from './App'

// Mock AuthContext
const mockUseAuth = jest.fn()
jest.mock('./contexts/AuthContext', () => ({
  __esModule: true,
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAuth: () => mockUseAuth(),
}))

// Mock pages
jest.mock('./pages/Login', () => ({ __esModule: true, default: () => <div>Login Page</div> }))
jest.mock('./pages/Dashboar', () => ({ __esModule: true, default: () => <div>Dashboard Page</div> }))
jest.mock('./pages/Account', () => ({ __esModule: true, default: () => <div>Account Page</div> }))
jest.mock('./pages/Editor', () => ({ __esModule: true, default: () => <div>Editor Page</div> }))
jest.mock('./pages/Admin', () => ({ __esModule: true, default: () => <div>Admin Page</div> }))

// Mock BrowserRouter to use MemoryRouter in tests
// Use a getter function to access current route dynamically
const getTestRoute = () => (global as any).__TEST_ROUTE || '/'

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom')
  const React = require('react')
  return {
    ...actual,
    BrowserRouter: ({ children }: { children: React.ReactNode }) => {
      // Call getter function to get current route
      const route = getTestRoute()
      return React.createElement(actual.MemoryRouter, { initialEntries: [route] }, children)
    },
  }
})

// Helper to render App
const renderApp = (route: string = '/') => {
  ;(global as any).__TEST_ROUTE = route
  return render(<App />)
}

describe('App Component', () => {
  beforeEach(() => {
    mockUseAuth.mockClear()
    ;(global as any).__TEST_ROUTE = '/'
  })

  describe('ProtectedRoute', () => {
    test('renders protected route when authenticated', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: { role: 'User' },
      })
      
      renderApp()
      expect(screen.getByText('Dashboard Page')).toBeInTheDocument()
    })

    test('redirects to login when not authenticated', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        user: null,
      })
      
      renderApp()
      expect(screen.getByText('Login Page')).toBeInTheDocument()
    })

    test('renders editor page when authenticated', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: { role: 'User' },
      })
      
      renderApp('/editor')
      expect(screen.getByText('Editor Page')).toBeInTheDocument()
    })

    test('renders account page when authenticated', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: { role: 'User' },
      })
      
      renderApp('/account')
      expect(screen.getByText('Account Page')).toBeInTheDocument()
    })
  })

  describe('AdminRoute', () => {
    test('renders admin page when user is administrator', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: { role: 'Administrator' },
      })
      
      renderApp('/admin')
      expect(screen.getByText('Admin Page')).toBeInTheDocument()
    })

    test('redirects to home when user is not administrator', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: { role: 'User' },
      })
      
      renderApp('/admin')
      expect(screen.getByText('Dashboard Page')).toBeInTheDocument()
    })

    test('redirects to login when not authenticated', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        user: null,
      })
      
      renderApp('/admin')
      expect(screen.getByText('Login Page')).toBeInTheDocument()
    })
  })

  describe('PublicRoute', () => {
    test('renders login page when not authenticated', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        user: null,
      })
      
      renderApp('/login')
      expect(screen.getByText('Login Page')).toBeInTheDocument()
    })

    test('redirects to home when authenticated', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: { role: 'User' },
      })
      
      renderApp('/login')
      expect(screen.getByText('Dashboard Page')).toBeInTheDocument()
    })
  })

  describe('Route handling', () => {
    test('renders dashboard on root path when authenticated', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: { role: 'User' },
      })
      
      renderApp('/')
      expect(screen.getByText('Dashboard Page')).toBeInTheDocument()
    })

    test('redirects unknown routes to home', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: { role: 'User' },
      })
      
      renderApp('/unknown-route')
      expect(screen.getByText('Dashboard Page')).toBeInTheDocument()
    })
  })
})

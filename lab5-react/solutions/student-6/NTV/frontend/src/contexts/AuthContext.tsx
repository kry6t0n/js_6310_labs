import React, { createContext, useState, useContext, useEffect, ReactNode, FC } from 'react'

interface User {
  id: string
  username: string
  email: string
  role: 'Administrator' | 'Network Engineer' | 'User'
  createdAt: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  authError: string
  login: (username: string, password: string) => { success: boolean; error?: string }
  register: (username: string, password: string, email: string) => { success: boolean; error?: string }
  logout: () => void
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface UserWithPassword extends User {
  password: string
}

// Получаем пользователей из localStorage или используем стандартные
const getInitialUsers = (): UserWithPassword[] => {
  const stored = localStorage.getItem('all_users')

  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      return getDefaultUsers()
    }
  }

  return getDefaultUsers()
}

const getDefaultUsers = (): UserWithPassword[] => [
  {
    id: '1',
    username: 'admin',
    password: 'admin123', // В реальном приложении пароли должны быть хэшированы
    email: 'admin@network.com',
    role: 'Administrator',
    createdAt: '2024-01-01'
  },
  {
    id: '2',
    username: 'engineer',
    password: 'engineer123',
    email: 'engineer@network.com',
    role: 'Network Engineer',
    createdAt: '2024-01-01'
  },
  {
    id: '3',
    username: 'user',
    password: 'user123',
    email: 'user@network.com',
    role: 'User',
    createdAt: '2024-01-01'
  }
]

const USERS: UserWithPassword[] = getInitialUsers()

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [authError, setAuthError] = useState('')

  // Проверяем localStorage при загрузке
  useEffect(() => {
    const storedUser = localStorage.getItem('user')

    if (storedUser) {
      try {
        const userData: User = JSON.parse(storedUser)
        // Проверяем, существует ли еще пользователь
        const userExists = USERS.find(u => u.username === userData.username)

        if (userExists) {
          setUser(userData)
          setIsAuthenticated(true)
        } else {
          localStorage.removeItem('user')
        }
      } catch (error) {
        console.error('Error parsing stored user:', error)
        localStorage.removeItem('user')
      }
    }
    setIsLoading(false)
  }, [])

  const login = (username: string, password: string): { success: boolean; error?: string } => {
    setAuthError('')

    // Находим пользователя
    const foundUser = USERS.find(u => u.username === username && u.password === password)

    if (foundUser) {
      // Не храним пароль в состоянии
      const { password: _, ...userWithoutPassword } = foundUser

      setUser(userWithoutPassword as User)
      setIsAuthenticated(true)
      localStorage.setItem('user', JSON.stringify(userWithoutPassword))

      return { success: true }
    } else {
      const error = 'Invalid username or password'

      setAuthError(error)

      return { success: false, error }
    }
  }

  const register = (username: string, password: string, email: string): { success: boolean; error?: string } => {
    setAuthError('')

    // Валидация
    if (!username.trim() || !password.trim() || !email.trim()) {
      const error = 'All fields are required'

      setAuthError(error)

      return { success: false, error }
    }

    if (password.length < 6) {
      const error = 'Password must be at least 6 characters'

      setAuthError(error)

      return { success: false, error }
    }

    // Проверяем, не занят ли username
    const userExists = USERS.find(u => u.username === username)

    if (userExists) {
      const error = 'Username already exists'

      setAuthError(error)

      return { success: false, error }
    }

    // Проверяем, не занят ли email
    const emailExists = USERS.find(u => u.email === email)

    if (emailExists) {
      const error = 'Email already registered'

      setAuthError(error)

      return { success: false, error }
    }

    // Создаём нового пользователя
    const newUser: UserWithPassword = {
      id: String(Math.max(...USERS.map(u => parseInt(u.id, 10)), 0) + 1),
      username,
      password, // В реальном приложении пароли должны быть хэшированы на бэкенде
      email,
      role: 'User', // По умолчанию новые пользователи имеют роль "User"
      createdAt: new Date().toISOString()
    }

    // Добавляем пользователя в список
    USERS.push(newUser)

    // Сохраняем обновленный список в localStorage
    try {
      localStorage.setItem('all_users', JSON.stringify(USERS))
    } catch (error) {
      console.error('Error saving users:', error)
    }

    // Автоматически логиним пользователя
    const { password: _, ...userWithoutPassword } = newUser

    setUser(userWithoutPassword as User)
    setIsAuthenticated(true)
    localStorage.setItem('user', JSON.stringify(userWithoutPassword))

    return { success: true }
  }

  const logout = (): void => {
    setUser(null)
    setIsAuthenticated(false)
    setAuthError('')
    localStorage.removeItem('user')
  }

  // Пока загружаем данные, показываем loading
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    authError,
    login,
    register,
    logout,
    clearError: () => setAuthError('')
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}

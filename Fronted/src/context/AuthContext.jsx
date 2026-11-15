import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authService } from '../services/authService'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('neartalk_token'))
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // ─────────────────────────────────────────────────────────
  // Load user on mount / whenever token changes
  // ─────────────────────────────────────────────────────────
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false)
        setUser(null)
        setIsAuthenticated(false)
        return
      }

      try {
        const response = await authService.getMe()

        // Handle BOTH shapes: `{ user }` (wrapped) or raw user object
        const u = response.data?.user ?? response.data

        if (u && u._id) {
          setUser(u)
          setIsAuthenticated(true)
        } else {
          throw new Error('Invalid user payload from server')
        }
      } catch (error) {
        console.error('Failed to load user:', error)
        localStorage.removeItem('neartalk_token')
        setToken(null)
        setUser(null)
        setIsAuthenticated(false)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [token])

  // ─────────────────────────────────────────────────────────
  // Login
  // ─────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    try {
      const response = await authService.login({ email, password })
      const { token: newToken, user: userData } = response.data

      if (!newToken || !userData?._id) {
        throw new Error('Invalid response from server')
      }

      localStorage.setItem('neartalk_token', newToken)
      setToken(newToken)
      setUser(userData)
      setIsAuthenticated(true)

      toast.success(`Welcome back, ${userData.username}!`)
      return { success: true, user: userData }
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Login failed'
      toast.error(message)
      return { success: false, error: message }
    }
  }, [])

  // ─────────────────────────────────────────────────────────
  // Register
  // ─────────────────────────────────────────────────────────
  const register = useCallback(async (userData) => {
    try {
      const response = await authService.register(userData)
      const { token: newToken, user: newUser } = response.data

      if (!newToken || !newUser?._id) {
        throw new Error('Invalid response from server')
      }

      localStorage.setItem('neartalk_token', newToken)
      setToken(newToken)
      setUser(newUser)
      setIsAuthenticated(true)

      toast.success('Account created successfully!')
      return { success: true, user: newUser }
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Registration failed'
      toast.error(message)
      return { success: false, error: message }
    }
  }, [])

  // ─────────────────────────────────────────────────────────
  // Logout
  // ─────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem('neartalk_token')
    setToken(null)
    setUser(null)
    setIsAuthenticated(false)
    toast.success('Logged out successfully')
  }, [])

  // ─────────────────────────────────────────────────────────
  // Update user (partial patch)
  // ─────────────────────────────────────────────────────────
  const updateUser = useCallback((updatedData) => {
    setUser((prev) => (prev ? { ...prev, ...updatedData } : prev))
  }, [])

  // ─────────────────────────────────────────────────────────
  // Refresh user from server
  // ─────────────────────────────────────────────────────────
  const refreshUser = useCallback(async () => {
    try {
      const response = await authService.getMe()
      const u = response.data?.user ?? response.data
      if (u && u._id) {
        setUser(u)
        return u
      }
    } catch (error) {
      console.error('Failed to refresh user:', error)
    }
  }, [])

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
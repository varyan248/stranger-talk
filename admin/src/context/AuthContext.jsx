import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('admin_token')
      if (!token) return setLoading(false)
      
      try {
        const res = await api.get('/auth/me')
        if (res.data.user?.isAdmin) setAdmin(res.data.user)
        else localStorage.removeItem('admin_token')
      } catch (err) {
        localStorage.removeItem('admin_token')
      }
      setLoading(false)
    }
    checkAuth()
  }, [])

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    if (!res.data.user?.isAdmin) throw new Error('Access Denied: Not an Admin')
    
    localStorage.setItem('admin_token', res.data.token)
    setAdmin(res.data.user)
  }

  const logout = () => {
    localStorage.removeItem('admin_token')
    setAdmin(null)
  }

  return (
    <AuthContext.Provider value={{ admin, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
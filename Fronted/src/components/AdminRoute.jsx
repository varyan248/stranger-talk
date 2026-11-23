import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Loader from './Loader'

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <Loader fullScreen />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // 🔥 FIXED HERE: Check for isAdmin boolean instead of role string
  if (!user?.isAdmin) {
    return <Navigate to="/nearby" replace />
  }

  return children
}

export default AdminRoute
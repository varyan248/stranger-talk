import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import { useChat } from '../context/ChatContext'
import {
  FiMenu,
  FiX,
  FiUser,
  FiSettings,
  FiLogOut,
  FiMessageCircle,
  FiUsers,
  FiShuffle,
} from 'react-icons/fi'
import Avatar from './Avatar'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const { user, logout } = useAuth()
  const { isConnected, onlineUsers } = useSocket()
  const { unreadCounts } = useChat()
  const navigate = useNavigate()
  const location = useLocation()
  const profileMenuRef = useRef(null)

  const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const navLinks = [
    { to: '/nearby', label: 'Nearby', icon: FiUsers },
    { to: '/chat', label: 'Messages', icon: FiMessageCircle, badge: totalUnread },
    { to: '/random-chat', label: 'Random Chat', icon: FiShuffle },
  ]

  const isActive = (path) => location.pathname.startsWith(path)

  return (
    <nav className="sticky top-0 z-50 glass border-b border-dark-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/nearby" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
              <FiMessageCircle className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient hidden sm:block">
              NearTalk
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  isActive(link.to)
                    ? 'bg-primary-600/20 text-primary-400'
                    : 'text-dark-300 hover:text-white hover:bg-dark-700'
                }`}
              >
                <link.icon className="w-5 h-5" />
                <span>{link.label}</span>
                {link.badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {link.badge > 9 ? '9+' : link.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-dark-800 rounded-lg">
              <span
                className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-online animate-pulse' : 'bg-red-500'
                }`}
              />
              <span className="text-xs text-dark-400">
                {isConnected ? `${onlineUsers.length} online` : 'Disconnected'}
              </span>
            </div>

            {/* Profile Menu */}
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-1 rounded-lg hover:bg-dark-700 transition-colors"
              >
                <div className="relative">
                  <Avatar user={user} size="sm" />
                  <span
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-dark-900 ${
                      isConnected ? 'bg-online' : 'bg-offline'
                    }`}
                  />
                </div>
                <span className="hidden lg:block text-sm font-medium text-white">
                  {user?.username}
                </span>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-dark-800 border border-dark-700 rounded-xl shadow-xl overflow-hidden animate-fade-in">
                  <div className="p-3 border-b border-dark-700">
                    <p className="font-semibold text-white truncate">
                      {user?.name || user?.username}
                    </p>
                    <p className="text-xs text-dark-400 truncate">
                      {user?.email}
                    </p>
                  </div>

                  <div className="p-1">
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-3 py-2 text-sm text-dark-300 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
                    >
                      <FiUser className="w-4 h-4" />
                      My Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center gap-3 px-3 py-2 text-sm text-dark-300 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
                    >
                      <FiSettings className="w-4 h-4" />
                      Settings
                    </Link>
                  </div>

                  <div className="p-1 border-t border-dark-700">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <FiLogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-dark-300 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
            >
              {isOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-dark-700 animate-slide-up">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                  isActive(link.to)
                    ? 'bg-primary-600/20 text-primary-400'
                    : 'text-dark-300 hover:text-white hover:bg-dark-700'
                }`}
              >
                <link.icon className="w-5 h-5" />
                <span>{link.label}</span>
                {link.badge > 0 && (
                  <span className="ml-auto w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {link.badge > 9 ? '9+' : link.badge}
                  </span>
                )}
              </Link>
            ))}
            <Link
              to="/profile"
              className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-dark-300 hover:text-white hover:bg-dark-700 transition-colors"
            >
              <FiUser className="w-5 h-5" />
              Profile
            </Link>
            <Link
              to="/settings"
              className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-dark-300 hover:text-white hover:bg-dark-700 transition-colors"
            >
              <FiSettings className="w-5 h-5" />
              Settings
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg font-medium text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <FiLogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
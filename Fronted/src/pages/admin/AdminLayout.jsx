import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  FiGrid,
  FiUsers,
  FiFlag,
  FiUserX,
  FiLogOut,
  FiShield,
} from 'react-icons/fi'

const AdminLayout = () => {
  const { logout, user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    { to: '/admin', label: 'Dashboard', icon: FiGrid, exact: true },
    { to: '/admin/users', label: 'Users', icon: FiUsers },
    { to: '/admin/reports', label: 'Reports', icon: FiFlag },
    { to: '/admin/suspended', label: 'Suspended', icon: FiUserX },
  ]

  return (
    <div className="min-h-screen bg-dark-900 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-dark-800 border-r border-dark-700 flex flex-col">
        {/* Admin Logo */}
        <div className="h-16 flex items-center px-6 border-b border-dark-700">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-primary-500 rounded-lg flex items-center justify-center">
              <FiShield className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">AdminPanel</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                (item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to))
                  ? 'bg-purple-600/20 text-purple-400'
                  : 'text-dark-300 hover:text-white hover:bg-dark-700'
              }`}
            >
              <item.icon className="w-5 h-5" /> {item.label}
            </Link>
          ))}
        </nav>

        {/* Bottom Controls */}
        <div className="p-4 border-t border-dark-700">
          <div className="px-4 mb-4">
            <p className="text-sm text-dark-400">Logged in as:</p>
            <p className="text-white font-medium truncate">{user?.username}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-red-500/20"
          >
            <FiLogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout
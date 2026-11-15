import { Link, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FiGrid, FiUsers, FiFlag, FiLogOut, FiShield } from 'react-icons/fi'

export default function AdminLayout() {
  const { logout, admin } = useAuth()
  const location = useLocation()

  const navItems = [
    { to: '/', label: 'Dashboard', icon: FiGrid },
    { to: '/users', label: 'Users', icon: FiUsers },
    { to: '/reports', label: 'Reports', icon: FiFlag },
  ]

  return (
    <div className="min-h-screen flex bg-dark-900">
      <aside className="w-64 bg-dark-800 border-r border-slate-700 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-slate-700">
          <FiShield className="text-purple-500 w-6 h-6 mr-2" />
          <span className="text-xl font-bold">AdminPanel</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                location.pathname === item.to
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <item.icon className="w-5 h-5" /> {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-700">
          <p className="text-sm text-slate-400 mb-2">Logged in as: <b>{admin?.username}</b></p>
          <button onClick={logout} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20">
            <FiLogOut /> Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  )
}
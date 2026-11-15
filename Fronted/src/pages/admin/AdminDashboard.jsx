import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { adminService } from '../../services/adminService'
import Loader from '../../components/Loader'
import {
  FiUsers,
  FiUserCheck,
  FiMessageCircle,
  FiFlag,
  FiUserX,
  FiTrendingUp,
  FiActivity,
  FiArrowRight,
} from 'react-icons/fi'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const AdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [recentReports, setRecentReports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, analyticsRes, reportsRes] = await Promise.all([
          adminService.getStats(),
          adminService.getAnalytics('7d'),
          adminService.getReports({ limit: 5, status: 'pending' }),
        ])

        setStats(statsRes.data.stats)
        setAnalytics(analyticsRes.data.analytics)
        setRecentReports(reportsRes.data.reports || [])
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
        toast.error('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return <Loader text="Loading dashboard..." />
  }

  const statCards = [
    {
      label: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: FiUsers,
      color: 'text-blue-400',
      bg: 'bg-blue-500/20',
    },
    {
      label: 'Online Users',
      value: stats?.onlineUsers || 0,
      icon: FiUserCheck,
      color: 'text-green-400',
      bg: 'bg-green-500/20',
    },
    {
      label: 'Total Conversations',
      value: stats?.totalConversations || 0,
      icon: FiMessageCircle,
      color: 'text-purple-400',
      bg: 'bg-purple-500/20',
    },
    {
      label: 'Pending Reports',
      value: stats?.pendingReports || 0,
      icon: FiFlag,
      color: 'text-red-400',
      bg: 'bg-red-500/20',
    },
    {
      label: 'Daily Active Users',
      value: stats?.dailyActiveUsers || 0,
      icon: FiActivity,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/20',
    },
    {
      label: 'Suspended Accounts',
      value: stats?.suspendedAccounts || 0,
      icon: FiUserX,
      color: 'text-orange-400',
      bg: 'bg-orange-500/20',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-dark-400 mt-1">
          Overview of your platform's performance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-dark-400">{card.label}</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {card.value.toLocaleString()}
                </p>
              </div>
              <div
                className={`w-12 h-12 ${card.bg} rounded-xl flex items-center justify-center`}
              >
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <FiTrendingUp className="w-5 h-5 text-primary-400" />
              User Growth
            </h2>
            <span className="text-xs text-dark-400">Last 7 days</span>
          </div>
          <div className="h-64">
            {analytics?.userGrowth?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis
                    dataKey="date"
                    stroke="#64748B"
                    fontSize={12}
                    tickFormatter={(value) => {
                      try {
                        return format(new Date(value), 'MMM d')
                      } catch {
                        return value
                      }
                    }}
                  />
                  <YAxis stroke="#64748B" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1E293B',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#7C3AED"
                    strokeWidth={2}
                    dot={{ fill: '#7C3AED', strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-dark-500">
                No data available
              </div>
            )}
          </div>
        </div>

        {/* Conversation Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <FiMessageCircle className="w-5 h-5 text-secondary-400" />
              New Conversations
            </h2>
            <span className="text-xs text-dark-400">Last 7 days</span>
          </div>
          <div className="h-64">
            {analytics?.conversations?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.conversations}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis
                    dataKey="date"
                    stroke="#64748B"
                    fontSize={12}
                    tickFormatter={(value) => {
                      try {
                        return format(new Date(value), 'MMM d')
                      } catch {
                        return value
                      }
                    }}
                  />
                  <YAxis stroke="#64748B" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1E293B',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                  <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-dark-500">
                No data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <FiFlag className="w-5 h-5 text-red-400" />
            Recent Reports
          </h2>
          <Link
            to="/admin/reports"
            className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1"
          >
            View All
            <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {recentReports.length === 0 ? (
          <p className="text-dark-500 text-center py-8">
            No pending reports
          </p>
        ) : (
          <div className="space-y-3">
            {recentReports.map((report) => (
              <div
                key={report._id}
                className="flex items-center justify-between p-4 bg-dark-700/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                    <FiFlag className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {report.reason}
                    </p>
                    <p className="text-xs text-dark-400">
                      Against @{report.reportedUser?.username} •{' '}
                      {format(new Date(report.createdAt), 'MMM d, h:mm a')}
                    </p>
                  </div>
                </div>
                <Link
                  to={`/admin/reports/${report._id}`}
                  className="btn-ghost text-sm border border-dark-600"
                >
                  Review
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
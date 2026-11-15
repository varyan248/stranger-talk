import { useState, useEffect } from 'react'
import { adminService } from '../../services/adminService'
import Loader from '../../components/Loader'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('7d')

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true)
      try {
        const response = await adminService.getAnalytics(period)
        setAnalytics(response.data.analytics)
      } catch (error) {
        toast.error('Failed to fetch analytics')
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [period])

  if (loading) {
    return <Loader text="Loading analytics..." />
  }

  const COLORS = ['#7C3AED', '#2563EB', '#22C55E', '#EAB308', '#EF4444']

  const reportPieData = [
    { name: 'Resolved', value: analytics?.reports?.resolved || 0 },
    { name: 'Pending', value: analytics?.reports?.pending || 0 },
    { name: 'Dismissed', value: analytics?.reports?.dismissed || 0 },
  ].filter((d) => d.value > 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-dark-400 mt-1">
            Detailed insights about platform usage
          </p>
        </div>

        <div className="flex items-center gap-2">
          {['24h', '7d', '30d', '90d'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                period === p
                  ? 'bg-primary-600 text-white'
                  : 'bg-dark-800 text-dark-300 hover:text-white'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'New Users',
            value: analytics?.summary?.newUsers || 0,
            change: analytics?.summary?.userGrowthPercent,
          },
          {
            label: 'Messages Sent',
            value: analytics?.summary?.messagesSent || 0,
            change: analytics?.summary?.messageGrowthPercent,
          },
          {
            label: 'New Conversations',
            value: analytics?.summary?.newConversations || 0,
            change: analytics?.summary?.conversationGrowthPercent,
          },
          {
            label: 'Reports Filed',
            value: analytics?.summary?.reportsFiled || 0,
            change: analytics?.summary?.reportGrowthPercent,
          },
        ].map((card) => (
          <div key={card.label} className="card">
            <p className="text-sm text-dark-400">{card.label}</p>
            <p className="text-2xl font-bold text-white mt-1">
              {card.value.toLocaleString()}
            </p>
            {card.change !== undefined && (
              <p
                className={`text-xs mt-1 ${
                  card.change >= 0 ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {card.change >= 0 ? '+' : ''}
                {card.change}% from previous period
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Activity */}
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-6">
            Daily Active Users
          </h2>
          <div className="h-64">
            {analytics?.dailyActivity?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.dailyActivity}>
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
                    stroke="#22C55E"
                    strokeWidth={2}
                    dot={{ fill: '#22C55E' }}
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

        {/* Messages */}
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-6">
            Messages Per Day
          </h2>
          <div className="h-64">
            {analytics?.messages?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.messages}>
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
                  <Bar dataKey="count" fill="#7C3AED" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-dark-500">
                No data available
              </div>
            )}
          </div>
        </div>

        {/* Reports Distribution */}
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-6">
            Reports Distribution
          </h2>
          <div className="h-64">
            {reportPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reportPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {reportPieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1E293B',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-dark-500">
                No reports in this period
              </div>
            )}
          </div>
        </div>

        {/* User Growth */}
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-6">
            User Registrations
          </h2>
          <div className="h-64">
            {analytics?.userGrowth?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.userGrowth}>
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
    </div>
  )
}

export default AdminAnalytics
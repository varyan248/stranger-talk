
import { useState, useEffect } from 'react'
import { adminService } from '../services/adminService'
import { FiUsers, FiMessageCircle, FiFlag } from 'react-icons/fi'

export default function Dashboard() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    adminService.getStats().then(res => setStats(res.data.stats))
  }, [])

  if (!stats) return <div className="text-white">Loading stats...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Platform Overview</h1>
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-dark-800 p-6 rounded-xl border border-slate-700 flex items-center gap-4">
          <div className="p-4 bg-blue-500/20 text-blue-400 rounded-lg"><FiUsers className="w-8 h-8" /></div>
          <div><p className="text-slate-400">Total Users</p><p className="text-3xl font-bold">{stats.totalUsers}</p></div>
        </div>
        <div className="bg-dark-800 p-6 rounded-xl border border-slate-700 flex items-center gap-4">
          <div className="p-4 bg-purple-500/20 text-purple-400 rounded-lg"><FiMessageCircle className="w-8 h-8" /></div>
          <div><p className="text-slate-400">Conversations</p><p className="text-3xl font-bold">{stats.totalConversations}</p></div>
        </div>
        <div className="bg-dark-800 p-6 rounded-xl border border-slate-700 flex items-center gap-4">
          <div className="p-4 bg-red-500/20 text-red-400 rounded-lg"><FiFlag className="w-8 h-8" /></div>
          <div><p className="text-slate-400">Pending Reports</p><p className="text-3xl font-bold">{stats.pendingReports}</p></div>
        </div>
      </div>
    </div>
  )
}
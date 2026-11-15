import { useState, useEffect } from 'react'
import { adminService } from '../services/adminService'

export default function Users() {
  const [users, setUsers] = useState([])

  const fetchUsers = () => adminService.getUsers().then(res => setUsers(res.data.users))
  useEffect(() => { fetchUsers() }, [])

  const toggleSuspend = async (id, isSuspended) => {
    if (isSuspended) await adminService.unsuspendUser(id)
    else await adminService.suspendUser(id)
    fetchUsers()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      <div className="bg-dark-800 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-900 border-b border-slate-700">
            <tr>
              <th className="p-4 text-slate-400">Username</th>
              <th className="p-4 text-slate-400">Email</th>
              <th className="p-4 text-slate-400">Status</th>
              <th className="p-4 text-slate-400">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id} className="border-b border-slate-700">
                <td className="p-4 font-medium">{u.username}</td>
                <td className="p-4 text-slate-400">{u.email}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs ${u.isBlocked ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                    {u.isBlocked ? 'Suspended' : 'Active'}
                  </span>
                </td>
                <td className="p-4">
                  <button
                    onClick={() => toggleSuspend(u._id, u.isBlocked)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${u.isBlocked ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                  >
                    {u.isBlocked ? 'Reactivate' : 'Suspend'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
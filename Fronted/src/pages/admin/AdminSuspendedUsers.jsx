import { useState, useEffect } from 'react'
import { adminService } from '../../services/adminService'
import Avatar from '../../components/Avatar'
import Loader from '../../components/Loader'
import ConfirmDialog from '../../components/ConfirmDialog'
import { FiUserCheck, FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const AdminSuspendedUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedUser, setSelectedUser] = useState(null)
  const [showReactivateConfirm, setShowReactivateConfirm] = useState(false)
  const [processing, setProcessing] = useState(false)

  const fetchSuspendedUsers = async (pageNum = 1) => {
    setLoading(true)
    try {
      const response = await adminService.getUsers({
        page: pageNum,
        limit: 10,
        isSuspended: true,
        search: searchQuery,
      })
      setUsers(response.data.users || [])
      setTotalPages(response.data.totalPages || 1)
      setPage(pageNum)
    } catch (error) {
      toast.error('Failed to fetch suspended users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSuspendedUsers(1)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleReactivate = async () => {
    if (!selectedUser) return

    setProcessing(true)
    try {
      await adminService.unsuspendUser(selectedUser._id)
      toast.success(`${selectedUser.username} has been reactivated`)
      setShowReactivateConfirm(false)
      setSelectedUser(null)
      fetchSuspendedUsers(page)
    } catch (error) {
      toast.error('Failed to reactivate user')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Suspended Users</h1>
        <p className="text-dark-400 mt-1">
          Manage accounts that have been suspended
        </p>
      </div>

      <div className="relative max-w-md">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search suspended users..."
          className="input-field pl-10"
        />
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <Loader text="Loading suspended users..." />
        ) : users.length === 0 ? (
          <div className="p-12 text-center">
            <FiUserCheck className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <p className="text-dark-400">No suspended users</p>
            <p className="text-dark-500 text-sm mt-1">
              All users are in good standing
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-700">
                  <th className="text-left p-4 text-sm font-medium text-dark-400">
                    User
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-dark-400 hidden md:table-cell">
                    Reason
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-dark-400 hidden lg:table-cell">
                    Suspended On
                  </th>
                  <th className="text-right p-4 text-sm font-medium text-dark-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user._id}
                    className="border-b border-dark-700/50 hover:bg-dark-700/30 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar user={user} size="md" />
                        <div>
                          <p className="font-medium text-white">
                            {user.name || user.username}
                          </p>
                          <p className="text-xs text-dark-400">
                            @{user.username}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-dark-300 hidden md:table-cell max-w-xs truncate">
                      {user.suspensionReason || 'Not specified'}
                    </td>
                    <td className="p-4 text-sm text-dark-400 hidden lg:table-cell">
                      {user.suspendedAt
                        ? format(new Date(user.suspendedAt), 'MMM d, yyyy')
                        : 'Unknown'}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end">
                        <button
                          onClick={() => {
                            setSelectedUser(user)
                            setShowReactivateConfirm(true)
                          }}
                          className="btn-ghost flex items-center gap-2 text-green-400 border border-green-500/30 hover:bg-green-500/10 text-sm"
                        >
                          <FiUserCheck className="w-4 h-4" />
                          Reactivate
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-dark-400">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchSuspendedUsers(page - 1)}
              disabled={page === 1}
              className="btn-ghost border border-dark-600 disabled:opacity-50"
            >
              <FiChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => fetchSuspendedUsers(page + 1)}
              disabled={page === totalPages}
              className="btn-ghost border border-dark-600 disabled:opacity-50"
            >
              <FiChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={showReactivateConfirm}
        onClose={() => {
          setShowReactivateConfirm(false)
          setSelectedUser(null)
        }}
        onConfirm={handleReactivate}
        title="Reactivate User"
        message={`Are you sure you want to reactivate @${selectedUser?.username}? They will regain access to the platform.`}
        confirmText="Reactivate"
        variant="primary"
        loading={processing}
      />
    </div>
  )
}

export default AdminSuspendedUsers
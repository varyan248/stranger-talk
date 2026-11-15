import { useState, useEffect } from 'react'
import { adminService } from '../../services/adminService'
import Avatar from '../../components/Avatar'
import Loader from '../../components/Loader'
import ConfirmDialog from '../../components/ConfirmDialog'
import Modal from '../../components/Modal'
import { useDebounce } from '../../hooks/useDebounce'
import {
  FiSearch,
  FiMoreVertical,
  FiUserX,
  FiUserCheck,
  FiAlertTriangle,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const AdminUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [selectedUser, setSelectedUser] = useState(null)
  const [actionMenuOpen, setActionMenuOpen] = useState(null)
  const [showSuspendModal, setShowSuspendModal] = useState(false)
  const [showWarnModal, setShowWarnModal] = useState(false)
  const [suspendReason, setSuspendReason] = useState('')
  const [warnMessage, setWarnMessage] = useState('')
  const [processing, setProcessing] = useState(false)

  const debouncedSearch = useDebounce(searchQuery, 500)

  const fetchUsers = async (pageNum = 1) => {
    setLoading(true)
    try {
      const response = await adminService.getUsers({
        page: pageNum,
        limit: 10,
        search: debouncedSearch,
      })
      setUsers(response.data.users || [])
      setTotalPages(response.data.totalPages || 1)
      setTotal(response.data.total || 0)
      setPage(pageNum)
    } catch (error) {
      toast.error('Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers(1)
  }, [debouncedSearch]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSuspend = async () => {
    if (!selectedUser) return

    setProcessing(true)
    try {
      await adminService.suspendUser(selectedUser._id, suspendReason)
      toast.success(`${selectedUser.username} has been suspended`)
      setShowSuspendModal(false)
      setSuspendReason('')
      fetchUsers(page)
    } catch (error) {
      toast.error('Failed to suspend user')
    } finally {
      setProcessing(false)
    }
  }

  const handleUnsuspend = async (user) => {
    setProcessing(true)
    try {
      await adminService.unsuspendUser(user._id)
      toast.success(`${user.username} has been reactivated`)
      fetchUsers(page)
    } catch (error) {
      toast.error('Failed to reactivate user')
    } finally {
      setProcessing(false)
    }
  }

  const handleWarn = async () => {
    if (!selectedUser) return

    setProcessing(true)
    try {
      await adminService.warnUser(selectedUser._id, warnMessage)
      toast.success(`Warning sent to ${selectedUser.username}`)
      setShowWarnModal(false)
      setWarnMessage('')
    } catch (error) {
      toast.error('Failed to send warning')
    } finally {
      setProcessing(false)
    }
  }

  const openSuspendModal = (user) => {
    setSelectedUser(user)
    setShowSuspendModal(true)
    setActionMenuOpen(null)
  }

  const openWarnModal = (user) => {
    setSelectedUser(user)
    setShowWarnModal(true)
    setActionMenuOpen(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="text-dark-400 mt-1">
            Manage all registered users ({total} total)
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by username, name, or email..."
          className="input-field pl-10"
        />
      </div>

      {/* Users Table */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <Loader text="Loading users..." />
        ) : users.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-dark-400">No users found</p>
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
                    Email
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-dark-400 hidden lg:table-cell">
                    Joined
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-dark-400">
                    Status
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
                    <td className="p-4 text-sm text-dark-300 hidden md:table-cell">
                      {user.email}
                    </td>
                    <td className="p-4 text-sm text-dark-400 hidden lg:table-cell">
                      {format(new Date(user.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="p-4">
                      {user.isSuspended ? (
                        <span className="badge-suspended">Suspended</span>
                      ) : user.isOnline ? (
                        <span className="badge-online">Online</span>
                      ) : (
                        <span className="badge-offline">Offline</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end">
                        <div className="relative">
                          <button
                            onClick={() =>
                              setActionMenuOpen(
                                actionMenuOpen === user._id ? null : user._id
                              )
                            }
                            className="p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
                          >
                            <FiMoreVertical className="w-5 h-5" />
                          </button>

                          {actionMenuOpen === user._id && (
                            <>
                              <div
                                className="fixed inset-0 z-10"
                                onClick={() => setActionMenuOpen(null)}
                              />
                              <div className="absolute right-0 top-full mt-1 w-48 bg-dark-800 border border-dark-700 rounded-lg shadow-xl z-20 overflow-hidden">
                                {!user.isSuspended ? (
                                  <>
                                    <button
                                      onClick={() => openWarnModal(user)}
                                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-yellow-400 hover:bg-dark-700 transition-colors"
                                    >
                                      <FiAlertTriangle className="w-4 h-4" />
                                      Send Warning
                                    </button>
                                    <button
                                      onClick={() => openSuspendModal(user)}
                                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-dark-700 transition-colors"
                                    >
                                      <FiUserX className="w-4 h-4" />
                                      Suspend User
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    onClick={() => {
                                      handleUnsuspend(user)
                                      setActionMenuOpen(null)
                                    }}
                                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-green-400 hover:bg-dark-700 transition-colors"
                                  >
                                    <FiUserCheck className="w-4 h-4" />
                                    Reactivate
                                  </button>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-dark-400">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchUsers(page - 1)}
              disabled={page === 1}
              className="btn-ghost border border-dark-600 disabled:opacity-50"
            >
              <FiChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => fetchUsers(page + 1)}
              disabled={page === totalPages}
              className="btn-ghost border border-dark-600 disabled:opacity-50"
            >
              <FiChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Suspend Modal */}
      <Modal
        isOpen={showSuspendModal}
        onClose={() => setShowSuspendModal(false)}
        title="Suspend User"
      >
        <div className="space-y-4">
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-sm text-red-300">
              You are about to suspend{' '}
              <strong>@{selectedUser?.username}</strong>. They will not be able
              to login or use the platform.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Reason for suspension
            </label>
            <textarea
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              placeholder="Enter the reason..."
              rows={3}
              className="input-field resize-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowSuspendModal(false)}
              className="btn-ghost flex-1 border border-dark-600"
            >
              Cancel
            </button>
            <button
              onClick={handleSuspend}
              disabled={processing || !suspendReason.trim()}
              className="btn-danger flex-1 flex items-center justify-center gap-2"
            >
              {processing ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <FiUserX className="w-4 h-4" />
                  Suspend
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Warn Modal */}
      <Modal
        isOpen={showWarnModal}
        onClose={() => setShowWarnModal(false)}
        title="Send Warning"
      >
        <div className="space-y-4">
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-sm text-yellow-300">
              Send a warning to <strong>@{selectedUser?.username}</strong> about
              their behavior.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Warning message
            </label>
            <textarea
              value={warnMessage}
              onChange={(e) => setWarnMessage(e.target.value)}
              placeholder="Enter your warning message..."
              rows={3}
              className="input-field resize-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowWarnModal(false)}
              className="btn-ghost flex-1 border border-dark-600"
            >
              Cancel
            </button>
            <button
              onClick={handleWarn}
              disabled={processing || !warnMessage.trim()}
              className="btn-secondary flex-1 flex items-center justify-center gap-2"
            >
              {processing ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <FiAlertTriangle className="w-4 h-4" />
                  Send Warning
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default AdminUsers
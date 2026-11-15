import { useState, useEffect } from 'react'
import { adminService } from '../../services/adminService'
import Avatar from '../../components/Avatar'
import Loader from '../../components/Loader'
import Modal from '../../components/Modal'
import {
  FiFlag,
  FiCheck,
  FiX,
  FiEye,
  FiFilter,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const AdminReports = () => {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('pending')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedReport, setSelectedReport] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [adminNote, setAdminNote] = useState('')
  const [processing, setProcessing] = useState(false)

  const fetchReports = async (pageNum = 1, status = statusFilter) => {
    setLoading(true)
    try {
      const response = await adminService.getReports({
        page: pageNum,
        limit: 10,
        status: status === 'all' ? undefined : status,
      })
      setReports(response.data.reports || [])
      setTotalPages(response.data.totalPages || 1)
      setPage(pageNum)
    } catch (error) {
      toast.error('Failed to fetch reports')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports(1, statusFilter)
  }, [statusFilter]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleViewReport = async (report) => {
    try {
      const response = await adminService.getReport(report._id)
      setSelectedReport(response.data.report)
      setShowDetailModal(true)
    } catch (error) {
      toast.error('Failed to load report details')
    }
  }

  const handleUpdateStatus = async (status) => {
    if (!selectedReport) return

    setProcessing(true)
    try {
      await adminService.updateReportStatus(
        selectedReport._id,
        status,
        adminNote
      )
      toast.success(`Report ${status}`)
      setShowDetailModal(false)
      setAdminNote('')
      fetchReports(page)
    } catch (error) {
      toast.error('Failed to update report')
    } finally {
      setProcessing(false)
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="badge bg-yellow-500/20 text-yellow-400">Pending</span>
      case 'resolved':
        return <span className="badge bg-green-500/20 text-green-400">Resolved</span>
      case 'dismissed':
        return <span className="badge bg-gray-500/20 text-gray-400">Dismissed</span>
      default:
        return <span className="badge">{status}</span>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Reports</h1>
        <p className="text-dark-400 mt-1">
          Review and manage user reports
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <FiFilter className="w-4 h-4 text-dark-400 flex-shrink-0" />
        {['pending', 'resolved', 'dismissed', 'all'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors whitespace-nowrap ${
              statusFilter === status
                ? 'bg-primary-600 text-white'
                : 'bg-dark-800 text-dark-300 hover:text-white hover:bg-dark-700'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Reports List */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <Loader text="Loading reports..." />
        ) : reports.length === 0 ? (
          <div className="p-12 text-center">
            <FiFlag className="w-12 h-12 text-dark-600 mx-auto mb-4" />
            <p className="text-dark-400">No {statusFilter} reports</p>
          </div>
        ) : (
          <div className="divide-y divide-dark-700">
            {reports.map((report) => (
              <div
                key={report._id}
                className="p-4 hover:bg-dark-700/30 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <FiFlag className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-white capitalize">
                          {report.reason}
                        </span>
                        {getStatusBadge(report.status)}
                      </div>
                      <p className="text-sm text-dark-400 mt-1">
                        Reported by{' '}
                        <span className="text-dark-300">
                          @{report.reporter?.username}
                        </span>{' '}
                        against{' '}
                        <span className="text-red-400">
                          @{report.reportedUser?.username}
                        </span>
                      </p>
                      {report.description && (
                        <p className="text-sm text-dark-500 mt-1 line-clamp-1">
                          {report.description}
                        </p>
                      )}
                      <p className="text-xs text-dark-500 mt-2">
                        {format(new Date(report.createdAt), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleViewReport(report)}
                    className="btn-ghost flex items-center gap-2 border border-dark-600 self-start sm:self-center"
                  >
                    <FiEye className="w-4 h-4" />
                    Review
                  </button>
                </div>
              </div>
            ))}
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
              onClick={() => fetchReports(page - 1)}
              disabled={page === 1}
              className="btn-ghost border border-dark-600 disabled:opacity-50"
            >
              <FiChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => fetchReports(page + 1)}
              disabled={page === totalPages}
              className="btn-ghost border border-dark-600 disabled:opacity-50"
            >
              <FiChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Report Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Report Details"
        size="lg"
      >
        {selectedReport && (
          <div className="space-y-6">
            {/* Status */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-dark-400">Status</span>
              {getStatusBadge(selectedReport.status)}
            </div>

            {/* Users */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-dark-700/50 rounded-lg">
                <p className="text-xs text-dark-400 mb-2">Reported By</p>
                <div className="flex items-center gap-3">
                  <Avatar user={selectedReport.reporter} size="sm" />
                  <div>
                    <p className="font-medium text-white text-sm">
                      {selectedReport.reporter?.username}
                    </p>
                    <p className="text-xs text-dark-400">
                      {selectedReport.reporter?.email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-xs text-red-400 mb-2">Reported User</p>
                <div className="flex items-center gap-3">
                  <Avatar user={selectedReport.reportedUser} size="sm" />
                  <div>
                    <p className="font-medium text-white text-sm">
                      {selectedReport.reportedUser?.username}
                    </p>
                    <p className="text-xs text-dark-400">
                      {selectedReport.reportedUser?.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Reason */}
            <div>
              <p className="text-sm text-dark-400 mb-2">Reason</p>
              <p className="text-white capitalize bg-dark-700/50 p-3 rounded-lg">
                {selectedReport.reason}
              </p>
            </div>

            {/* Description */}
            {selectedReport.description && (
              <div>
                <p className="text-sm text-dark-400 mb-2">Description</p>
                <p className="text-dark-300 bg-dark-700/50 p-3 rounded-lg">
                  {selectedReport.description}
                </p>
              </div>
            )}

            {/* Reported Messages */}
            {selectedReport.messages?.length > 0 && (
              <div>
                <p className="text-sm text-dark-400 mb-2">
                  Reported Messages (Evidence)
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedReport.messages.map((msg, i) => (
                    <div
                      key={i}
                      className="p-3 bg-dark-700/50 rounded-lg text-sm text-dark-300"
                    >
                      <p className="text-xs text-dark-500 mb-1">
                        {msg.sender?.username} •{' '}
                        {format(new Date(msg.createdAt), 'MMM d, h:mm a')}
                      </p>
                      {msg.content}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Admin Note */}
            {selectedReport.status === 'pending' && (
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Admin Note (optional)
                </label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Add a note about your decision..."
                  rows={2}
                  className="input-field resize-none"
                />
              </div>
            )}

            {/* Actions */}
            {selectedReport.status === 'pending' && (
              <div className="flex gap-3 pt-4 border-t border-dark-700">
                <button
                  onClick={() => handleUpdateStatus('dismissed')}
                  disabled={processing}
                  className="btn-ghost flex-1 border border-dark-600 flex items-center justify-center gap-2"
                >
                  <FiX className="w-4 h-4" />
                  Dismiss
                </button>
                <button
                  onClick={() => handleUpdateStatus('resolved')}
                  disabled={processing}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <FiCheck className="w-4 h-4" />
                      Resolve
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default AdminReports
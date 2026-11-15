import { useState } from 'react'
import Modal from './Modal'
import { FiFlag } from 'react-icons/fi'
import { chatService } from '../services/chatService'
import toast from 'react-hot-toast'

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam or unwanted messages' },
  { value: 'harassment', label: 'Harassment or bullying' },
  { value: 'inappropriate', label: 'Inappropriate content' },
  { value: 'threats', label: 'Threats or violence' },
  { value: 'scam', label: 'Scam or fraud' },
  { value: 'fake', label: 'Fake profile' },
  { value: 'other', label: 'Other' },
]

const ReportModal = ({ isOpen, onClose, userId, username }) => {
  const [selectedReason, setSelectedReason] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!selectedReason) {
      toast.error('Please select a reason')
      return
    }

    setLoading(true)
    try {
      await chatService.reportUser(userId, {
        reason: selectedReason,
        description: description.trim(),
      })
      toast.success('Report submitted successfully')
      onClose()
      setSelectedReason('')
      setDescription('')
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to submit report'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Report User" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <FiFlag className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-300">
            You are reporting <strong>@{username}</strong>. Your report will be
            reviewed by our moderation team.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-dark-300 mb-2">
            Reason for report *
          </label>
          <div className="space-y-2">
            {REPORT_REASONS.map((reason) => (
              <label
                key={reason.value}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedReason === reason.value
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-dark-600 hover:border-dark-500 bg-dark-800'
                }`}
              >
                <input
                  type="radio"
                  name="reason"
                  value={reason.value}
                  checked={selectedReason === reason.value}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="w-4 h-4 text-primary-600 bg-dark-700 border-dark-600 focus:ring-primary-500"
                />
                <span className="text-sm text-white">{reason.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-dark-300 mb-2">
            Additional details (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide more context about your report..."
            rows={3}
            maxLength={500}
            className="input-field resize-none"
          />
          <p className="text-xs text-dark-500 mt-1 text-right">
            {description.length}/500
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="btn-ghost flex-1 border border-dark-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !selectedReason}
            className="btn-danger flex-1 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <FiFlag className="w-4 h-4" />
                Submit Report
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default ReportModal
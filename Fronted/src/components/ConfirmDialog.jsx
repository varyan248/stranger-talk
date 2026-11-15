import Modal from './Modal'
import { FiAlertTriangle } from 'react-icons/fi'

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
}) => {
  const variantClasses = {
    danger: 'btn-danger',
    primary: 'btn-primary',
    secondary: 'btn-secondary',
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="text-center">
        <div
          className={`w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-4 ${
            variant === 'danger' ? 'bg-red-500/20' : 'bg-primary-500/20'
          }`}
        >
          <FiAlertTriangle
            className={`w-7 h-7 ${
              variant === 'danger' ? 'text-red-400' : 'text-primary-400'
            }`}
          />
        </div>

        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-dark-400 text-sm mb-6">{message}</p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="btn-ghost flex-1 border border-dark-600"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`${variantClasses[variant]} flex-1 flex items-center justify-center gap-2`}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default ConfirmDialog
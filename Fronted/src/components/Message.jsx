import { useState } from 'react'
import { format } from 'date-fns'
import {
  FiCheck,
  FiCheckCircle,
  FiMoreVertical,
  FiTrash2,
  FiFlag,
} from 'react-icons/fi'
import Avatar from './Avatar'
import { useAuth } from '../context/AuthContext'

const isMeaningfulId = (val) => {
  if (val === undefined || val === null) return false
  const s = String(val).trim()
  return s !== '' && s !== 'undefined' && s !== 'null'
}

const Message = ({ message, showAvatar = true, onDelete, onReport }) => {
  const { user } = useAuth()
  const [showMenu, setShowMenu] = useState(false)

  const senderId = message?.sender?._id ?? message?.sender
  const myId = user?._id

  const isOwn =
    isMeaningfulId(senderId) &&
    isMeaningfulId(myId) &&
    String(senderId) === String(myId)

  const formatTime = (date) => {
    try {
      return format(new Date(date), 'h:mm a')
    } catch {
      return ''
    }
  }

  const getStatusIcon = () => {
    if (!isOwn) return null
    switch (message.status) {
      case 'delivered':
        return <FiCheckCircle className="w-3.5 h-3.5 text-dark-400" />
      case 'read':
        return <FiCheckCircle className="w-3.5 h-3.5 text-primary-400" />
      default:
        return <FiCheck className="w-3.5 h-3.5 text-dark-400" />
    }
  }

  return (
    <div
      className={`flex items-end gap-2 group animate-fade-in ${
        isOwn ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      {!isOwn && showAvatar ? (
        <Avatar user={message.sender} size="sm" className="flex-shrink-0 mb-5" />
      ) : (
        !isOwn && <div className="w-8 flex-shrink-0" />
      )}

      <div
        className={`flex flex-col max-w-[75%] sm:max-w-[60%] ${
          isOwn ? 'items-end' : 'items-start'
        }`}
      >
        {!isOwn && showAvatar && (
          <span className="text-xs text-dark-500 mb-1 ml-1">
            {message.sender?.username || message.sender?.name || 'Unknown'}
          </span>
        )}

        <div className="relative group/message">
          <div
            className={`px-4 py-2.5 rounded-2xl ${
              isOwn
                ? 'bg-primary-600 text-white rounded-br-md'
                : 'bg-dark-700 text-white rounded-bl-md'
            }`}
          >
            {message.type === 'image' ? (
              <img
                src={message.content}
                alt="Shared"
                className="max-w-full rounded-lg"
              />
            ) : message.type === 'voice' ? (
              <audio controls src={message.content} className="max-w-full" />
            ) : (
              <p className="text-sm whitespace-pre-wrap break-words">
                {message.content || message.text}
              </p>
            )}
          </div>

          <button
            onClick={() => setShowMenu(!showMenu)}
            className={`absolute top-1/2 -translate-y-1/2 p-1 rounded-full opacity-0 group-hover/message:opacity-100 transition-opacity bg-dark-800 border border-dark-600 ${
              isOwn ? '-left-8' : '-right-8'
            }`}
          >
            <FiMoreVertical className="w-3.5 h-3.5 text-dark-300" />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div
                className={`absolute z-20 top-8 ${
                  isOwn ? 'left-0' : 'right-0'
                } w-36 bg-dark-800 border border-dark-700 rounded-lg shadow-xl overflow-hidden`}
              >
                {isOwn ? (
                  <button
                    onClick={() => {
                      onDelete?.(message._id)
                      setShowMenu(false)
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-dark-700 transition-colors"
                  >
                    <FiTrash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      onReport?.(message)
                      setShowMenu(false)
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-dark-700 transition-colors"
                  >
                    <FiFlag className="w-3.5 h-3.5" />
                    Report
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        <div
          className={`flex items-center gap-1 mt-1 ${
            isOwn ? 'flex-row-reverse' : 'flex-row'
          }`}
        >
          <span className="text-xs text-dark-500">
            {formatTime(message.createdAt)}
          </span>
          {getStatusIcon()}
        </div>
      </div>
    </div>
  )
}

export default Message
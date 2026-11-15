import { useNavigate } from 'react-router-dom'
import { FiMessageCircle, FiMapPin, FiUser } from 'react-icons/fi'
import Avatar from './Avatar'
import { useChat } from '../context/ChatContext'
import { useLocation } from '../hooks/useLocation'
import { useState } from 'react'

const UserCard = ({ user, distance, onStartChat }) => {
  const [starting, setStarting] = useState(false)
  const { startConversation } = useChat()
  const { formatDistance } = useLocation()
  const navigate = useNavigate()

  const handleStartChat = async () => {
    if (onStartChat) {
      onStartChat(user)
      return
    }

    try {
      setStarting(true)
      const conversation = await startConversation(user._id)
      navigate(`/chat/${conversation._id}`)
    } catch (error) {
      console.error('Failed to start chat:', error)
    } finally {
      setStarting(false)
    }
  }

  const handleViewProfile = () => {
    navigate(`/profile/${user._id}`)
  }

  return (
    <div className="card-hover group animate-fade-in">
      <div className="flex items-start gap-4">
        <button onClick={handleViewProfile} className="flex-shrink-0">
          <Avatar user={user} size="lg" showStatus />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <button
                onClick={handleViewProfile}
                className="font-semibold text-white hover:text-primary-400 transition-colors truncate block text-left"
              >
                {user.name || user.username}
              </button>
              <p className="text-sm text-dark-400 truncate">@{user.username}</p>
            </div>

            {user.isOnline ? (
              <span className="badge-online flex-shrink-0">Online</span>
            ) : (
              <span className="badge-offline flex-shrink-0">Offline</span>
            )}
          </div>

          {user.bio && (
            <p className="text-sm text-dark-400 mt-1 line-clamp-2">{user.bio}</p>
          )}

          <div className="flex items-center gap-4 mt-2 text-xs text-dark-500">
            {distance !== undefined && (
              <span className="flex items-center gap-1">
                <FiMapPin className="w-3 h-3" />
                {formatDistance(distance)} away
              </span>
            )}
            {user.interests?.length > 0 && (
              <span className="flex items-center gap-1">
                <FiUser className="w-3 h-3" />
                {user.interests.slice(0, 2).join(', ')}
                {user.interests.length > 2 && ` +${user.interests.length - 2}`}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={handleStartChat}
              disabled={starting}
              className="btn-primary flex-1 flex items-center justify-center gap-2 py-2 text-sm"
            >
              {starting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <FiMessageCircle className="w-4 h-4" />
                  Chat
                </>
              )}
            </button>
            <button
              onClick={handleViewProfile}
              className="btn-ghost py-2 text-sm border border-dark-600"
            >
              View
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserCard
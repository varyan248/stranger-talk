import { useSocket } from '../context/SocketContext'
import Avatar from './Avatar'
import { FiCircle } from 'react-icons/fi'

const OnlineUsersList = ({ onSelectUser, limit = 10 }) => {
  const { onlineUsers, isConnected } = useSocket()

  if (!isConnected) {
    return (
      <div className="text-center py-6">
        <p className="text-dark-500 text-sm">Connecting...</p>
      </div>
    )
  }

  if (onlineUsers.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-dark-500 text-sm">No users online</p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {onlineUsers.slice(0, limit).map((user) => (
        <button
          key={user._id}
          onClick={() => onSelectUser?.(user)}
          className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-dark-700 transition-colors text-left"
        >
          <Avatar user={user} size="sm" showStatus />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user.username}
            </p>
            <p className="text-xs text-online flex items-center gap-1">
              <FiCircle className="w-2 h-2 fill-current" />
              Online
            </p>
          </div>
        </button>
      ))}

      {onlineUsers.length > limit && (
        <p className="text-xs text-dark-500 text-center pt-2">
          +{onlineUsers.length - limit} more online
        </p>
      )}
    </div>
  )
}

export default OnlineUsersList
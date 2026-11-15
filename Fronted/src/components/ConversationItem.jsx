import { formatDistanceToNow } from 'date-fns'
import Avatar from './Avatar'
import { useAuth } from '../context/AuthContext'

const ConversationItem = ({ conversation, isActive, onClick, unreadCount = 0 }) => {
  const { user } = useAuth()

  const otherUser = conversation.participants?.find((p) => p._id !== user?._id)

  const formatTime = (date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: false })
        .replace('about ', '')
        .replace(' minutes', 'm')
        .replace(' minute', 'm')
        .replace(' hours', 'h')
        .replace(' hour', 'h')
        .replace(' days', 'd')
        .replace(' day', 'd')
    } catch {
      return ''
    }
  }

  const getLastMessagePreview = () => {
    const msg = conversation.lastMessage
    if (!msg) return 'No messages yet'

    const prefix = msg.sender?._id === user?._id ? 'You: ' : ''

    if (msg.type === 'image') return `${prefix}📷 Photo`
    if (msg.type === 'voice') return `${prefix}🎤 Voice message`

    const content = msg.content || ''
    return `${prefix}${content.length > 40 ? content.slice(0, 40) + '...' : content}`
  }

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
        isActive
          ? 'bg-primary-600/20 border border-primary-600/30'
          : 'hover:bg-dark-700 border border-transparent'
      }`}
    >
      <Avatar user={otherUser} size="md" showStatus />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span
            className={`font-medium truncate ${
              isActive ? 'text-primary-400' : 'text-white'
            }`}
          >
            {otherUser?.name || otherUser?.username || 'Unknown'}
          </span>
          <span className="text-xs text-dark-500 flex-shrink-0">
            {formatTime(conversation.updatedAt || conversation.lastMessage?.createdAt)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 mt-1">
          <span className="text-sm text-dark-400 truncate">
            {getLastMessagePreview()}
          </span>
          {unreadCount > 0 && (
            <span className="flex-shrink-0 w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}

export default ConversationItem
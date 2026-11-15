import { useState, useRef, useEffect } from 'react'
import { 
  FiSend, FiSmile, FiPaperclip, FiX, FiArrowLeft, 
  FiAlertCircle, FiMoreVertical, FiUserX 
} from 'react-icons/fi'
import EmojiPicker from 'emoji-picker-react'
import toast from 'react-hot-toast'
import { useChat } from '../context/ChatContext'
import { useSocket } from '../context/SocketContext'
import { useAuth } from '../context/AuthContext'
import { chatService } from '../services/chatService'
import Avatar from './Avatar'
import Message from './Message'
import Loader from './Loader'

const ChatBox = ({ conversation, onBack }) => {
  const [newMessage, setNewMessage] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [blockError, setBlockError] = useState(null)
  
  // State for the 3-dot menu
  const [showMenu, setShowMenu] = useState(false)

  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const menuRef = useRef(null)

  const { user } = useAuth()
  const { socket, emitTyping, joinRoom, leaveRoom } = useSocket()
  const {
    messages,
    fetchMessages,
    sendMessage,
    markAsRead,
    typingUsers,
    fetchConversations, // Needed to refresh sidebar after block
  } = useChat()

  const conversationMessages = messages[conversation?._id] || []
  const otherUser = conversation?.participants?.find(
    (p) => String(p._id) !== String(user?._id)
  )
  const isOtherTyping = typingUsers[conversation?._id]?.[otherUser?._id] || false

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    setBlockError(null)
    setShowMenu(false)
  }, [conversation?._id])

  useEffect(() => {
    if (!socket || !conversation?._id) return
    joinRoom(conversation._id)
    return () => leaveRoom(conversation._id)
  }, [socket, conversation?._id, joinRoom, leaveRoom])

  useEffect(() => {
    if (!conversation?._id) return
    const loadMessages = async () => {
      setLoadingMessages(true)
      setPage(1)
      try {
        const result = await fetchMessages(conversation._id, 1)
        setHasMore(result.hasMore)
        markAsRead(conversation._id)
      } catch (error) {
        console.error('Failed to load messages:', error)
      } finally {
        setLoadingMessages(false)
      }
    }
    loadMessages()
  }, [conversation?._id, fetchMessages, markAsRead])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversationMessages.length])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !conversation?._id || blockError) return

    const content = newMessage.trim()
    setNewMessage('')
    setShowEmojiPicker(false)

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    emitTyping(conversation._id, false)
    setIsTyping(false)

    try {
      await sendMessage(conversation._id, content)
      setTimeout(scrollToBottom, 100)
    } catch (error) {
      if (error.response?.status === 403) {
        setBlockError(error.response.data.message || "You cannot send messages to this user.")
      } else {
        console.error('Failed to send message:', error)
      }
    }
  }

  const handleBlock = async () => {
    if (!otherUser) return
    const confirmBlock = window.confirm(`Are you sure you want to block ${otherUser.username}?`)
    if (!confirmBlock) return

    try {
      await chatService.blockUser(otherUser._id)
      toast.success(`You blocked ${otherUser.username}`)
      fetchConversations() // Refresh sidebar to remove this conversation
      if (onBack) onBack() // Close chat on mobile
    } catch (error) {
      toast.error('Failed to block user')
    }
  }

  const handleTyping = (e) => {
    setNewMessage(e.target.value)
    if (!isTyping) {
      setIsTyping(true)
      emitTyping(conversation._id, true)
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      emitTyping(conversation._id, false)
    }, 1500)
  }

  const handleEmojiClick = (emojiData) => {
    setNewMessage((prev) => prev + emojiData.emoji)
  }

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-dark-900">
        <div className="text-center">
          <div className="w-20 h-20 bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiSend className="w-8 h-8 text-dark-500" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Select a conversation</h3>
          <p className="text-dark-400">Choose from your existing conversations or start a new one</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-dark-900 h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-dark-800 border-b border-dark-700">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="lg:hidden p-2 text-dark-300 hover:text-white hover:bg-dark-700 rounded-lg transition-colors">
              <FiArrowLeft className="w-5 h-5" />
            </button>
          )}
          <Avatar user={otherUser} size="md" showStatus />
          <div>
            <h3 className="font-semibold text-white">{otherUser?.name || otherUser?.username}</h3>
            <p className="text-xs text-dark-400">
              {isOtherTyping ? (
                <span className="text-primary-400 animate-pulse">typing...</span>
              ) : otherUser?.online || otherUser?.isOnline ? (
                <span className="text-online">Online</span>
              ) : (
                'Offline'
              )}
            </p>
          </div>
        </div>

        {/* 🔥 NEW: 3-DOT MENU FOR BLOCKING 🔥 */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
          >
            <FiMoreVertical className="w-5 h-5" />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-dark-800 border border-dark-700 rounded-xl shadow-xl overflow-hidden z-50 animate-fade-in">
              <button
                onClick={handleBlock}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left"
              >
                <FiUserX className="w-4 h-4" />
                Block User
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {loadingMessages && page === 1 ? (
          <Loader text="Loading messages..." />
        ) : conversationMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Avatar user={otherUser} size="xl" className="mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-1">{otherUser?.name || otherUser?.username}</h3>
              <p className="text-dark-400 text-sm">Start a conversation with {otherUser?.username}</p>
            </div>
          </div>
        ) : (
          <>
            {conversationMessages.map((message, index) => {
              const senderId = String(message?.sender?._id ?? message?.sender ?? '')
              const prev = conversationMessages[index - 1]
              const prevSenderId = String(prev?.sender?._id ?? prev?.sender ?? '')
              const showAvatar = !prev || prevSenderId !== senderId
              const key = message._id ? String(message._id) : `${senderId}-${message.createdAt || index}-${index}`

              return <Message key={key} message={message} showAvatar={showAvatar} />
            })}

            {isOtherTyping && (
              <div className="flex items-end gap-2">
                <Avatar user={otherUser} size="sm" />
                <div className="bg-dark-700 px-4 py-3 rounded-2xl rounded-bl-md">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-dark-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-dark-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-dark-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input OR Blocked Warning */}
      {blockError ? (
        <div className="p-4 bg-red-500/10 border-t border-red-500/30">
          <p className="text-center text-red-400 font-medium text-sm flex items-center justify-center gap-2">
            <FiAlertCircle className="w-5 h-5" />
            {blockError}
          </p>
        </div>
      ) : (
        <div className="p-4 bg-dark-800 border-t border-dark-700">
          <form onSubmit={handleSend} className="flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                value={newMessage}
                onChange={handleTyping}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend(e)
                  }
                }}
                placeholder="Type a message..."
                rows={1}
                className="input-field resize-none pr-20 max-h-32"
                style={{ minHeight: '44px' }}
              />
              <div className="absolute right-2 bottom-2 flex items-center gap-1">
                <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-2 text-dark-400 hover:text-primary-400 transition-colors">
                  <FiSmile className="w-5 h-5" />
                </button>
                <button type="button" className="p-2 text-dark-400 hover:text-primary-400 transition-colors">
                  <FiPaperclip className="w-5 h-5" />
                </button>
              </div>

              {showEmojiPicker && (
                <div className="absolute bottom-full right-0 mb-2 z-20">
                  <div className="relative">
                    <button onClick={() => setShowEmojiPicker(false)} className="absolute -top-2 -right-2 z-10 p-1 bg-dark-700 rounded-full text-dark-300 hover:text-white">
                      <FiX className="w-4 h-4" />
                    </button>
                    <EmojiPicker onEmojiClick={handleEmojiClick} theme="dark" width={320} height={400} searchPlaceholder="Search emoji..." skinTonesDisabled />
                  </div>
                </div>
              )}
            </div>
            <button type="submit" disabled={!newMessage.trim()} className="btn-primary p-3 disabled:opacity-50">
              <FiSend className="w-5 h-5" />
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

export default ChatBox
import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import ChatBox from '../components/ChatBox'
import ConversationItem from '../components/ConversationItem'
import OnlineUsersList from '../components/OnlineUsersList'
import { SkeletonChatItem } from '../components/SkeletonCard'
import EmptyState from '../components/EmptyState'
import ConfirmDialog from '../components/ConfirmDialog'
import { useChat } from '../context/ChatContext'
import { useSocket } from '../context/SocketContext'
import { useAuth } from '../context/AuthContext'
import { chatService } from '../services/chatService'
import {
  FiSearch,
  FiMessageCircle,
  FiUsers,
  FiTrash2,
  FiChevronLeft,
} from 'react-icons/fi'
import { useDebounce } from '../hooks/useDebounce'
import toast from 'react-hot-toast'

const Chat = () => {
  const { conversationId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { socket, isConnected, joinRoom, leaveRoom } = useSocket()
  const {
    conversations,
    activeConversation,
    unreadCounts,
    loading,
    setActiveConversation,
    fetchConversations,
    addMessage,
    setTyping,
    deleteConversation,
  } = useChat()

  const [searchQuery, setSearchQuery] = useState('')
  const [showSidebar, setShowSidebar] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const debouncedSearch = useDebounce(searchQuery, 300)

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  // Set active conversation from URL
  useEffect(() => {
    if (conversationId && conversations.length > 0) {
      const conv = conversations.find((c) => c._id === conversationId)
      if (conv) {
        setActiveConversation(conv)
        setShowSidebar(false)
      }
    } else if (!conversationId) {
      setActiveConversation(null)
      setShowSidebar(true)
    }
  }, [conversationId, conversations, setActiveConversation])

  // Join/leave socket room
  useEffect(() => {
    if (conversationId && socket) {
      joinRoom(conversationId)
      return () => {
        leaveRoom(conversationId)
      }
    }
  }, [conversationId, socket, joinRoom, leaveRoom])

  // Socket event listeners
  useEffect(() => {
    if (!socket) return

    const handleNewMessage = (data) => {
      const { conversationId: convId, message } = data
      if (message.sender?._id !== user?._id) {
        addMessage(convId, message)
      }
    }

    const handleTyping = (data) => {
      const { conversationId: convId, userId, isTyping } = data
      if (userId !== user?._id) {
        setTyping(convId, userId, isTyping)
      }
    }

    const handleMessageRead = (data) => {
      const { conversationId: convId } = data
      // Update messages read status - handled in context
    }

    socket.on('new-message', handleNewMessage)
    socket.on('user-typing', handleTyping)
    socket.on('message-read', handleMessageRead)

    return () => {
      socket.off('new-message', handleNewMessage)
      socket.off('user-typing', handleTyping)
      socket.off('message-read', handleMessageRead)
    }
  }, [socket, user?._id, addMessage, setTyping])

  const handleSelectConversation = (conversation) => {
    setActiveConversation(conversation)
    navigate(`/chat/${conversation._id}`)
    setShowSidebar(false)
  }

  const handleBack = () => {
    setShowSidebar(true)
    navigate('/chat')
  }

  const handleDeleteConversation = async () => {
    if (!activeConversation) return

    setDeleting(true)
    try {
      await deleteConversation(activeConversation._id)
      setShowDeleteConfirm(false)
      navigate('/chat')
    } finally {
      setDeleting(false)
    }
  }

  // Filter conversations
  const filteredConversations = conversations.filter((conv) => {
    if (!debouncedSearch) return true
    const otherUser = conv.participants?.find((p) => p._id !== user?._id)
    const query = debouncedSearch.toLowerCase()
    return (
      otherUser?.username?.toLowerCase().includes(query) ||
      otherUser?.name?.toLowerCase().includes(query)
    )
  })

  return (
    <div className="h-screen flex flex-col bg-dark-900 overflow-hidden">
      <Navbar />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div
          className={`${
            showSidebar ? 'flex' : 'hidden'
          } lg:flex flex-col w-full lg:w-80 xl:w-96 bg-dark-800 border-r border-dark-700`}
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b border-dark-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <FiMessageCircle className="w-5 h-5 text-primary-400" />
                Messages
              </h2>
              <span
                className={`badge ${
                  isConnected
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-red-500/20 text-red-400'
                }`}
              >
                {isConnected ? 'Connected' : 'Offline'}
              </span>
            </div>

            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="input-field pl-9 py-2 text-sm"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto p-2">
            {loading ? (
              <div className="space-y-1">
                {[...Array(5)].map((_, i) => (
                  <SkeletonChatItem key={i} />
                ))}
              </div>
            ) : filteredConversations.length === 0 ? (
              <EmptyState
                icon={FiMessageCircle}
                title={
                  searchQuery ? 'No conversations found' : 'No conversations yet'
                }
                description={
                  searchQuery
                    ? 'Try a different search term'
                    : 'Start chatting with someone nearby to see your conversations here'
                }
                action={() => navigate('/nearby')}
                actionLabel={searchQuery ? null : 'Find People'}
              />
            ) : (
              <div className="space-y-1">
                {filteredConversations.map((conversation) => (
                  <ConversationItem
                    key={conversation._id}
                    conversation={conversation}
                    isActive={activeConversation?._id === conversation._id}
                    unreadCount={unreadCounts[conversation._id] || 0}
                    onClick={() => handleSelectConversation(conversation)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Online Users */}
          <div className="border-t border-dark-700 p-4 max-h-48 overflow-y-auto">
            <h3 className="text-sm font-semibold text-dark-300 mb-3 flex items-center gap-2">
              <FiUsers className="w-4 h-4 text-online" />
              Online Users
            </h3>
            <OnlineUsersList
              onSelectUser={(onlineUser) => {
                const conv = conversations.find((c) =>
                  c.participants?.some((p) => p._id === onlineUser._id)
                )
                if (conv) {
                  handleSelectConversation(conv)
                } else {
                  navigate(`/profile/${onlineUser._id}`)
                }
              }}
            />
          </div>
        </div>

        {/* Chat Area */}
        <div className={`${showSidebar ? 'hidden' : 'flex'} lg:flex flex-1`}>
          <ChatBox conversation={activeConversation} onBack={handleBack} />
        </div>
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConversation}
        title="Delete Conversation"
        message="Are you sure you want to delete this conversation? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
        loading={deleting}
      />
    </div>
  )
}

export default Chat
import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react'
import { chatService } from '../services/chatService'
import { useSocket } from './SocketContext'
import toast from 'react-hot-toast'

const ChatContext = createContext(null)

export const useChat = () => {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}

export const ChatProvider = ({ children }) => {
  const { socket } = useSocket()

  const [conversations, setConversations] = useState([])
  const [activeConversation, setActiveConversation] = useState(null)
  const [messages, setMessages] = useState({})
  const [unreadCounts, setUnreadCounts] = useState({})
  const [loading, setLoading] = useState(false)
  const [typingUsers, setTypingUsers] = useState({})

  // 🔥 MASTER SOCKET LISTENER: Handles all real-time updates globally
  useEffect(() => {
    if (!socket) return

    // 1. Listen for new messages
    const handleNewMessage = ({ conversationId, message }) => {
      // Add to the specific conversation's message list
      setMessages((prev) => {
        const existing = prev[conversationId] || []
        if (existing.find((m) => m._id === message._id)) return prev
        return { ...prev, [conversationId]: [...existing, message] }
      })

      // Update the conversation sidebar's last message
      setConversations((prev) =>
        prev.map((conv) =>
          conv._id === conversationId
            ? { ...conv, lastMessage: message, updatedAt: new Date() }
            : conv
        )
      )

      // Increment unread count if user is NOT currently looking at this chat
      setActiveConversation((currentActive) => {
        if (currentActive?._id !== conversationId) {
          setUnreadCounts((prev) => ({
            ...prev,
            [conversationId]: (prev[conversationId] || 0) + 1,
          }))
        }
        return currentActive
      })
    }

    // 2. Listen for typing indicators
    const handleUserTyping = ({ conversationId, userId, isTyping }) => {
      setTypingUsers((prev) => {
        const updated = { ...prev }
        if (isTyping) {
          updated[conversationId] = {
            ...(updated[conversationId] || {}),
            [userId]: true,
          }
        } else {
          if (updated[conversationId]) {
            delete updated[conversationId][userId]
            if (Object.keys(updated[conversationId]).length === 0) {
              delete updated[conversationId]
            }
          }
        }
        return updated
      })
    }

    // 3. Listen for profile picture updates
    const handleProfileUpdate = ({ userId, profilePic }) => {
      setConversations((prevConversations) =>
        prevConversations.map((convo) => {
          const updatedParticipants = convo.participants.map((p) => {
            if (String(p._id) === String(userId)) {
              return { ...p, profilePic }
            }
            return p
          })

          let updatedLastMessage = convo.lastMessage
          if (
            updatedLastMessage &&
            updatedLastMessage.sender &&
            String(updatedLastMessage.sender._id) === String(userId)
          ) {
            updatedLastMessage = {
              ...updatedLastMessage,
              sender: { ...updatedLastMessage.sender, profilePic },
            }
          }

          return { ...convo, participants: updatedParticipants, lastMessage: updatedLastMessage }
        })
      )
    }

    socket.on('new-message', handleNewMessage)
    socket.on('user-typing', handleUserTyping)
    socket.on('user-profile-updated', handleProfileUpdate)

    return () => {
      socket.off('new-message', handleNewMessage)
      socket.off('user-typing', handleUserTyping)
      socket.off('user-profile-updated', handleProfileUpdate)
    }
  }, [socket])

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true)
      const response = await chatService.getConversations()
      setConversations(response.data.conversations || [])

      const counts = {}
      response.data.conversations?.forEach((conv) => {
        if (conv.unreadCount > 0) counts[conv._id] = conv.unreadCount
      })
      setUnreadCounts(counts)
    } catch (error) {
      console.error('Failed to fetch conversations:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchMessages = useCallback(async (conversationId, page = 1) => {
    try {
      const response = await chatService.getMessages(conversationId, page)
      const newMessages = response.data.messages || []

      setMessages((prev) => ({
        ...prev,
        [conversationId]: page === 1 ? newMessages : [...(prev[conversationId] || []), ...newMessages],
      }))

      return { messages: newMessages, hasMore: response.data.hasMore, totalPages: response.data.totalPages }
    } catch (error) {
      console.error('Failed to fetch messages:', error)
      throw error
    }
  }, [])

  const sendMessage = useCallback(async (conversationId, content, type = 'text') => {
    try {
      const response = await chatService.sendMessage(conversationId, { content, type })
      const newMessage = response.data.message

      // We don't need to add it to state here because the socket 'new-message' event will do it.
      // But if the socket fails, we can add it as a fallback.
      setMessages((prev) => {
        const existing = prev[conversationId] || []
        if (existing.find((m) => m._id === newMessage._id)) return prev
        return { ...prev, [conversationId]: [...existing, newMessage] }
      })

      setConversations((prev) =>
        prev.map((conv) =>
          conv._id === conversationId ? { ...conv, lastMessage: newMessage, updatedAt: new Date() } : conv
        )
      )
      return newMessage
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send message')
      throw error
    }
  }, [])

  const markAsRead = useCallback(async (conversationId) => {
    try {
      await chatService.markAsRead(conversationId)
      setUnreadCounts((prev) => {
        const updated = { ...prev }
        delete updated[conversationId]
        return updated
      })
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }, [])

  const emitTyping = useCallback((conversationId, isTyping) => {
    if (socket && activeConversation) {
      socket.emit('typing', { conversationId, isTyping })
    }
  }, [socket, activeConversation])

  const startConversation = useCallback(async (userId) => {
    try {
      const response = await chatService.createConversation(userId)
      const conversation = response.data.conversation

      setConversations((prev) => {
        const exists = prev.find((c) => c._id === conversation._id)
        if (exists) return prev
        return [conversation, ...prev]
      })
      return conversation
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to start conversation')
      throw error
    }
  }, [])

  const deleteConversation = useCallback(async (conversationId) => {
    try {
      await chatService.deleteConversation(conversationId)
      setConversations((prev) => prev.filter((c) => c._id !== conversationId))
      setMessages((prev) => {
        const updated = { ...prev }
        delete updated[conversationId]
        return updated
      })
      toast.success('Conversation deleted')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete conversation')
    }
  }, [])

  // 🔥 PERFORMANCE FIX: useMemo prevents the app from lagging on every keystroke
  const value = useMemo(() => ({
    conversations,
    activeConversation,
    messages,
    unreadCounts,
    loading,
    typingUsers,
    setActiveConversation,
    fetchConversations,
    fetchMessages,
    sendMessage,
    markAsRead,
    emitTyping,
    startConversation,
    deleteConversation,
  }), [
    conversations, activeConversation, messages, unreadCounts, loading, typingUsers,
    fetchConversations, fetchMessages, sendMessage, markAsRead, emitTyping, startConversation, deleteConversation
  ])

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}
import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { chatService } from '../services/chatService'
import { useSocket } from './SocketContext' // 🔥 1. Import useSocket
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
  // 🔥 2. Get the socket instance
  const { socket } = useSocket()

  const [conversations, setConversations] = useState([])
  const [activeConversation, setActiveConversation] = useState(null)
  const [messages, setMessages] = useState({})
  const [unreadCounts, setUnreadCounts] = useState({})
  const [loading, setLoading] = useState(false)
  const [typingUsers, setTypingUsers] = useState({})

  // 🔥 3. Listen for real-time profile picture updates
  useEffect(() => {
    if (!socket) return

    const handleProfileUpdate = ({ userId, profilePic }) => {
      setConversations((prevConversations) =>
        prevConversations.map((convo) => {
          // Update the participant's picture in the conversation list
          const updatedParticipants = convo.participants.map((p) => {
            if (String(p._id) === String(userId)) {
              return { ...p, profilePic }
            }
            return p
          })

          // Also update the picture in the lastMessage preview (if this user sent it)
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

          return { 
            ...convo, 
            participants: updatedParticipants,
            lastMessage: updatedLastMessage 
          }
        })
      )
    }

    socket.on('user-profile-updated', handleProfileUpdate)

    return () => {
      socket.off('user-profile-updated', handleProfileUpdate)
    }
  }, [socket])

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true)
      const response = await chatService.getConversations()
      setConversations(response.data.conversations || [])

      // Calculate unread counts
      const counts = {}
      response.data.conversations?.forEach((conv) => {
        if (conv.unreadCount > 0) {
          counts[conv._id] = conv.unreadCount
        }
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
        [conversationId]:
          page === 1
            ? newMessages
            : [...(prev[conversationId] || []), ...newMessages],
      }))

      return {
        messages: newMessages,
        hasMore: response.data.hasMore,
        totalPages: response.data.totalPages,
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error)
      throw error
    }
  }, [])

  const sendMessage = useCallback(async (conversationId, content, type = 'text') => {
    try {
      const response = await chatService.sendMessage(conversationId, {
        content,
        type,
      })

      const newMessage = response.data.message

      setMessages((prev) => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] || []), newMessage],
      }))

      // Update conversation last message
      setConversations((prev) =>
        prev.map((conv) =>
          conv._id === conversationId
            ? { ...conv, lastMessage: newMessage, updatedAt: new Date() }
            : conv
        )
      )

      return newMessage
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send message'
      toast.error(message)
      throw error
    }
  }, [])

  const addMessage = useCallback((conversationId, message) => {
    setMessages((prev) => {
      const existing = prev[conversationId] || []
      // Prevent duplicates
      if (existing.find((m) => m._id === message._id)) {
        return prev
      }
      return {
        ...prev,
        [conversationId]: [...existing, message],
      }
    })

    // Update conversation list
    setConversations((prev) =>
      prev.map((conv) =>
        conv._id === conversationId
          ? { ...conv, lastMessage: message, updatedAt: new Date() }
          : conv
      )
    )

    // Increment unread if not active conversation
    if (activeConversation?._id !== conversationId) {
      setUnreadCounts((prev) => ({
        ...prev,
        [conversationId]: (prev[conversationId] || 0) + 1,
      }))
    }
  }, [activeConversation])

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

  const setTyping = useCallback((conversationId, userId, isTyping) => {
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
  }, [])

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
      const message = error.response?.data?.message || 'Failed to start conversation'
      toast.error(message)
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
      const message = error.response?.data?.message || 'Failed to delete conversation'
      toast.error(message)
    }
  }, [])

  const value = {
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
    addMessage,
    markAsRead,
    setTyping,
    startConversation,
    deleteConversation,
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}
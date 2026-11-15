import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Avatar from '../components/Avatar'
import Message from '../components/Message'
import Loader from '../components/Loader'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import { chatService } from '../services/chatService'
import {
  FiShuffle,
  FiSend,
  FiX,
  FiFlag,
  FiUserX,
  FiSmile,
  FiArrowLeft,
} from 'react-icons/fi'
import EmojiPicker from 'emoji-picker-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const RandomChat = () => {
  const [status, setStatus] = useState('idle') // idle, searching, connected
  const [conversation, setConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [strangerTyping, setStrangerTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  const { user } = useAuth()
  const { socket, isConnected, joinRoom, leaveRoom, emitTyping } = useSocket()
  const navigate = useNavigate()

  const stranger = conversation?.participants?.find((p) => p._id !== user?._id)

  // Find random stranger
  const findStranger = async () => {
    setStatus('searching')
    setMessages([])
    setConversation(null)

    try {
      const response = await chatService.findRandomStranger()
      const conv = response.data.conversation

      if (conv) {
        setConversation(conv)
        setStatus('connected')

        if (conv.messages) {
          setMessages(conv.messages)
        }
      }
    } catch (error) {
      const message = error.response?.data?.message || 'No strangers available'
      toast.error(message)
      setStatus('idle')
    }
  }

  // Socket listeners
  useEffect(() => {
    if (!socket || status !== 'connected' || !conversation) return

    joinRoom(conversation._id)

    const handleNewMessage = (data) => {
      if (data.conversationId === conversation._id) {
        setMessages((prev) => {
          if (prev.find((m) => m._id === data.message._id)) return prev
          return [...prev, data.message]
        })
      }
    }

    const handleStrangerTyping = (data) => {
      if (
        data.conversationId === conversation._id &&
        data.userId !== user?._id
      ) {
        setStrangerTyping(data.isTyping)
      }
    }

    const handleStrangerDisconnected = (data) => {
      if (data.conversationId === conversation._id) {
        toast.error('Stranger has disconnected')
        setStatus('idle')
        setConversation(null)
      }
    }

    socket.on('new-message', handleNewMessage)
    socket.on('user-typing', handleStrangerTyping)
    socket.on('stranger-disconnected', handleStrangerDisconnected)

    return () => {
      leaveRoom(conversation._id)
      socket.off('new-message', handleNewMessage)
      socket.off('user-typing', handleStrangerTyping)
      socket.off('stranger-disconnected', handleStrangerDisconnected)
    }
  }, [socket, status, conversation, user?._id, joinRoom, leaveRoom])

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !conversation) return

    const content = newMessage.trim()
    setNewMessage('')
    setShowEmojiPicker(false)

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    emitTyping(conversation._id, false)
    setIsTyping(false)

    try {
      const response = await chatService.sendMessage(conversation._id, {
        content,
        type: 'text',
      })
      setMessages((prev) => [...prev, response.data.message])
    } catch (error) {
      toast.error('Failed to send message')
    }
  }

  const handleTyping = (e) => {
    setNewMessage(e.target.value)

    if (!isTyping) {
      setIsTyping(true)
      emitTyping(conversation._id, true)
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      emitTyping(conversation._id, false)
    }, 1500)
  }

  const handleEndChat = async () => {
    if (conversation) {
      try {
        await chatService.endRandomChat(conversation._id)
      } catch (error) {
        console.error('Failed to end chat:', error)
      }
    }
    setStatus('idle')
    setConversation(null)
    setMessages([])
  }

  const handleReport = () => {
    if (stranger) {
      navigate(`/profile/${stranger._id}`)
    }
  }

  const handleBlock = async () => {
    if (!stranger) return
    try {
      await chatService.blockUser(stranger._id)
      toast.success('User blocked')
      handleEndChat()
    } catch (error) {
      toast.error('Failed to block user')
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-dark-900">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/nearby')}
            className="btn-ghost flex items-center gap-2 mb-4 -ml-2"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to Nearby
          </button>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
                <FiShuffle className="w-7 h-7 text-primary-400" />
                Random Chat
              </h1>
              <p className="text-dark-400 mt-1">
                Get matched with a random stranger nearby
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="card min-h-[600px] flex flex-col">
          {status === 'idle' && (
            <div className="flex-1 flex flex-col items-center justify-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-primary-600/30 to-secondary-600/30 rounded-full flex items-center justify-center mb-6">
                <FiShuffle className="w-12 h-12 text-primary-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">
                Talk to a Random Stranger
              </h2>
              <p className="text-dark-400 text-center max-w-md mb-8">
                Click the button below to get matched with a random person
                nearby. The conversation is anonymous and private.
              </p>
              <button
                onClick={findStranger}
                disabled={!isConnected}
                className="btn-primary flex items-center gap-2 text-lg px-8 py-3.5"
              >
                <FiShuffle className="w-5 h-5" />
                Find a Stranger
              </button>
              {!isConnected && (
                <p className="text-red-400 text-sm mt-4">
                  Connecting to server...
                </p>
              )}

              <div className="mt-8 p-4 bg-dark-700/50 rounded-lg max-w-md">
                <h3 className="text-sm font-semibold text-dark-300 mb-2">
                  Safety Tips:
                </h3>
                <ul className="text-xs text-dark-400 space-y-1">
                  <li>• Never share personal information</li>
                  <li>• Report inappropriate behavior</li>
                  <li>• You can leave the chat anytime</li>
                </ul>
              </div>
            </div>
          )}

          {status === 'searching' && (
            <div className="flex-1 flex flex-col items-center justify-center py-16">
              <div className="relative">
                <div className="w-24 h-24 bg-primary-600/20 rounded-full flex items-center justify-center animate-pulse">
                  <FiShuffle className="w-12 h-12 text-primary-400" />
                </div>
                <div className="absolute inset-0 w-24 h-24 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
              </div>
              <h2 className="text-xl font-semibold text-white mt-6 mb-2">
                Finding someone for you...
              </h2>
              <p className="text-dark-400 text-sm">
                Searching for available strangers nearby
              </p>
              <button
                onClick={handleEndChat}
                className="btn-ghost mt-6 flex items-center gap-2 border border-dark-600"
              >
                <FiX className="w-4 h-4" />
                Cancel
              </button>
            </div>
          )}

          {status === 'connected' && stranger && (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 border-b border-dark-700">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">?</span>
                    </div>
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-online rounded-full border-2 border-dark-800" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Stranger</h3>
                    <p className="text-xs text-dark-400">
                      {strangerTyping ? (
                        <span className="text-primary-400 animate-pulse">
                          typing...
                        </span>
                      ) : (
                        'Anonymous user'
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleReport}
                    className="p-2 text-dark-400 hover:text-red-400 hover:bg-dark-700 rounded-lg transition-colors"
                    title="Report"
                  >
                    <FiFlag className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleBlock}
                    className="p-2 text-dark-400 hover:text-red-400 hover:bg-dark-700 rounded-lg transition-colors"
                    title="Block"
                  >
                    <FiUserX className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleEndChat}
                    className="btn-danger py-2 px-4 text-sm flex items-center gap-2"
                  >
                    <FiX className="w-4 h-4" />
                    End Chat
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[400px]">
                <div className="text-center py-4">
                  <p className="text-xs text-dark-500 bg-dark-700/50 inline-block px-3 py-1 rounded-full">
                    You're now chatting with a random stranger. Say hi!
                  </p>
                </div>

                {messages.map((message, index) => {
                  const isOwn = message.sender?._id === user?._id
                  return (
                    <Message
                      key={message._id || index}
                      message={{
                        ...message,
                        sender: isOwn
                          ? { username: user.username, name: user.name }
                          : { username: 'Stranger', name: 'Stranger' },
                      }}
                      isOwn={isOwn}
                      showAvatar={!isOwn}
                    />
                  )
                })}

                {strangerTyping && (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-dark-700 rounded-full" />
                    <div className="bg-dark-700 px-4 py-3 rounded-2xl">
                      <div className="flex gap-1">
                        <span
                          className="w-2 h-2 bg-dark-400 rounded-full animate-bounce"
                          style={{ animationDelay: '0ms' }}
                        />
                        <span
                          className="w-2 h-2 bg-dark-400 rounded-full animate-bounce"
                          style={{ animationDelay: '150ms' }}
                        />
                        <span
                          className="w-2 h-2 bg-dark-400 rounded-full animate-bounce"
                          style={{ animationDelay: '300ms' }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-dark-700">
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
                      className="input-field resize-none pr-12"
                      style={{ minHeight: '44px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="absolute right-3 bottom-3 text-dark-400 hover:text-primary-400 transition-colors"
                    >
                      <FiSmile className="w-5 h-5" />
                    </button>

                    {showEmojiPicker && (
                      <div className="absolute bottom-full right-0 mb-2 z-20">
                        <div className="relative">
                          <button
                            onClick={() => setShowEmojiPicker(false)}
                            className="absolute -top-2 -right-2 z-10 p-1 bg-dark-700 rounded-full text-dark-300 hover:text-white"
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                          <EmojiPicker
                            onEmojiClick={(emoji) =>
                              setNewMessage((prev) => prev + emoji.emoji)
                            }
                            theme="dark"
                            width={320}
                            height={400}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="btn-primary p-3"
                  >
                    <FiSend className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default RandomChat
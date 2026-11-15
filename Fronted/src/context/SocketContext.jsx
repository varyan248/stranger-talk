// import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
// import { io } from 'socket.io-client'
// import { useAuth } from './AuthContext'

// const SocketContext = createContext(null)

// export const useSocket = () => {
//   const context = useContext(SocketContext)
//   if (!context) {
//     throw new Error('useSocket must be used within a SocketProvider')
//   }
//   return context
// }

// export const SocketProvider = ({ children }) => {
//   const [socket, setSocket] = useState(null)
//   const [isConnected, setIsConnected] = useState(false)
//   const [onlineUsers, setOnlineUsers] = useState([])
//   const { token, isAuthenticated } = useAuth()
//   const socketRef = useRef(null)

//   useEffect(() => {
//     if (!isAuthenticated || !token) {
//       // Disconnect if not authenticated
//       if (socketRef.current) {
//         socketRef.current.disconnect()
//         socketRef.current = null
//         setSocket(null)
//         setIsConnected(false)
//       }
//       return
//     }

//     // Create socket connection
//     const newSocket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
//       auth: { token },
//       transports: ['websocket', 'polling'],
//       reconnection: true,
//       reconnectionAttempts: 5,
//       reconnectionDelay: 1000,
//     })

//     newSocket.on('connect', () => {
//       console.log('Socket connected:', newSocket.id)
//       setIsConnected(true)
//     })

//     newSocket.on('disconnect', (reason) => {
//       console.log('Socket disconnected:', reason)
//       setIsConnected(false)
//     })

//     newSocket.on('connect_error', (error) => {
//       console.error('Socket connection error:', error.message)
//       setIsConnected(false)
//     })

//     // Online users updates
//     newSocket.on('online-users', (users) => {
//       setOnlineUsers(users)
//     })

//     newSocket.on('user-online', (user) => {
//       setOnlineUsers((prev) => {
//         if (prev.find((u) => u._id === user._id)) return prev
//         return [...prev, user]
//       })
//     })

//     newSocket.on('user-offline', (userId) => {
//       setOnlineUsers((prev) => prev.filter((u) => u._id !== userId))
//     })

//     socketRef.current = newSocket
//     setSocket(newSocket)

//     return () => {
//       newSocket.disconnect()
//       socketRef.current = null
//     }
//   }, [isAuthenticated, token])

//   const joinRoom = useCallback((roomId) => {
//     if (socketRef.current) {
//       socketRef.current.emit('join-room', roomId)
//     }
//   }, [])

//   const leaveRoom = useCallback((roomId) => {
//     if (socketRef.current) {
//       socketRef.current.emit('leave-room', roomId)
//     }
//   }, [])

//   const emitTyping = useCallback((conversationId, isTyping) => {
//     if (socketRef.current) {
//       socketRef.current.emit('typing', { conversationId, isTyping })
//     }
//   }, [])

//   const value = {
//     socket,
//     isConnected,
//     onlineUsers,
//     joinRoom,
//     leaveRoom,
//     emitTyping,
//   }

//   return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
// }

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const SocketContext = createContext(null)

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState([])
  const { token, isAuthenticated } = useAuth()
  const socketRef = useRef(null)

  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
        setSocket(null)
        setIsConnected(false)
        setOnlineUsers([])
      }
      return
    }

    const newSocket = io(
      import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000',
      {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      }
    )

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id)
      setIsConnected(true)
      // Ask for the current list right after connect
      newSocket.emit('get-online-users')
    })

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason)
      setIsConnected(false)
    })

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message)
      setIsConnected(false)
    })

    // Full list of online users
    newSocket.on('online-users', (users) => {
      setOnlineUsers(users)
    })

    // Someone came online — add if not present
    newSocket.on('user-online', (user) => {
      setOnlineUsers((prev) => {
        if (prev.find((u) => String(u._id) === String(user._id))) return prev
        return [...prev, user]
      })
    })

    // Someone went offline — remove
    newSocket.on('user-offline', (userId) => {
      setOnlineUsers((prev) =>
        prev.filter((u) => String(u._id) !== String(userId))
      )
    })

    socketRef.current = newSocket
    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
      socketRef.current = null
    }
  }, [isAuthenticated, token])

  // Derive a Set of online IDs for O(1) lookups
  const onlineUserIds = useMemo(
    () => new Set(onlineUsers.map((u) => String(u._id))),
    [onlineUsers]
  )

  const isUserOnline = useCallback(
    (userId) => {
      if (!userId) return false
      return onlineUserIds.has(String(userId))
    },
    [onlineUserIds]
  )

  const joinRoom = useCallback((roomId) => {
    if (socketRef.current) socketRef.current.emit('join-room', roomId)
  }, [])

  const leaveRoom = useCallback((roomId) => {
    if (socketRef.current) socketRef.current.emit('leave-room', roomId)
  }, [])

  const emitTyping = useCallback((conversationId, isTyping) => {
    if (socketRef.current) {
      socketRef.current.emit('typing', { conversationId, isTyping })
    }
  }, [])

  const value = {
    socket,
    isConnected,
    onlineUsers,
    onlineUserIds,
    isUserOnline,
    joinRoom,
    leaveRoom,
    emitTyping,
  }

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}
import api from './api'

export const chatService = {
  // Conversations
  getConversations: () => api.get('/chat/conversations'),

  createConversation: (userId) => api.post('/chat/conversations', { userId }),

  getConversation: (conversationId) =>
    api.get(`/chat/conversations/${conversationId}`),

  deleteConversation: (conversationId) =>
    api.delete(`/chat/conversations/${conversationId}`),

  // Messages
  getMessages: (conversationId, page = 1, limit = 50) =>
    api.get(`/chat/conversations/${conversationId}/messages`, {
      params: { page, limit },
    }),

  sendMessage: (conversationId, messageData) =>
    api.post(`/chat/conversations/${conversationId}/messages`, messageData),

  markAsRead: (conversationId) =>
    api.put(`/chat/conversations/${conversationId}/read`),

  deleteMessage: (messageId) => api.delete(`/chat/messages/${messageId}`),

  // Random chat
  findRandomStranger: () => api.post('/chat/random'),

  endRandomChat: (conversationId) =>
    api.post(`/chat/random/${conversationId}/end`),

  // Block/Report
  blockUser: (userId) => api.post(`/chat/block/${userId}`),

  unblockUser: (userId) => api.delete(`/chat/block/${userId}`),

  getBlockedUsers: () => api.get('/chat/blocked'),

  reportUser: (userId, reportData) =>
    api.post(`/chat/report/${userId}`, reportData),
}   
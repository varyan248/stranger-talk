import api from './api'

export const authService = {
  register: (userData) => api.post('/auth/register', userData),

  login: (credentials) => api.post('/auth/login', credentials),

  getMe: () => api.get('/auth/me'),

  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),

  resetPassword: (token, password) =>
    api.put(`/auth/reset-password/${token}`, { password }),

  changePassword: (currentPassword, newPassword) =>
    api.put('/auth/change-password', { currentPassword, newPassword }),

  logout: () => api.post('/auth/logout'),
}
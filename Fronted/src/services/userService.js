import api from './api'

export const userService = {
  // Profile
  getProfile: (userId) => api.get(`/users/${userId}`),

  updateProfile: (userData) => api.put('/users/profile', userData),

  updateAvatar: (formData) =>
    api.put('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  updateLocation: (latitude, longitude) =>
    api.put('/users/location', { latitude, longitude }),

  toggleLocationSharing: (enabled) =>
    api.put('/users/location-sharing', { enabled }),

  // Nearby users
  getNearbyUsers: (radius = 5, page = 1) =>
    api.get('/users/nearby', { params: { radius, page } }),

  searchUsers: (query) => api.get('/users/search', { params: { q: query } }),

  // Settings
  updateSettings: (settings) => api.put('/users/settings', settings),

  getSettings: () => api.get('/users/settings'),

  // Account
  deleteAccount: () => api.delete('/users/account'),
}
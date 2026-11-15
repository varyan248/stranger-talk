import api from './api'

export const adminService = {
  // Dashboard stats
  getStats: () => api.get('/admin/stats'),

  getAnalytics: (period = '7d') =>
    api.get('/admin/analytics', { params: { period } }),

  // User management
  getUsers: (params) => api.get('/admin/users', { params }),

  getUser: (userId) => api.get(`/admin/users/${userId}`),

  suspendUser: (userId, reason) =>
    api.put(`/admin/users/${userId}/suspend`, { reason }),

  unsuspendUser: (userId) => api.put(`/admin/users/${userId}/unsuspend`),

  banUser: (userId, reason) => api.put(`/admin/users/${userId}/ban`, { reason }),

  warnUser: (userId, message) =>
    api.post(`/admin/users/${userId}/warn`, { message }),

  // Reports
  getReports: (params) => api.get('/admin/reports', { params }),

  getReport: (reportId) => api.get(`/admin/reports/${reportId}`),

  updateReportStatus: (reportId, status, adminNote) =>
    api.put(`/admin/reports/${reportId}`, { status, adminNote }),

  // Admin management
  getAdmins: () => api.get('/admin/admins'),

  createAdmin: (userId) => api.post('/admin/admins', { userId }),

  removeAdmin: (userId) => api.delete(`/admin/admins/${userId}`),

  // Settings
  getSettings: () => api.get('/admin/settings'),

  updateSettings: (settings) => api.put('/admin/settings', settings),
}
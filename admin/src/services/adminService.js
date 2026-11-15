import api from './api'

export const adminService = {
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/admin/users'),
  suspendUser: (id) => api.put(`/admin/users/${id}/suspend`),
  unsuspendUser: (id) => api.put(`/admin/users/${id}/unsuspend`),
  getReports: () => api.get('/admin/reports'),
}
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
})

api.interceptors.request.use((config) => {
  // It uses a separate token key so it doesn't conflict with user app
  const token = localStorage.getItem('admin_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default api


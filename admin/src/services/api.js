import axios from 'axios'

// 🔥 Automatically use the Vercel Environment Variable, and fallback to localhost for local testing
const baseURL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api` 
  : 'http://localhost:5000/api'

const api = axios.create({
  baseURL: baseURL,
})

api.interceptors.request.use((config) => {
  // It uses a separate token key so it doesn't conflict with user app
  const token = localStorage.getItem('admin_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default api
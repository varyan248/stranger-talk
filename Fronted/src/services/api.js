import axios from 'axios'

// 1. Get the base URL from Vercel or default to localhost
let rawURL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// 2. Bulletproof fix: Ensure the URL ALWAYS ends with /api
if (!rawURL.endsWith('/api')) {
  rawURL = `${rawURL}/api`
}

const api = axios.create({
  baseURL: rawURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('neartalk_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('neartalk_token')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
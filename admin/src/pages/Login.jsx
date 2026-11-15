import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900">
      <form onSubmit={handleSubmit} className="bg-dark-800 p-8 rounded-xl shadow-xl w-full max-w-md border border-slate-700">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Admin Login</h2>
        {error && <p className="text-red-400 mb-4 text-center">{error}</p>}
        <input
          type="email" placeholder="Admin Email" value={email} onChange={e => setEmail(e.target.value)}
          className="w-full bg-slate-900 text-white px-4 py-3 rounded-lg mb-4 outline-none border border-slate-700 focus:border-purple-500"
        />
        <input
          type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
          className="w-full bg-slate-900 text-white px-4 py-3 rounded-lg mb-6 outline-none border border-slate-700 focus:border-purple-500"
        />
        <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-colors">
          Login to Dashboard
        </button>
      </form>
    </div>
  )
}
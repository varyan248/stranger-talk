import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  FiUser,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiMessageCircle,
  FiAtSign,
} from 'react-icons/fi'

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)

  const { register } = useAuth()
  const navigate = useNavigate()

  const validate = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required'
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters'
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Only letters, numbers, and underscores allowed'
    }

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (!acceptTerms) {
      newErrors.terms = 'You must accept the terms and conditions'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) return

    setLoading(true)
    const result = await register({
      name: formData.name.trim(),
      username: formData.username.trim().toLowerCase(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
    })
    setLoading(false)

    if (result.success) {
      navigate('/nearby')
    }
  }

  return (
    <div className="min-h-screen flex bg-dark-900">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-8 justify-center">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
              <FiMessageCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gradient">NearTalk</span>
          </Link>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Create Your Account
            </h1>
            <p className="text-dark-400">
              Join NearTalk and start connecting with people nearby
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className={`input-field pl-10 ${
                    errors.name ? 'border-red-500 focus:ring-red-500' : ''
                  }`}
                  autoComplete="name"
                />
              </div>
              {errors.name && (
                <p className="text-red-400 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Username
              </label>
              <div className="relative">
                <FiAtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="johndoe"
                  className={`input-field pl-10 ${
                    errors.username ? 'border-red-500 focus:ring-red-500' : ''
                  }`}
                  autoComplete="username"
                />
              </div>
              {errors.username && (
                <p className="text-red-400 text-sm mt-1">{errors.username}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={`input-field pl-10 ${
                    errors.email ? 'border-red-500 focus:ring-red-500' : ''
                  }`}
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                  className={`input-field pl-10 pr-10 ${
                    errors.password ? 'border-red-500 focus:ring-red-500' : ''
                  }`}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300 transition-colors"
                >
                  {showPassword ? (
                    <FiEyeOff className="w-5 h-5" />
                  ) : (
                    <FiEye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  className={`input-field pl-10 pr-10 ${
                    errors.confirmPassword
                      ? 'border-red-500 focus:ring-red-500'
                      : ''
                  }`}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300 transition-colors"
                >
                  {showConfirmPassword ? (
                    <FiEyeOff className="w-5 h-5" />
                  ) : (
                    <FiEye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Terms */}
            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => {
                    setAcceptTerms(e.target.checked)
                    if (errors.terms) {
                      setErrors((prev) => ({ ...prev, terms: '' }))
                    }
                  }}
                  className="mt-1 w-4 h-4 text-primary-600 bg-dark-800 border-dark-600 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-dark-400">
                  I agree to the{' '}
                  <a href="#" className="link">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="link">
                    Privacy Policy
                  </a>
                </span>
              </label>
              {errors.terms && (
                <p className="text-red-400 text-sm mt-1">{errors.terms}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center text-dark-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="link font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Decorative */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-primary-600/20 to-secondary-600/20 items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-600/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-secondary-600/30 rounded-full blur-3xl" />

        <div className="relative max-w-md text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FiMessageCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Start Your Journey
          </h2>
          <p className="text-dark-300">
            Create your free account and discover people in your neighborhood
            who share your interests.
          </p>

          <div className="mt-10 space-y-4">
            {[
              'Free to use, no credit card required',
              'Your privacy is protected',
              'Connect instantly with nearby users',
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 p-3 bg-dark-800/50 backdrop-blur rounded-lg"
              >
                <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                </div>
                <span className="text-dark-200">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
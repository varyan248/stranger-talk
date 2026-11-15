// import { useState } from 'react'
// import { Link, useNavigate, useLocation } from 'react-router-dom'
// import { useAuth } from '../context/AuthContext'
// import { FiMail, FiLock, FiEye, FiEyeOff, FiMessageCircle } from 'react-icons/fi'

// const Login = () => {
//   const [formData, setFormData] = useState({ email: '', password: '' })
//   const [showPassword, setShowPassword] = useState(false)
//   const [errors, setErrors] = useState({})
//   const [loading, setLoading] = useState(false)

//   const { login } = useAuth()
//   const navigate = useNavigate()
//   const location = useLocation()

//   const from = location.state?.from?.pathname || '/nearby'

//   const validate = () => {
//     const newErrors = {}
//     if (!formData.email) {
//       newErrors.email = 'Email is required'
//     } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
//       newErrors.email = 'Please enter a valid email'
//     }
//     if (!formData.password) {
//       newErrors.password = 'Password is required'
//     }
//     setErrors(newErrors)
//     return Object.keys(newErrors).length === 0
//   }

//   const handleChange = (e) => {
//     const { name, value } = e.target
//     setFormData((prev) => ({ ...prev, [name]: value }))
//     if (errors[name]) {
//       setErrors((prev) => ({ ...prev, [name]: '' }))
//     }
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     if (!validate()) return
//     setLoading(true)
//     const result = await login(formData.email, formData.password)
//     setLoading(false)
//     if (result.success) {
//       navigate(from, { replace: true })
//     }
//   }

//   return (
//     <div className="min-h-screen flex bg-dark-900">
//       <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
//         <div className="w-full max-w-md">
//           <Link to="/" className="flex items-center gap-2 mb-8 justify-center">
//             <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
//               <FiMessageCircle className="w-6 h-6 text-white" />
//             </div>
//             <span className="text-2xl font-bold text-gradient">NearTalk</span>
//           </Link>

//           <div className="text-center mb-8">
//             <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
//             <p className="text-dark-400">
//               Sign in to continue connecting with people nearby
//             </p>
//           </div>

//           <form onSubmit={handleSubmit} className="space-y-5">
//             <div>
//               <label className="block text-sm font-medium text-dark-300 mb-2">
//                 Email Address
//               </label>
//               <div className="relative">
//                 <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
//                 <input
//                   type="email"
//                   name="email"
//                   value={formData.email}
//                   onChange={handleChange}
//                   placeholder="you@example.com"
//                   className={`input-field pl-10 ${
//                     errors.email ? 'border-red-500 focus:ring-red-500' : ''
//                   }`}
//                   autoComplete="email"
//                 />
//               </div>
//               {errors.email && (
//                 <p className="text-red-400 text-sm mt-1">{errors.email}</p>
//               )}
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-dark-300 mb-2">
//                 Password
//               </label>
//               <div className="relative">
//                 <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
//                 <input
//                   type={showPassword ? 'text' : 'password'}
//                   name="password"
//                   value={formData.password}
//                   onChange={handleChange}
//                   placeholder="Enter your password"
//                   className={`input-field pl-10 pr-10 ${
//                     errors.password ? 'border-red-500 focus:ring-red-500' : ''
//                   }`}
//                   autoComplete="current-password"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300 transition-colors"
//                 >
//                   {showPassword ? (
//                     <FiEyeOff className="w-5 h-5" />
//                   ) : (
//                     <FiEye className="w-5 h-5" />
//                   )}
//                 </button>
//               </div>
//               {errors.password && (
//                 <p className="text-red-400 text-sm mt-1">{errors.password}</p>
//               )}
//             </div>

//             <div className="flex items-center justify-end">
//               <Link
//                 to="/forgot-password"
//                 className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
//               >
//                 Forgot password?
//               </Link>
//             </div>

//             <button
//               type="submit"
//               disabled={loading}
//               className="btn-primary w-full flex items-center justify-center gap-2"
//             >
//               {loading ? (
//                 <>
//                   <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                   Signing in...
//                 </>
//               ) : (
//                 'Sign In'
//               )}
//             </button>
//           </form>

//           <p className="text-center text-dark-400 mt-8">
//             Don't have an account?{' '}
//             <Link to="/register" className="link font-medium">
//               Create one free
//             </Link>
//           </p>
//         </div>
//       </div>

//       <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-primary-600/20 to-secondary-600/20 items-center justify-center p-8 relative overflow-hidden">
//         <div className="absolute top-20 left-10 w-72 h-72 bg-primary-600/30 rounded-full blur-3xl" />
//         <div className="absolute bottom-20 right-10 w-72 h-72 bg-secondary-600/30 rounded-full blur-3xl" />

//         <div className="relative max-w-md text-center">
//           <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
//             <FiMessageCircle className="w-10 h-10 text-white" />
//           </div>
//           <h2 className="text-3xl font-bold text-white mb-4">
//             Connect with People Nearby
//           </h2>
//           <p className="text-dark-300">
//             Join thousands of users making meaningful connections in their area
//             every day.
//           </p>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default Login

import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FiMail, FiLock, FiEye, FiEyeOff, FiMessageCircle } from 'react-icons/fi'

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/nearby'

  const validate = () => {
    const newErrors = {}
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }
    if (!formData.password) {
      newErrors.password = 'Password is required'
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
    const result = await login(formData.email, formData.password)
    setLoading(false)

    if (result.success) {
      // 🔥 THIS IS THE MAGIC LINE 🔥
      // If the user logging in is an admin, send them straight to /admin
      if (result.user?.isAdmin) {
        navigate('/admin', { replace: true })
      } else {
        // Otherwise, send them to the normal user panel
        navigate(from, { replace: true })
      }
    }
  }

  return (
    <div className="min-h-screen flex bg-dark-900">
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-8 justify-center">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
              <FiMessageCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gradient">NearTalk</span>
          </Link>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-dark-400">
              Sign in to continue connecting with people nearby
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
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
                  placeholder="Enter your password"
                  className={`input-field pl-10 pr-10 ${
                    errors.password ? 'border-red-500 focus:ring-red-500' : ''
                  }`}
                  autoComplete="current-password"
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

            <div className="flex items-center justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="text-center text-dark-400 mt-8">
            Don't have an account?{' '}
            <Link to="/register" className="link font-medium">
              Create one free
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-primary-600/20 to-secondary-600/20 items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-600/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-secondary-600/30 rounded-full blur-3xl" />

        <div className="relative max-w-md text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FiMessageCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Connect with People Nearby
          </h2>
          <p className="text-dark-300">
            Join thousands of users making meaningful connections in their area
            every day.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
import { useState } from 'react'
import { FiUser } from 'react-icons/fi'

const Avatar = ({ user, size = 'md', showStatus = false, className = '' }) => {
  const [imageError, setImageError] = useState(false)

  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-20 h-20 text-2xl',
    '2xl': 'w-28 h-28 text-4xl',
  }

  const getInitials = () => {
    if (user?.name) {
      return user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    if (user?.username) {
      return user.username.slice(0, 2).toUpperCase()
    }
    return '?'
  }

  const getColorFromString = (str) => {
    if (!str) return 'from-primary-500 to-secondary-500'
    const colors = [
      'from-red-500 to-orange-500',
      'from-orange-500 to-yellow-500',
      'from-green-500 to-teal-500',
      'from-blue-500 to-indigo-500',
      'from-indigo-500 to-purple-500',
      'from-purple-500 to-pink-500',
      'from-pink-500 to-red-500',
    ]
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
  }

  const avatarUrl = user?.avatar || user?.profilePicture

  return (
    <div className={`relative inline-block ${className}`}>
      {avatarUrl && !imageError ? (
        <img
          src={avatarUrl}
          alt={user?.username || 'User'}
          className={`${sizeClasses[size]} rounded-full object-cover border-2 border-dark-700`}
          onError={() => setImageError(true)}
        />
      ) : (
        <div
          className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${getColorFromString(
            user?.username || user?.name
          )} flex items-center justify-center font-semibold text-white border-2 border-dark-700`}
        >
          {getInitials()}
        </div>
      )}

      {showStatus && (
        <span
          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-dark-800 ${
            user?.isOnline ? 'bg-online' : 'bg-offline'
          }`}
        />
      )}
    </div>
  )
}

export default Avatar
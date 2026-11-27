import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Avatar from '../components/Avatar'
import ConfirmDialog from '../components/ConfirmDialog'
import Loader from '../components/Loader'
import { useAuth } from '../context/AuthContext'
import { useChat } from '../context/ChatContext' // 🔥 NEW IMPORT
import { userService } from '../services/userService'
import { authService } from '../services/authService'
import { chatService } from '../services/chatService'
import { useLocation } from '../hooks/useLocation'
import {
  FiUser,
  FiLock,
  FiMapPin,
  FiShield,
  FiTrash2,
  FiSave,
  FiEye,
  FiEyeOff,
  FiCamera,
  FiArrowLeft,
  FiUserX,
} from 'react-icons/fi'
import toast from 'react-hot-toast'

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Profile state
  const [profileData, setProfileData] = useState({
    name: '',
    username: '',
    bio: '',
    interests: [],
    language: '',
  })
  const [newInterest, setNewInterest] = useState('')
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)

  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  // Privacy state
  const [privacySettings, setPrivacySettings] = useState({
    showOnlineStatus: true,
    allowMessagesFrom: 'everyone',
    showInNearby: true,
    locationSharing: true,
  })

  // Blocked users state
  const [blockedUsers, setBlockedUsers] = useState([])
  const [loadingBlocked, setLoadingBlocked] = useState(false)

  const { user, updateUser, logout } = useAuth()
  const { fetchConversations } = useChat() // 🔥 NEW: Get fetchConversations
  const { permissionStatus, requestAndUpdateLocation } = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        username: user.username || '',
        bio: user.bio || '',
        interests: user.interests || [],
        language: user.language || '',
      })
      if (user.settings) {
        setPrivacySettings((prev) => ({ ...prev, ...user.settings }))
      }
    }
  }, [user])

  useEffect(() => {
    if (activeTab === 'blocked') {
      fetchBlockedUsers()
    }
  }, [activeTab])

  const fetchBlockedUsers = async () => {
    setLoadingBlocked(true)
    try {
      const response = await chatService.getBlockedUsers()
      setBlockedUsers(response.data.users || [])
    } catch (error) {
      console.error('Failed to fetch blocked users:', error)
      toast.error('Failed to load blocked users')
    } finally {
      setLoadingBlocked(false)
    }
  }

  const handleUnblock = async (userId, username) => {
    try {
      await chatService.unblockUser(userId)
      setBlockedUsers((prev) => prev.filter((u) => u._id !== userId))
      toast.success(`Unblocked ${username}`)
      
      // 🔥 NEW: Refresh the sidebar conversations immediately
      await fetchConversations() 
      
    } catch (error) {
      toast.error('Failed to unblock user')
    }
  }

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfileData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB')
        return
      }
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setAvatarPreview(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const addInterest = () => {
    const interest = newInterest.trim()
    if (!interest) return
    if (profileData.interests.includes(interest)) {
      toast.error('Interest already added')
      return
    }
    if (profileData.interests.length >= 10) {
      toast.error('Maximum 10 interests allowed')
      return
    }
    setProfileData((prev) => ({
      ...prev,
      interests: [...prev.interests, interest],
    }))
    setNewInterest('')
  }

  const removeInterest = (interest) => {
    setProfileData((prev) => ({
      ...prev,
      interests: prev.interests.filter((i) => i !== interest),
    }))
  }

  // const saveProfile = async () => {
  //   setSaving(true)
  //   try {
  //     if (avatarFile) {
  //       const formData = new FormData()
  //       formData.append('avatar', avatarFile)
  //       const avatarResponse = await userService.updateAvatar(formData)
  //       updateUser({ avatar: avatarResponse.data.avatar })
  //     }

  //     const response = await userService.updateProfile({
  //       name: profileData.name,
  //       bio: profileData.bio,
  //       interests: profileData.interests,
  //       language: profileData.language,
  //     })

  //     updateUser(response.data.user)
  //     toast.success('Profile updated successfully')
  //   } catch (error) {
  //     const message = error.response?.data?.message || 'Failed to update profile'
  //     toast.error(message)
  //   } finally {
  //     setSaving(false)
  //   }
  // }

    const saveProfile = async () => {
    setSaving(true)
    try {
      // 1. If a new avatar was selected, upload it
      if (avatarFile) {
        const formData = new FormData()
        formData.append('avatar', avatarFile)
        
        const avatarResponse = await userService.updateAvatar(formData)
        
        // 🔥 FIX: Update the context with the full user object returned from the backend
        if (avatarResponse.data.user) {
          updateUser(avatarResponse.data.user)
        }
      }

      // 2. Update the rest of the text fields
      const response = await userService.updateProfile({
        name: profileData.name,
        bio: profileData.bio,
        interests: profileData.interests,
        language: profileData.language,
      })

      // 🔥 FIX: Update the context again with the final user state
      updateUser(response.data.user)
      
      // Clear the local preview so it relies on the new database URL
      setAvatarPreview(null) 
      setAvatarFile(null)
      
      toast.success('Profile updated successfully')
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update profile'
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  const changePassword = async () => {
    if (!passwordData.currentPassword) {
      toast.error('Current password is required')
      return
    }
    if (!passwordData.newPassword) {
      toast.error('New password is required')
      return
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters')
      return
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setSaving(true)
    try {
      await authService.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      )
      toast.success('Password changed successfully')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to change password'
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  const savePrivacySettings = async () => {
    setSaving(true)
    try {
      const response = await userService.updateSettings(privacySettings)
      updateUser({ settings: response.data.settings })
      toast.success('Privacy settings saved')
    } catch (error) {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleLocationToggle = async (enabled) => {
    if (enabled && permissionStatus !== 'granted') {
      try {
        await requestAndUpdateLocation()
        toast.success('Location updated')
      } catch (error) {
        toast.error('Failed to get location')
        return
      }
    }
    setPrivacySettings((prev) => ({ ...prev, locationSharing: enabled }))
  }

  const handleDeleteAccount = async () => {
    setDeleting(true)
    try {
      await userService.deleteAccount()
      toast.success('Account deleted')
      logout()
      navigate('/')
    } catch (error) {
      toast.error('Failed to delete account')
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: FiUser },
    { id: 'security', label: 'Security', icon: FiLock },
    { id: 'privacy', label: 'Privacy', icon: FiShield },
    { id: 'location', label: 'Location', icon: FiMapPin },
    { id: 'blocked', label: 'Blocked Users', icon: FiUserX }, 
    { id: 'danger', label: 'Danger Zone', icon: FiTrash2 },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-dark-900">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <button
          onClick={() => navigate(-1)}
          className="btn-ghost flex items-center gap-2 mb-4 -ml-2"
        >
          <FiArrowLeft className="w-4 h-4" />
          Back
        </button>

        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6">
          Settings
        </h1>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Tabs */}
          <div className="lg:w-56 flex-shrink-0">
            <div className="card p-2">
              <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-primary-600/20 text-primary-400'
                        : tab.id === 'danger'
                        ? 'text-red-400 hover:bg-red-500/10'
                        : 'text-dark-300 hover:text-white hover:bg-dark-700'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="card space-y-6">
                <h2 className="text-xl font-semibold text-white">Profile Information</h2>

                <div className="flex items-center gap-6">
                  <div className="relative">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Preview"
                        className="w-20 h-20 rounded-full object-cover border-2 border-primary-600"
                      />
                    ) : (
                      <Avatar user={user} size="xl" />
                    )}
                    <label className="absolute bottom-0 right-0 p-2 bg-primary-600 rounded-full cursor-pointer hover:bg-primary-700 transition-colors">
                      <FiCamera className="w-4 h-4 text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <div>
                    <h3 className="font-medium text-white">Profile Picture</h3>
                    <p className="text-sm text-dark-400">
                      JPG, PNG or GIF. Max 5MB.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={profileData.username}
                    disabled
                    className="input-field opacity-60 cursor-not-allowed"
                  />
                  <p className="text-xs text-dark-500 mt-1">
                    Username cannot be changed
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={profileData.bio}
                    onChange={handleProfileChange}
                    placeholder="Tell others about yourself..."
                    rows={3}
                    maxLength={200}
                    className="input-field resize-none"
                  />
                  <p className="text-xs text-dark-500 mt-1 text-right">
                    {profileData.bio.length}/200
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    Interests
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newInterest}
                      onChange={(e) => setNewInterest(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addInterest()
                        }
                      }}
                      placeholder="Add an interest..."
                      className="input-field flex-1"
                    />
                    <button
                      type="button"
                      onClick={addInterest}
                      className="btn-secondary px-4"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profileData.interests.map((interest) => (
                      <span
                        key={interest}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-600/20 text-primary-300 rounded-full text-sm"
                      >
                        {interest}
                        <button
                          onClick={() => removeInterest(interest)}
                          className="hover:text-red-400 transition-colors"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    {profileData.interests.length === 0 && (
                      <p className="text-sm text-dark-500">
                        No interests added yet
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-dark-700">
                  <button
                    onClick={saveProfile}
                    disabled={saving}
                    className="btn-primary flex items-center gap-2"
                  >
                    {saving ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <FiSave className="w-4 h-4" />
                    )}
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="card space-y-6">
                <h2 className="text-xl font-semibold text-white">
                  Change Password
                </h2>

                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData((prev) => ({
                          ...prev,
                          currentPassword: e.target.value,
                        }))
                      }
                      className="input-field pr-10"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswords((prev) => ({
                          ...prev,
                          current: !prev.current,
                        }))
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300"
                    >
                      {showPasswords.current ? (
                        <FiEyeOff className="w-5 h-5" />
                      ) : (
                        <FiEye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData((prev) => ({
                          ...prev,
                          newPassword: e.target.value,
                        }))
                      }
                      className="input-field pr-10"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswords((prev) => ({
                          ...prev,
                          new: !prev.new,
                        }))
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300"
                    >
                      {showPasswords.new ? (
                        <FiEyeOff className="w-5 h-5" />
                      ) : (
                        <FiEye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData((prev) => ({
                          ...prev,
                          confirmPassword: e.target.value,
                        }))
                      }
                      className="input-field pr-10"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswords((prev) => ({
                          ...prev,
                          confirm: !prev.confirm,
                        }))
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300"
                    >
                      {showPasswords.confirm ? (
                        <FiEyeOff className="w-5 h-5" />
                      ) : (
                        <FiEye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-dark-700">
                  <button
                    onClick={changePassword}
                    disabled={saving}
                    className="btn-primary flex items-center gap-2"
                  >
                    {saving ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <FiLock className="w-4 h-4" />
                    )}
                    Update Password
                  </button>
                </div>
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <div className="card space-y-6">
                <h2 className="text-xl font-semibold text-white">
                  Privacy Settings
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-dark-700/50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-white">Show Online Status</h3>
                      <p className="text-sm text-dark-400">
                        Let others see when you're online
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={privacySettings.showOnlineStatus}
                        onChange={(e) =>
                          setPrivacySettings((prev) => ({
                            ...prev,
                            showOnlineStatus: e.target.checked,
                          }))
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-dark-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-dark-700/50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-white">Appear in Nearby</h3>
                      <p className="text-sm text-dark-400">
                        Let others discover you in nearby search
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={privacySettings.showInNearby}
                        onChange={(e) =>
                          setPrivacySettings((prev) => ({
                            ...prev,
                            showInNearby: e.target.checked,
                          }))
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-dark-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div className="p-4 bg-dark-700/50 rounded-lg">
                    <h3 className="font-medium text-white mb-2">
                      Who Can Message You
                    </h3>
                    <select
                      value={privacySettings.allowMessagesFrom}
                      onChange={(e) =>
                        setPrivacySettings((prev) => ({
                          ...prev,
                          allowMessagesFrom: e.target.value,
                        }))
                      }
                      className="input-field"
                    >
                      <option value="everyone">Everyone</option>
                      <option value="nearby">Only People Nearby</option>
                      <option value="matches">Only Interest Matches</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-dark-700">
                  <button
                    onClick={savePrivacySettings}
                    disabled={saving}
                    className="btn-primary flex items-center gap-2"
                  >
                    {saving ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <FiSave className="w-4 h-4" />
                    )}
                    Save Settings
                  </button>
                </div>
              </div>
            )}

            {/* Location Tab */}
            {activeTab === 'location' && (
              <div className="card space-y-6">
                <h2 className="text-xl font-semibold text-white">
                  Location Settings
                </h2>

                <div className="p-4 bg-dark-700/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-white flex items-center gap-2">
                        <FiMapPin className="w-4 h-4 text-primary-400" />
                        Location Sharing
                      </h3>
                      <p className="text-sm text-dark-400 mt-1">
                        Enable to find people near you
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={privacySettings.locationSharing}
                        onChange={(e) => handleLocationToggle(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-dark-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div className="mt-4 pt-4 border-t border-dark-600">
                    <p className="text-sm text-dark-400">
                      Permission Status:{' '}
                      <span
                        className={`font-medium ${
                          permissionStatus === 'granted'
                            ? 'text-green-400'
                            : 'text-yellow-400'
                        }`}
                      >
                        {permissionStatus === 'granted'
                          ? 'Granted'
                          : permissionStatus === 'denied'
                          ? 'Denied'
                          : 'Not Requested'}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-primary-600/10 border border-primary-600/30 rounded-lg">
                  <h3 className="font-medium text-primary-300 mb-2">
                    Privacy Notice
                  </h3>
                  <p className="text-sm text-dark-300">
                    Your exact GPS coordinates are never shared with other
                    users. Only approximate distances (like "2.5 km away") are
                    shown to help you discover people nearby.
                  </p>
                </div>

                <div className="flex justify-end pt-4 border-t border-dark-700">
                  <button
                    onClick={savePrivacySettings}
                    disabled={saving}
                    className="btn-primary flex items-center gap-2"
                  >
                    {saving ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <FiSave className="w-4 h-4" />
                    )}
                    Save Settings
                  </button>
                </div>
              </div>
            )}

            {/* Blocked Users Tab */}
            {activeTab === 'blocked' && (
              <div className="card space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">
                    Blocked Users
                  </h2>
                  <span className="badge bg-dark-700 text-dark-300">
                    {blockedUsers.length} blocked
                  </span>
                </div>
                
                <p className="text-sm text-dark-400">
                  Blocked users cannot message you or see your profile. You can unblock them at any time.
                </p>

                {loadingBlocked ? (
                  <Loader text="Loading blocked users..." />
                ) : blockedUsers.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-dark-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiUserX className="w-8 h-8 text-dark-500" />
                    </div>
                    <h3 className="text-lg font-medium text-white mb-1">No blocked users</h3>
                    <p className="text-dark-400 text-sm">You haven't blocked anyone yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {blockedUsers.map((blockedUser) => (
                      <div
                        key={blockedUser._id}
                        className="flex items-center justify-between p-4 bg-dark-700/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar user={blockedUser} size="md" />
                          <div>
                            <p className="font-medium text-white">
                              {blockedUser.name || blockedUser.username}
                            </p>
                            <p className="text-sm text-dark-400">
                              @{blockedUser.username}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleUnblock(blockedUser._id, blockedUser.username)}
                          className="btn-ghost text-sm text-primary-400 hover:text-primary-300 border border-dark-600 hover:border-primary-500/30 px-4 py-2"
                        >
                          Unblock
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Danger Zone Tab */}
            {activeTab === 'danger' && (
              <div className="card space-y-6 border-red-500/30">
                <h2 className="text-xl font-semibold text-red-400">
                  Danger Zone
                </h2>

                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <h3 className="font-medium text-red-300 mb-2">
                    Delete Account
                  </h3>
                  <p className="text-sm text-dark-300 mb-4">
                    Once you delete your account, there is no going back. All
                    your data, conversations, and connections will be
                    permanently removed.
                  </p>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="btn-danger flex items-center gap-2"
                  >
                    <FiTrash2 className="w-4 h-4" />
                    Delete My Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account"
        message="Are you absolutely sure? This will permanently delete your account and all associated data. This action cannot be undone."
        confirmText="Delete Forever"
        variant="danger"
        loading={deleting}
      />
    </div>
  )
}

export default Settings
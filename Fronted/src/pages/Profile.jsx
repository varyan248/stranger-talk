import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Avatar from '../components/Avatar'
import Loader from '../components/Loader'
import EmptyState from '../components/EmptyState'
import ReportModal from '../components/ReportModal'
import ConfirmDialog from '../components/ConfirmDialog'
import { useAuth } from '../context/AuthContext'
import { useChat } from '../context/ChatContext'
import { userService } from '../services/userService'
import { chatService } from '../services/chatService'
import { useLocation } from '../hooks/useLocation'
import {
  FiMapPin,
  FiCalendar,
  FiMessageCircle,
  FiFlag,
  FiUserX,
  FiEdit2,
  FiGlobe,
  FiHeart,
  FiArrowLeft,
} from 'react-icons/fi'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const Profile = () => {
  const { userId } = useParams()
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  const { startConversation } = useChat()
  const { formatDistance } = useLocation()

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [startingChat, setStartingChat] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [showBlockConfirm, setShowBlockConfirm] = useState(false)
  const [blocking, setBlocking] = useState(false)

  const isOwnProfile = !userId || userId === currentUser?._id

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true)
      try {
        if (isOwnProfile) {
          setProfile(currentUser)
        } else {
          const response = await userService.getProfile(userId)
          setProfile(response.data.user)
        }
      } catch (error) {
        toast.error('Failed to load profile')
        navigate('/nearby')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [userId, currentUser, isOwnProfile, navigate])

  const handleStartChat = async () => {
    if (!profile) return

    setStartingChat(true)
    try {
      const conversation = await startConversation(profile._id)
      navigate(`/chat/${conversation._id}`)
    } catch (error) {
      console.error('Failed to start chat:', error)
    } finally {
      setStartingChat(false)
    }
  }

  const handleBlock = async () => {
    if (!profile) return

    setBlocking(true)
    try {
      await chatService.blockUser(profile._id)
      toast.success(`${profile.username} has been blocked`)
      setShowBlockConfirm(false)
      navigate('/nearby')
    } catch (error) {
      toast.error('Failed to block user')
    } finally {
      setBlocking(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-dark-900">
        <Navbar />
        <Loader fullScreen text="Loading profile..." />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col bg-dark-900">
        <Navbar />
        <EmptyState
          icon={FiUserX}
          title="User not found"
          description="This user may have deleted their account or doesn't exist."
          action={() => navigate('/nearby')}
          actionLabel="Back to Nearby"
        />
        <Footer />
      </div>
    )
  }

  const formatJoinDate = (date) => {
    try {
      return format(new Date(date), 'MMMM yyyy')
    } catch {
      return 'Unknown'
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-dark-900">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <button
          onClick={() => navigate(-1)}
          className="btn-ghost flex items-center gap-2 mb-4 -ml-2"
        >
          <FiArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Profile Card */}
        <div className="card">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <Avatar user={profile} size="2xl" showStatus />

            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <h1 className="text-2xl font-bold text-white">
                  {profile.name || profile.username}
                </h1>
                {profile.isOnline ? (
                  <span className="badge-online self-center sm:self-auto">
                    Online
                  </span>
                ) : (
                  <span className="badge-offline self-center sm:self-auto">
                    Offline
                  </span>
                )}
              </div>

              <p className="text-dark-400 mt-1">@{profile.username}</p>

              {profile.bio && (
                <p className="text-dark-300 mt-3 max-w-lg">{profile.bio}</p>
              )}

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-4 text-sm text-dark-400">
                {profile.distance !== undefined && !isOwnProfile && (
                  <span className="flex items-center gap-1">
                    <FiMapPin className="w-4 h-4" />
                    {formatDistance(profile.distance)} away
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <FiCalendar className="w-4 h-4" />
                  Joined {formatJoinDate(profile.createdAt)}
                </span>
                {profile.language && (
                  <span className="flex items-center gap-1">
                    <FiGlobe className="w-4 h-4" />
                    {profile.language}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-dark-700">
            {isOwnProfile ? (
              <button
                onClick={() => navigate('/settings')}
                className="btn-primary flex items-center gap-2"
              >
                <FiEdit2 className="w-4 h-4" />
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  onClick={handleStartChat}
                  disabled={startingChat}
                  className="btn-primary flex items-center gap-2"
                >
                  {startingChat ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FiMessageCircle className="w-4 h-4" />
                  )}
                  Send Message
                </button>

                <button
                  onClick={() => setShowReportModal(true)}
                  className="btn-ghost flex items-center gap-2 border border-dark-600 text-red-400 hover:text-red-300"
                >
                  <FiFlag className="w-4 h-4" />
                  Report
                </button>

                <button
                  onClick={() => setShowBlockConfirm(true)}
                  className="btn-ghost flex items-center gap-2 border border-dark-600 text-red-400 hover:text-red-300"
                >
                  <FiUserX className="w-4 h-4" />
                  Block
                </button>
              </>
            )}
          </div>
        </div>

        {/* Interests */}
        {profile.interests?.length > 0 && (
          <div className="card mt-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FiHeart className="w-5 h-5 text-primary-400" />
              Interests
            </h2>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest) => (
                <span
                  key={interest}
                  className="px-3 py-1.5 bg-primary-600/20 text-primary-300 rounded-full text-sm"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />

      {/* Modals */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        userId={profile._id}
        username={profile.username}
      />

      <ConfirmDialog
        isOpen={showBlockConfirm}
        onClose={() => setShowBlockConfirm(false)}
        onConfirm={handleBlock}
        title="Block User"
        message={`Are you sure you want to block @${profile.username}? They won't be able to message you or see your profile.`}
        confirmText="Block"
        variant="danger"
        loading={blocking}
      />
    </div>
  )
}

export default Profile
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import UserCard from '../components/UserCard'
import EmptyState from '../components/EmptyState'
import SkeletonCard from '../components/SkeletonCard'
import { useLocation } from '../hooks/useLocation'
import { userService } from '../services/userService'
import { useDebounce } from '../hooks/useDebounce'
import {
  FiMapPin,
  FiSearch,
  FiUsers,
  FiRefreshCw,
  FiShuffle,
  FiAlertCircle,
} from 'react-icons/fi'
import toast from 'react-hot-toast'

const Nearby = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [locationLoading, setLocationLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [radius, setRadius] = useState(5)
  const [searchQuery, setSearchQuery] = useState('')
  const [locationError, setLocationError] = useState(null)

  const debouncedSearch = useDebounce(searchQuery, 500)
  const navigate = useNavigate()

  const {
    location,
    permissionStatus,
    requestAndUpdateLocation,
    calculateDistance,
  } = useLocation()

  // Fetch nearby users
  const fetchNearbyUsers = useCallback(
    async (showRefresh = false) => {
      if (showRefresh) setRefreshing(true)
      else setLoading(true)

      try {
        const response = await userService.getNearbyUsers(radius)
        setUsers(response.data.users || [])
      } catch (error) {
        console.error('Failed to fetch nearby users:', error)
        const message =
          error.response?.data?.message || 'Failed to fetch nearby users'
        toast.error(message)
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [radius]
  )

  // Initial location request
  useEffect(() => {
    const initLocation = async () => {
      if (permissionStatus === 'granted' || location) {
        fetchNearbyUsers()
        return
      }

      setLocationLoading(true)
      try {
        await requestAndUpdateLocation()
        setLocationError(null)
        await fetchNearbyUsers()
      } catch (error) {
        setLocationError(error.message)
        setLoading(false)
      } finally {
        setLocationLoading(false)
      }
    }

    initLocation()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Refetch when radius changes
  useEffect(() => {
    if (location || permissionStatus === 'granted') {
      fetchNearbyUsers()
    }
  }, [radius]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleRefresh = () => {
    fetchNearbyUsers(true)
  }

  const handleLocationRequest = async () => {
    setLocationLoading(true)
    try {
      await requestAndUpdateLocation()
      setLocationError(null)
      await fetchNearbyUsers()
    } catch (error) {
      setLocationError(error.message)
    } finally {
      setLocationLoading(false)
    }
  }

  const handleRandomChat = () => {
    navigate('/random-chat')
  }

  // Filter users by search query
  const filteredUsers = users.filter((user) => {
    if (!debouncedSearch) return true
    const query = debouncedSearch.toLowerCase()
    return (
      user.username?.toLowerCase().includes(query) ||
      user.name?.toLowerCase().includes(query) ||
      user.interests?.some((i) => i.toLowerCase().includes(query))
    )
  })

  // Add distance to users
  const usersWithDistance = filteredUsers.map((user) => {
    let distance
    if (location && user.location?.coordinates) {
      distance = calculateDistance(
        location.latitude,
        location.longitude,
        user.location.coordinates[1],
        user.location.coordinates[0]
      )
    } else if (user.distance !== undefined) {
      distance = user.distance
    }
    return { ...user, distance }
  })

  return (
    <div className="min-h-screen flex flex-col bg-dark-900">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
                <FiUsers className="w-7 h-7 text-primary-400" />
                People Nearby
              </h1>
              <p className="text-dark-400 mt-1">
                {loading
                  ? 'Finding people around you...'
                  : `${usersWithDistance.length} ${
                      usersWithDistance.length === 1 ? 'person' : 'people'
                    } within ${radius} KM`}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing || loading}
                className="btn-ghost flex items-center gap-2 border border-dark-600"
              >
                <FiRefreshCw
                  className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}
                />
                Refresh
              </button>

              <button
                onClick={handleRandomChat}
                className="btn-secondary flex items-center gap-2"
              >
                <FiShuffle className="w-4 h-4" />
                Random Chat
              </button>
            </div>
          </div>
        </div>

        {/* Location Error */}
        {locationError && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
            <div className="flex items-start gap-3">
              <FiAlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-300 mb-1">
                  Location Access Required
                </h3>
                <p className="text-sm text-red-300/80 mb-3">{locationError}</p>
                <button
                  onClick={handleLocationRequest}
                  disabled={locationLoading}
                  className="btn-danger text-sm py-2 px-4 flex items-center gap-2"
                >
                  {locationLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FiMapPin className="w-4 h-4" />
                  )}
                  Enable Location
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search & Filters */}
        <div className="card mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, username, or interests..."
                className="input-field pl-10"
              />
            </div>

            {/* Radius Selector */}
            <div className="flex items-center gap-3">
              <label className="text-sm text-dark-400 whitespace-nowrap">
                Radius:
              </label>
              <select
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="input-field py-2.5 min-w-[100px]"
              >
                <option value={1}>1 KM</option>
                <option value={2}>2 KM</option>
                <option value={3}>3 KM</option>
                <option value={5}>5 KM</option>
                <option value={10}>10 KM</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Grid */}
        {loading || locationLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : usersWithDistance.length === 0 ? (
          <EmptyState
            icon={FiUsers}
            title={
              searchQuery ? 'No users found' : 'No users nearby'
            }
            description={
              searchQuery
                ? 'Try adjusting your search terms or increasing the radius.'
                : `There are no active users within ${radius} KM of your location right now. Try increasing the radius or check back later.`
            }
            action={searchQuery ? () => setSearchQuery('') : handleRefresh}
            actionLabel={searchQuery ? 'Clear Search' : 'Refresh'}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {usersWithDistance.map((user) => (
              <UserCard key={user._id} user={user} distance={user.distance} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default Nearby
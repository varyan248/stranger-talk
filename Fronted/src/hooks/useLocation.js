import { useState, useCallback, useEffect } from 'react'
import { userService } from '../services/userService'
import toast from 'react-hot-toast'

export const useLocation = () => {
  const [location, setLocation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [permissionStatus, setPermissionStatus] = useState('prompt')

  // Check permission status on mount
  useEffect(() => {
    if ('permissions' in navigator) {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then((result) => {
          setPermissionStatus(result.state)
          result.onchange = () => {
            setPermissionStatus(result.state)
          }
        })
        .catch(() => {
          // Some browsers don't support permission query
        })
    }
  }, [])

  const getCurrentLocation = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const err = new Error('Geolocation is not supported by your browser')
        setError(err.message)
        reject(err)
        return
      }

      setLoading(true)
      setError(null)

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          }
          setLocation(coords)
          setPermissionStatus('granted')
          setLoading(false)
          resolve(coords)
        },
        (err) => {
          let errorMessage = 'Unable to get your location'
          switch (err.code) {
            case err.PERMISSION_DENIED:
              errorMessage = 'Location permission denied. Please enable it in your browser settings.'
              setPermissionStatus('denied')
              break
            case err.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable.'
              break
            case err.TIMEOUT:
              errorMessage = 'Location request timed out.'
              break
            default:
              errorMessage = err.message
          }
          setError(errorMessage)
          setLoading(false)
          reject(new Error(errorMessage))
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      )
    })
  }, [])

  const updateLocationOnServer = useCallback(async (coords) => {
    try {
      await userService.updateLocation(coords.latitude, coords.longitude)
      return true
    } catch (error) {
      console.error('Failed to update location on server:', error)
      toast.error('Failed to update location')
      return false
    }
  }, [])

  const requestAndUpdateLocation = useCallback(async () => {
    try {
      const coords = await getCurrentLocation()
      await updateLocationOnServer(coords)
      return coords
    } catch (error) {
      throw error
    }
  }, [getCurrentLocation, updateLocationOnServer])

  const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
    const R = 6371 // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }, [])

  const formatDistance = useCallback((distance) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)} m`
    }
    return `${distance.toFixed(1)} km`
  }, [])

  return {
    location,
    loading,
    error,
    permissionStatus,
    getCurrentLocation,
    updateLocationOnServer,
    requestAndUpdateLocation,
    calculateDistance,
    formatDistance,
  }
}   
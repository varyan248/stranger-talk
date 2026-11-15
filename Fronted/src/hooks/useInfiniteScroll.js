import { useState, useEffect, useCallback, useRef } from 'react'

export const useInfiniteScroll = (callback, hasMore = true) => {
  const [loading, setLoading] = useState(false)
  const observerRef = useRef(null)
  const lastElementRef = useRef(null)

  const handleObserver = useCallback(
    (entries) => {
      const [target] = entries
      if (target.isIntersecting && hasMore && !loading) {
        setLoading(true)
        Promise.resolve(callback()).finally(() => setLoading(false))
      }
    },
    [callback, hasMore, loading]
  )

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    observerRef.current = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
      rootMargin: '100px',
    })

    if (lastElementRef.current) {
      observerRef.current.observe(lastElementRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [handleObserver])

  return { lastElementRef, loading }
}
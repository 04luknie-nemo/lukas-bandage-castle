import { useCallback, useEffect, useState } from 'react'
import { apiFetch } from '../api'

type ApiState<T> = {
  data: T | undefined
  error: Error | null
  loading: boolean
  reload: () => void
}

/**
 * Fetches `url` on mount and whenever it changes. Pass null to skip.
 *
 *   const { data: users, loading } = useApi<User[]>('/users')
 */
export function useApi<T>(url: string | null): ApiState<T> {
  const [data, setData] = useState<T>()
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(url !== null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (url === null) return
    let cancelled = false
    setLoading(true)
    apiFetch(url)
      .then((d: T) => {
        if (!cancelled) {
          setData(d)
          setError(null)
        }
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [url, tick])

  const reload = useCallback(() => setTick((t) => t + 1), [])
  return { data, error, loading, reload }
}

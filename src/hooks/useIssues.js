import { useState, useEffect } from 'react'
import { subscribeToIssues } from '@/firebase/issues'

export function useIssues() {
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const unsubscribe = subscribeToIssues(
      (data) => {
        setIssues(data)
        setLoading(false)
      }
    )
    return unsubscribe
  }, [])

  return { issues, loading, error }
}

import { useCallback, useEffect, useState } from 'react'
import { POKTPOOL_API_URL } from './useApi'
import useAccessToken from './useAccessToken'
import axios from 'axios'

export default function useUser() {
  const [user, setUser] = useState<
    Partial<{
      sweepPercent: number
      username: string
      email: string
      customerIds: string[]
      isEmailVerified: boolean
      jumioDecision: 'PASSED' | 'REJECTED' | 'WARNING'
      isTwoFactorEnabled: boolean
      permissions: number[]
      primaryCustomerId?: string
      userIconUrl: string
    }>
  >({})
  const [loading, setLoading] = useState(true)
  const accessToken = useAccessToken()

  const fetchUser = useCallback(async () => {
    setLoading(true)
    accessToken &&
      axios
        .get('user', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((res) => {
          if (res.status === 200) {
            setUser(res.data)
          }
        })
        .then(() => setLoading(false))
        .catch(() => setLoading(false))
  }, [accessToken])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  return { user, loading, refetchUser: fetchUser }
}

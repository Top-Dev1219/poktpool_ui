import { getSession, useSession, signOut } from 'next-auth/react'
import { useEffect, useState } from 'react'

export default function useAccessToken() {
  const { data: session, status } = useSession()
  const [accessToken, setAccessToken] = useState('')

  useEffect(() => {
    const interval = setInterval(() => {
      getSession()
        .then((session: session) => {
          if (session?.accessToken) {
            setAccessToken(session?.accessToken)
          } else {
            localStorage.removeItem('customerId')
            signOut({
              callbackUrl: `/`,
            })
          }
        })
        .catch((error) => {
          if (error.status === 401) {
            // logout()
            localStorage.removeItem('customerId')
            signOut({
              callbackUrl: `/`,
            })
          }
        })
    }, 1000 * 60 * 29)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (
      accessToken === '' &&
      status === 'authenticated' &&
      session?.accessToken
    ) {
      setAccessToken(`${session.accessToken}`)
    }
  }, [accessToken, status, session])

  return accessToken
}

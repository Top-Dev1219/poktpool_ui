import { useEffect, useState } from 'react'
import useUser from './useUser'

export default function useCustomerId() {
  const { user, loading: isUserLoading } = useUser()
  const [customerId, setCustomerId] = useState<string | null>(null)

  useEffect(() => {
    const defaultCustomerId = user?.primaryCustomerId

    if (
      localStorage.getItem('customerId') &&
      localStorage.getItem('customerId') !== 'undefined'
    ) {
      const value = localStorage.getItem('customerId')
      setCustomerId(value)
    } else if (defaultCustomerId) {
      setCustomerId(defaultCustomerId)
      localStorage.setItem('customerId', defaultCustomerId)
    }
  }, [user])

  return { customerId, user, isUserLoading }
}

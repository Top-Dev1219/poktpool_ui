import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { callApi } from './useApi'
import useCustomerId from './useCustomerId'
import useUser from './useUser'

export default function useUnstakes(): [
  {
    isPendingSend: boolean
    timestamp: number | null
    uPoktSwept: number | null
    unstakeId: string
    unstakeDueDate: number
    unstakeTxId: string | null
  }[],
  boolean
] {
  const [unstakes, setUnstakes] = useState([])
  const { data: session, status } = useSession()
  const { user } = useUser()
  const [loading, setLoading] = useState(false)
  const { customerId } = useCustomerId()

  // const defaultCustomerId = customerId ? customerId : user?.customerIds?.[0]

  useEffect(() => {
    if (status === 'authenticated') {
      setLoading(true)
      callApi(`/withdraw/unstakes?customerId=${customerId}`, 'GET', {}, session)
        .then((res) => {
          setUnstakes(res.data)
        })
        .then(() => setLoading(false))
        .catch(() => setLoading(false))
    }
  }, [session, status])

  return [unstakes, loading]
}

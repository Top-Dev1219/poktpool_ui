import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import useUser from '../../../hooks/useUser'

const routeData = [
  {
    route: 'pool-details/pokt-position',
    permission: [11],
  },
  {
    route: 'pool-details/closed-tranches',
    permission: [8],
  },
  {
    route: 'pool-details/monthly-report',
    permission: [9],
  },
]

export default function ManageProfileDetails() {
  const { status } = useSession()
  const { user } = useUser()
  const { replace } = useRouter()

  const redirectRoute = routeData.find((route) =>
    user?.permissions?.includes(route.permission[0])
  )?.route

  if (status === 'authenticated' && redirectRoute) replace(redirectRoute)

  return <></>
}

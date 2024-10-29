import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import useUser from '../../../hooks/useUser'

const routeData = [
  {
    route: 'nodes/node-address',
    permission: [2],
  },
  {
    route: 'nodes/node-dashboard',
    permission: [6],
  },
  {
    route: 'nodes/vendor-settings',
    permission: [10],
  },
]

export default function ManageNodePages() {
  const { status } = useSession()
  const { user } = useUser()
  const { replace } = useRouter()

  const redirectRoute = routeData.find((route) =>
    user?.permissions?.includes(route.permission[0])
  )?.route

  if (status === 'authenticated' && redirectRoute) replace(redirectRoute)

  return <></>
}

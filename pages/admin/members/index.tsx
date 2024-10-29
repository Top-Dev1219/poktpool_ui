import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import useUser from '../../../hooks/useUser'

const routeData = [
  {
    route: 'members/member-lookup',
    permission: [3],
  },
  {
    route: 'members/member-stakes',
    permission: [5],
  },
  {
    route: 'members/member-unstakes',
    permission: [4],
  },
]

export default function ManageMemberPages() {
  const { status } = useSession()
  const { user } = useUser()
  const { replace } = useRouter()

  const redirectRoute = routeData.find((route) =>
    user?.permissions?.includes(route.permission[0])
  )?.route

  if (status === 'authenticated' && redirectRoute) replace(redirectRoute)

  return <></>
}

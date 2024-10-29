import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'

export default function ManageAccount() {
  const { status } = useSession()
  const { replace } = useRouter()

  if (status === 'authenticated') replace('account/profile')

  return <></>
}

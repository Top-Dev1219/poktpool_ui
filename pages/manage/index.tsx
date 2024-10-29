import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'

export default function ManageIndex() {
  const { status } = useSession()
  const { replace } = useRouter()

  if (status === 'authenticated') replace('manage/dashboard')

  return <></>
}

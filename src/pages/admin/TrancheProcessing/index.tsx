import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import { CircularProgress } from '@mui/material'
import useUser from '../../../../hooks/useUser'
import { useAuthQuery } from '../../../../hooks/useApi'

export const TrancheIndex = () => {
  const { data: sessionData } = useSession()
  const { loading: userLoading } = useUser()
  const router = useRouter()
  const { data: openTrancheData, isLoading: trancheLoading } = useAuthQuery(
    'admin/tranche/current-open'
  )

  useEffect(() => {
    const session: any = sessionData

    if (session?.permissions && !session?.permissions?.includes(1)) {
      router.push('manage/dashboard')
    }
  }, [sessionData, router])

  if (userLoading) {
    return (
      <div className="flex flex-col w-full h-screen justify-center items-center">
        <div className="flex mb-4">Authenticating...</div>
        <CircularProgress />
      </div>
    )
  } else {
    if (!trancheLoading && openTrancheData?.tranche_id)
      router.push(`tranche/sweep-balances/${openTrancheData?.tranche_id}`)
  }

  return (
    <>
      <div className="flex flex-col w-full h-screen justify-center items-center">
        <div className="flex mb-4">Loading content...</div>
        <CircularProgress />
      </div>
    </>
  )
}

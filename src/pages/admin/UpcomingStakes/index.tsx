import { useMemo, useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { signIn, useSession } from 'next-auth/react'
import { useQuery } from 'react-query'
import { CSVLink } from 'react-csv'
import axios from 'axios'
import { format, getUnixTime } from 'date-fns'
import { Typography, Box } from '@mui/material'
import { CircularProgress } from '@mui/material'
import { UpcomingStakesTable, HeadCell } from './UpcomingStakesTable'
import useAccessToken from '../../../../hooks/useAccessToken'
import { formatUTCDate } from '../../../utils/time'

const headCells: readonly HeadCell[] = [
  {
    id: 'dt_submitted',
    numeric: true,
    disablePadding: true,
    label: 'Stake Date',
  },
  {
    id: 'pokt_amount',
    numeric: false,
    disablePadding: false,
    label: 'Amount of stakes',
    number: true,
  },
  {
    id: 'username',
    numeric: true,
    disablePadding: false,
    label: 'Username',
  },
  {
    id: 'email',
    numeric: true,
    disablePadding: false,
    label: 'Email',
  },
  {
    id: 'p_wallet_id',
    numeric: true,
    disablePadding: false,
    label: 'Wallet ID',
  },
]

const headers = [
  { label: 'Stake Date', key: 'dt_submitted' },
  { label: 'Amount of Stakes', key: 'pokt_amount' },
  { label: 'Username', key: 'username' },
  { label: 'Email', key: 'email' },
  { label: 'Wallet ID', key: 'p_wallet_id' },
]

export const UpcomingStakes = () => {
  const accessToken = useAccessToken()
  const { status, data: sessionData } = useSession()
  const [date, setDate] = useState(new Date())
  const [isOnAdmin, setIsOnAdmin] = useState(false)
  const excelDate = format(date, 'yyyy-MM-dd HH:mm:ss')
  const router = useRouter()

  const { data: upcomingStakes, isLoading: dataLoading } = useQuery(
    'admin/upcoming-stakes',
    () =>
      axios
        .get('admin/upcoming-stakes', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((res) => res.data),
    {
      enabled: !!accessToken,
    }
  )

  const formattedData = useMemo(() => {
    return upcomingStakes && upcomingStakes.length
      ? upcomingStakes
          .filter((item: any) => item.dt_submitted)
          .sort((a: any, b: any) => {
            return (
              getUnixTime(new Date(b.dt_submitted)) -
              getUnixTime(new Date(a.dt_submitted))
            )
          })
          .map((item: any) => {
            return {
              ...item,
              dt_submitted: item?.dt_submitted
                ? format(formatUTCDate(item.dt_submitted), 'yyyy-MM-dd')
                : '-',
              pokt_amount: item?.pokt_amount ? Number(item?.pokt_amount) : 0,
            }
          })
      : []
  }, [upcomingStakes])

  if (status === 'unauthenticated') signIn()

  useEffect(() => {
    const session: any = sessionData

    if (session?.permissions && !session?.permissions?.includes(5)) {
      router.push('manage/dashboard')
    }
  }, [sessionData, router])

  return (
    <div>
      <div className="mt-8 md:flex justify-between">
        <Typography className="text-xl">Upcoming Stakes</Typography>
        <div className="mt-6 md:mt-0">
          <CSVLink
            data={formattedData}
            filename={`upcoming-stakes-${excelDate}.csv`}
            className="btn bg-brand-blue-dark text-white py-3 px-4 rounded"
            target="_blank"
            headers={headers}
            onClick={() => setDate(new Date())}
          >
            Download CSV
          </CSVLink>
        </div>
      </div>
      <Box component="main" className="mt-6 mb-16" sx={{ flexGrow: 1 }}>
        {dataLoading ? (
          <CircularProgress />
        ) : (
          <UpcomingStakesTable
            headCells={headCells}
            resultData={formattedData}
            showPager
          />
        )}
      </Box>
    </div>
  )
}

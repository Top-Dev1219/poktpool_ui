import { useMemo, useEffect, useState } from 'react'
import { useQuery } from 'react-query'
import { useRouter } from 'next/router'
import { format, getUnixTime } from 'date-fns'
import axios from 'axios'
import { ReportTable, HeadCell } from '../../../../components/ReportTable'
import { Typography, Box } from '@mui/material'
import useAccessToken from '../../../../hooks/useAccessToken'
import { formatUTCDate } from '../../../utils/time'
import { CircularProgress } from '@mui/material'
import { signIn, useSession } from 'next-auth/react'
import { CSVLink } from 'react-csv'
import currency from 'currency.js'

const headCells: readonly HeadCell[] = [
  {
    id: 'unstake_req_date',
    numeric: true,
    disablePadding: true,
    label: 'Request Date',
  },
  {
    id: 'unstake_due_date',
    numeric: true,
    disablePadding: true,
    label: 'Due Date',
  },
  {
    id: 'amount_owed',
    numeric: false,
    disablePadding: false,
    label: 'Amount of unstakes',
    number: true,
  },
  {
    id: 'perc_unstake',
    numeric: false,
    disablePadding: false,
    label: 'Percent unstakes (%)',
    percent: true,
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
  {
    id: 'discord_handle',
    numeric: true,
    disablePadding: false,
    label: 'Discord',
  },
]

const headers = [
  { label: 'Due Date', key: 'unstake_due_date' },
  { label: 'Amount of Unstakes', key: 'amount_owed' },
  { label: 'Percent Unstakes(%)', key: 'perc_unstake' },
  { label: 'Username', key: 'username' },
  { label: 'Email', key: 'email' },
  { label: 'Wallet ID', key: 'p_wallet_id' },
  { label: 'Discord', key: 'discord_handle' },
]

export const UpcomingUnstakes = () => {
  const { status, data: sessionData } = useSession()
  const accessToken = useAccessToken()
  const router = useRouter()
  const [date, setDate] = useState(new Date())
  const excelDate = format(date, 'yyyy-MM-dd HH:mm:ss')

  const { data: upcomingUnstakes, isLoading: dataLoading } = useQuery(
    'admin/individual-unstakes',
    () =>
      axios
        .get('admin/individual-unstakes', {
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
    return upcomingUnstakes && upcomingUnstakes.length
      ? upcomingUnstakes
          .sort((a: any, b: any) => {
            return (
              getUnixTime(new Date(a.unstake_due_date)) -
              getUnixTime(new Date(b.unstake_due_date))
            )
          })
          .map((item: any) => {
            return {
              ...item,
              unstake_req_date: item?.unstake_req_date
                ? format(formatUTCDate(item.unstake_req_date), 'yyyy-MM-dd')
                : '-',
              unstake_due_date: item?.unstake_due_date
                ? format(formatUTCDate(item.unstake_due_date), 'yyyy-MM-dd')
                : '-',
              amount_owed: item?.amount_owed ? Number(item?.amount_owed) : 0,
              perc_unstake: item?.perc_unstake * 100,
            }
          })
      : []
  }, [upcomingUnstakes])

  const getTotal = () => {
    if (upcomingUnstakes) {
      return upcomingUnstakes
        .filter((item: any) => item.unstake_due_date !== null)
        .reduce((a: number, b: any) => a + Number(b.amount_owed), 0)
    }
    return 0
  }

  useEffect(() => {
    const session: any = sessionData

    if (session?.permissions && !session?.permissions?.includes(4)) {
      router.push('manage/dashboard')
    }
  }, [sessionData, router])

  if (status === 'unauthenticated') signIn()

  return (
    <div>
      <div className="mt-8 flex justify-between">
        <Typography className="text-xl">Upcoming Unstakes</Typography>
      </div>
      <div className="md:flex justify-between items-baseline mt-4">
        <div>
          <h3 className="my-0">
            Total Upcoming Unstakes:{' '}
            {currency(getTotal(), {
              symbol: '',
              precision: 2,
            }).format()}
          </h3>
        </div>
        <div className="mt-6 md:mt-0">
          <CSVLink
            data={formattedData}
            filename={`upcoming-unstakes-${excelDate}.csv`}
            className="btn bg-brand-blue-dark text-white py-3 px-4 rounded"
            target="_blank"
            headers={headers}
            onClick={() => setDate(new Date())}
          >
            Download CSV
          </CSVLink>
        </div>
      </div>
      <Box component="main" className="mt-4 mb-16" sx={{ flexGrow: 1 }}>
        {dataLoading ? (
          <CircularProgress />
        ) : (
          <ReportTable
            headCells={headCells}
            resultData={formattedData}
            useEnhancedHead
            showPager
          />
        )}
      </Box>
    </div>
  )
}

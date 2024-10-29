import { useMemo, useState, useEffect } from 'react'
import { useQuery } from 'react-query'
import currency from 'currency.js'
import { format, getUnixTime } from 'date-fns'
import axios from 'axios'
import { Typography, Box } from '@mui/material'
import useAccessToken from '../../../../hooks/useAccessToken'
import { formatUTCDate } from '../../../utils/time'
import { CircularProgress } from '@mui/material'
import { signIn, useSession } from 'next-auth/react'
import { CSVLink } from 'react-csv'
import { useRouter } from 'next/router'
import useUser from '../../../../hooks/useUser'
import { TrancheTable, HeadCell } from './components'

const headCells: readonly HeadCell[] = [
  {
    id: 'tranche_end',
    numeric: true,
    disablePadding: false,
    label: 'Tranche End',
  },
  {
    id: 'exchange_rate',
    numeric: false,
    disablePadding: false,
    label: 'Exchange Rate',
    currency: true,
  },
  {
    id: 'infrastructure_fees',
    numeric: false,
    disablePadding: false,
    label: 'Infra Fees',
  },
  {
    id: 'commissions',
    numeric: false,
    disablePadding: false,
    label: 'Rev Share',
  },
  {
    id: 'gross_rewards',
    numeric: false,
    disablePadding: false,
    label: 'Gross Rewards',
  },
  {
    id: 'balance_unstaked',
    numeric: false,
    disablePadding: false,
    label: 'Incoming Unstakes(from balance)',
  },
  {
    id: 'rewards_unstaked',
    numeric: false,
    disablePadding: false,
    label: 'Incoming Unstakes(from rewards)',
  },
  {
    id: 'sweeps_tosend',
    numeric: false,
    disablePadding: false,
    label: 'Sweeps',
  },
  {
    id: 'unstakes_tosend',
    numeric: false,
    disablePadding: false,
    label: 'Unstakes',
  },
  {
    id: 'rollovers',
    numeric: false,
    disablePadding: false,
    label: 'Rollovers',
  },
  {
    id: 'new_equity_injected',
    numeric: false,
    disablePadding: false,
    label: 'Injections',
  },
  {
    id: 'actions',
    numeric: false,
    disablePadding: false,
    label: '',
  },
]

const headers = [
  { label: 'Tranche End', key: 'tranche_end' },
  { label: 'Exchange Rate', key: 'exchange_rate' },
  { label: 'Infra Fees', key: 'infrastructure_fees' },
  { label: 'Rev Share', key: 'commissions' },
  { label: 'Gross Rewards', key: 'gross_rewards' },
  { label: 'Incoming Unstakes(from balance)', key: 'balance_unstaked' },
  { label: 'Incoming Unstakes(from rewards)', key: 'rewards_unstaked' },
  { label: 'Sweeps', key: 'sweeps_tosend' },
  { label: 'Unstakes', key: 'unstakes_tosend' },
  { label: 'Rollovers', key: 'rollovers' },
  { label: 'Injections', key: 'new_equity_injected' },
]

const poktCurrency = {
  precision: 2,
  symbol: '',
}

const formatPokt = (amount: number) => currency(amount, poktCurrency).format()

export const ClosedTranches = () => {
  const accessToken = useAccessToken()
  const { user, loading: userLoading } = useUser()
  const { status, data: sessionData } = useSession()
  const [date, setDate] = useState(new Date())
  const [isOnAdmin, setIsOnAdmin] = useState(false)
  const excelDate = format(date, 'yyyy-MM-dd HH:mm:ss')
  const router = useRouter()

  const { data: closedTranches, isLoading: dataLoading } = useQuery(
    'admin/closed-tranches',
    () =>
      axios
        .get('admin/closed-tranches', {
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
    return closedTranches && closedTranches.length
      ? closedTranches
          .filter((item: any) => item.tranche_end)
          .sort((a: any, b: any) => {
            return (
              getUnixTime(new Date(b.tranche_end)) -
              getUnixTime(new Date(a.tranche_end))
            )
          })
          .map((item: any) => {
            return {
              ...item,
              tranche_end: item?.tranche_end
                ? format(formatUTCDate(item.tranche_end), 'yyyy-MM-dd HH:mm:ss')
                : '-',
              exchange_rate: item?.exchange_rate,
              infrastructure_fees:
                item?.infrastructure_fees &&
                formatPokt(item?.infrastructure_fees),
              gross_rewards:
                item?.gross_rewards && formatPokt(item?.gross_rewards),
              commissions: item?.commissions && formatPokt(item?.commissions),
              balance_unstaked:
                item?.balance_unstaked && formatPokt(item?.balance_unstaked),
              rewards_unstaked:
                item?.rewards_unstaked && formatPokt(item?.rewards_unstaked),
              sweeps_tosend:
                item?.sweeps_tosend && formatPokt(item?.sweeps_tosend),
              unstakes_tosend:
                item?.unstakes_tosend && formatPokt(item?.unstakes_tosend),
              rollovers: item?.rollovers && formatPokt(item?.rollovers),
              new_equity_injected:
                item?.new_equity_injected &&
                formatPokt(item?.new_equity_injected),
            }
          })
      : []
  }, [closedTranches])

  if (status === 'unauthenticated') signIn()

  useEffect(() => {
    const session: any = sessionData

    if (session?.permissions && !session?.permissions?.includes(8)) {
      router.push('manage/dashboard')
    }
  }, [sessionData])

  return (
    <div>
      <div className="mt-8 md:flex justify-between">
        <Typography className="text-xl">Closed Tranches</Typography>
        <div className="mt-4 md:mt-0">
          <CSVLink
            data={formattedData}
            filename={`closed-tranches-${excelDate}.csv`}
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
          <TrancheTable
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

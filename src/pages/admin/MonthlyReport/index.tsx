import { useMemo, useState, useEffect } from 'react'
import { useQuery } from 'react-query'
import currency from 'currency.js'
import { format, getUnixTime } from 'date-fns'
import axios from 'axios'
import { ReportTable, HeadCell } from '../../../../components/ReportTable'
import { Typography, Box } from '@mui/material'
import useAccessToken from '../../../../hooks/useAccessToken'
import { formatUTCDate } from '../../../utils/time'
import { CircularProgress } from '@mui/material'
import { signIn, useSession } from 'next-auth/react'
import { CSVLink } from 'react-csv'
import { useRouter } from 'next/router'

const headCells: readonly HeadCell[] = [
  {
    id: 'as_of_date',
    numeric: true,
    disablePadding: false,
    label: 'Month',
    smallText: true,
  },
  {
    id: 'staked_balance',
    numeric: true,
    disablePadding: false,
    label: 'Total Staked',
    smallText: true,
  },
  {
    id: 'active_members',
    numeric: true,
    disablePadding: false,
    label: 'Total Members',
    smallText: true,
  },
  {
    id: 'new_members',
    numeric: true,
    disablePadding: false,
    label: 'New Members',
    smallText: true,
  },
  {
    id: 'full_unstakes',
    numeric: true,
    disablePadding: false,
    label: 'Members Unstaked',
    smallText: true,
  },
  {
    id: 'member_net_change',
    numeric: true,
    disablePadding: false,
    label: 'Member Net Change',
    smallText: true,
  },
  {
    id: 'injections',
    numeric: true,
    disablePadding: false,
    label: 'Total Injections',
    smallText: true,
  },
  {
    id: 'new_member_stakes',
    numeric: true,
    disablePadding: false,
    label: 'New Member Injections',
    smallText: true,
  },
  {
    id: 'unstakes',
    numeric: true,
    disablePadding: false,
    label: 'Amount Unstaked',
    smallText: true,
  },
  {
    id: 'balance_net_change',
    numeric: true,
    disablePadding: false,
    label: 'Balance Net Change',
    smallText: true,
  },
  {
    id: 'gross_rewards',
    numeric: true,
    disablePadding: false,
    label: 'Gross Rewards',
    smallText: true,
  },
  {
    id: 'sweeps',
    numeric: true,
    disablePadding: false,
    label: 'Swept Rewards',
    smallText: true,
  },
  {
    id: 'rollovers',
    numeric: true,
    disablePadding: false,
    label: 'Rollover Rewards',
    smallText: true,
  },
  {
    id: 'amount_staked_per_member',
    numeric: true,
    disablePadding: false,
    label: 'Amount Staked per Member',
    smallText: true,
  },
  {
    id: 'min_rate',
    numeric: true,
    disablePadding: false,
    label: 'Min POKT Price',
    price: true,
    smallText: true,
  },
  {
    id: 'max_rate',
    numeric: true,
    disablePadding: false,
    label: 'Max POKT Price',
    price: true,
    smallText: true,
  },
  {
    id: 'avg_rate',
    numeric: true,
    disablePadding: false,
    label: 'Avg POKT Price',
    price: true,
    smallText: true,
  },
]

const headers = [
  {
    key: 'as_of_date',
    label: 'Month',
  },
  {
    key: 'staked_balance',
    label: 'Total Staked  ',
  },
  {
    key: 'active_members',
    label: 'Total Members ',
  },
  {
    key: 'new_members',
    label: 'New Members',
  },
  {
    key: 'full_unstakes',
    label: 'Members Unstaked',
  },
  {
    key: 'member_net_change',
    label: 'Member Net Change',
  },
  {
    key: 'injections',
    label: 'Total Injections',
  },
  {
    key: 'new_member_stakes',
    label: 'New Member Injections',
  },
  {
    key: 'unstakes',
    label: 'Amount Unstaked',
  },
  {
    key: 'balance_net_change',
    label: 'Balance Net Change',
  },
  {
    key: 'gross_rewards',
    label: 'Gross Rewards',
  },
  {
    key: 'sweeps',
    label: 'Swept Rewards',
  },
  {
    key: 'rollovers',
    label: 'Rollover Rewards',
  },
  {
    key: 'amount_staked_per_member',
    label: 'Amount Staked per Member',
  },
  {
    key: 'min_rate',
    label: 'Min POKT Price',
  },
  {
    key: 'max_rate',
    label: 'Max POKT Price',
  },
  {
    key: 'avg_rate',
    label: 'Avg POKT Price',
  },
]

const poktCurrency = {
  precision: 2,
  symbol: '',
}

const formatPokt = (amount: number) => currency(amount, poktCurrency).format()

export const MonthlyReport = () => {
  const accessToken = useAccessToken()
  const { status, data: sessionData } = useSession()
  const [date, setDate] = useState(new Date())
  const excelDate = format(date, 'yyyy-MM-dd HH:mm:ss')
  const router = useRouter()

  const { data: superAdminReport, isLoading: dataLoading } = useQuery(
    'admin/pool-member-stats',
    () =>
      axios
        .get('admin/pool-member-stats', {
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
    return superAdminReport && superAdminReport.length
      ? superAdminReport
          .filter((item: any) => item.as_of_date)
          .sort((a: any, b: any) => {
            return (
              getUnixTime(new Date(b.as_of_date)) -
              getUnixTime(new Date(a.as_of_date))
            )
          })
          .map((item: any) => {
            return {
              ...item,
              as_of_date: item?.as_of_date
                ? format(formatUTCDate(item.as_of_date), 'MM-yyyy')
                : '-',
              staked_balance:
                item?.staked_balance && formatPokt(item?.staked_balance),
              member_net_change:
                item?.new_members && item?.full_unstakes
                  ? Number(item?.new_members) - Number(item?.full_unstakes)
                  : '',
              balance_net_change:
                item?.injections && item?.unstakes
                  ? formatPokt(
                      Number(item?.injections) + Number(item?.unstakes)
                    )
                  : '',
              gross_rewards:
                item?.gross_rewards && formatPokt(item?.gross_rewards),
              amount_staked_per_member:
                item.staked_balance && item?.active_members
                  ? formatPokt(
                      Number(item?.staked_balance) /
                        Number(item?.active_members)
                    )
                  : '',
              injections: item?.injections && formatPokt(item?.injections),
              new_member_stakes:
                item?.new_member_stakes && formatPokt(item?.new_member_stakes),
              unstakes: item?.unstakes && formatPokt(item?.unstakes),
              min_rate:
                item?.min_rate &&
                currency(item?.min_rate, {
                  precision: 6,
                  symbol: '',
                }).format(),
              max_rate:
                item?.max_rate &&
                currency(item?.max_rate, {
                  precision: 6,
                  symbol: '',
                }).format(),
              avg_rate:
                item?.avg_rate &&
                currency(item?.avg_rate, {
                  precision: 6,
                  symbol: '',
                }).format(),
              sweeps: item?.sweeps && formatPokt(item?.sweeps),
              rollovers: item?.rollovers && formatPokt(item?.rollovers),
            }
          })
      : []
  }, [superAdminReport])

  useEffect(() => {
    const session: any = sessionData

    if (session?.permissions && !session?.permissions?.includes(9)) {
      router.push('manage/dashboard')
    }
  }, [sessionData, router])

  if (status === 'unauthenticated') signIn()

  return (
    <div>
      <div className="my-8 md:flex justify-between">
        <Typography className="text-xl">Monthly Report</Typography>
        <div className="mt-6 md:mt-0">
          <CSVLink
            data={formattedData}
            filename={`super-admin-report-${excelDate}.csv`}
            className="btn bg-brand-blue-dark text-white py-3 px-4 rounded"
            target="_blank"
            headers={headers}
            onClick={() => setDate(new Date())}
          >
            Download CSV
          </CSVLink>
        </div>
      </div>
      <p>Latest Month-to-Date as of {format(new Date(), 'MMMM dd, yyyy')}</p>
      <Box component="main" className="mt-10 mb-16" sx={{ flexGrow: 1 }}>
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

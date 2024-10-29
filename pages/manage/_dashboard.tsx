import {
  CircularProgress,
  Typography,
  Grid,
  Skeleton,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers'
import currency from 'currency.js'
import type { NextPage } from 'next'
import { signIn, useSession } from 'next-auth/react'
import qs from 'qs'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from 'react-query'
import axios from 'axios'
import PageLayout from '../../components/PageLayout'
import PoktBalanceChart from '../../components/PoktBalanceChart'
import useAccessToken from '../../hooks/useAccessToken'
import PoktInfo from '../../components/PoktInfo'
import { DashboardInfoCard } from '../../components/DashboardInfoCard'
import FileCopyIcon from '@mui/icons-material/FileCopy'
import { ReportTable, HeadCell } from '../../components/ReportTable'
import { CSVLink } from 'react-csv'
import { formatUTCDate } from '../../src/utils/time'
import { format } from 'date-fns'
import { useRouter } from 'next/router'
import useCustomerId from '../../hooks/useCustomerId'

const headCells: readonly HeadCell[] = [
  {
    id: 'as_of_date',
    numeric: true,
    disablePadding: true,
    label: 'Date',
  },
  {
    id: 'pokt_price',
    numeric: false,
    disablePadding: false,
    label: 'POKT Price',
  },
  {
    id: 'staked_balance',
    numeric: false,
    disablePadding: false,
    label: 'Total Staked',
  },
  {
    id: 'gross_rewards',
    numeric: false,
    disablePadding: false,
    label: 'Gross Rewards',
  },
  {
    id: 'net_rewards',
    numeric: false,
    disablePadding: false,
    label: 'Net Rewards',
  },
  {
    id: 'fees_taken',
    numeric: false,
    disablePadding: false,
    label: 'Fees',
  },
  {
    id: 'injections',
    numeric: false,
    disablePadding: false,
    label: 'Injections',
  },
  {
    id: 'sweeps',
    numeric: false,
    disablePadding: false,
    label: 'Sweeps',
  },
  {
    id: 'unstakes',
    numeric: false,
    disablePadding: false,
    label: 'Unstake',
  },
  {
    id: 'transfers',
    numeric: false,
    disablePadding: false,
    label: 'Transfers',
  },
  {
    id: 'bonus_airdrops',
    numeric: false,
    disablePadding: false,
    label: 'Air Drop / Bonus',
  },
]

const headers = [
  { label: 'Date', key: 'txn_timestamp' },
  { label: 'POKT Price', key: 'pokt_price' },
  { label: 'Transaction Type', key: 'txn_type' },
  { label: 'Amount', key: 'pokt_amt' },
  { label: 'Staked Balance', key: 'staked_balance' },
  { label: 'Impact Stake?', key: 'impacts_stake' },
  { label: 'Percent', key: 'percent' },
  { label: 'Transaction Hash', key: 'txn_hash' },
  { label: 'Wallet ID', key: 'wallet_address' },
]

const Dashboard: NextPage = () => {
  const { status, data: sessionData } = useSession()
  const { customerId, user, isUserLoading } = useCustomerId()
  const router = useRouter()
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [csvStartDate, setCSVStartDate] = useState(null)
  const [csvEndDate, setCSVEndDate] = useState(null)
  const containerRef = useRef<any>()
  const accessToken = useAccessToken()
  const [copySuccess, setCopySuccess] = useState(false)
  const [isPullingCSV, setIsPullingCSV] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [csvData, setCSVData] = useState([])
  const csvLinkEl = useRef<any>(null)
  const [date, setDate] = useState(new Date())
  const excelDate = format(date, 'yyyy-MM-dd HH:mm:ss')

  const { isLoading, error, data, refetch } = useQuery(
    'userBalance',
    () =>
      axios
        .get(
          `user/balance-history?${qs.stringify({
            ...(startDate ? { startDate } : {}),
            ...(endDate ? { endDate } : {}),
            customerId: customerId,
          })}`,
          {
            headers: {
              authorization: `Bearer ${accessToken}`,
            },
          }
        )
        .then((res) => res.data),
    { enabled: !!accessToken && !!customerId }
  )

  const {
    data: userDataQuery,
    isLoading: isUserDataLoading,
    refetch: refetchPoktData,
  } = useQuery(
    'userData',
    () =>
      axios
        .get(`user/data?customerId=${customerId}`, {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        })
        .then((res) => res.data),
    { enabled: !!accessToken && !!customerId }
  )

  const userRewardQuery = useQuery(
    'userReward',
    () =>
      axios
        .get(`user/reward-history?customerId=${customerId}`, {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        })
        .then((res) => res.data),
    { enabled: !!accessToken && !!customerId }
  )

  const formatRewardData = (value: number) => {
    return value == 0
      ? 0
      : currency(value, {
          precision: 2,
          symbol: '',
        }).format()
  }

  const handleCSVDownload = () => {
    setShowModal(false)
    if (!isPullingCSV) {
      setIsPullingCSV(true)
      axios
        .get(
          `user/download-history?${qs.stringify({
            ...(csvStartDate ? { startDate: csvStartDate } : {}),
            ...(csvEndDate ? { endDate: csvEndDate } : {}),
            customerId: customerId,
          })}`,
          {
            headers: {
              authorization: `Bearer ${accessToken}`,
            },
          }
        )
        .then((res) => {
          const data = res.data
          setCSVData(data)
          setIsPullingCSV(false)
          setDate(new Date())

          setTimeout(() => {
            console.log('downloading....')
            csvLinkEl?.current?.link?.click()
          }, 1000)
        })
        .catch(() => {
          setIsPullingCSV(false)
        })
    }
  }

  const formatCsvData = csvData
    ? csvData.map((item: any) => {
        return {
          ...item,
          txn_timestamp: format(
            formatUTCDate(item.txn_timestamp),
            'yyyy-MM-dd HH:mm:ss'
          ),
          pokt_price: currency(item?.pokt_price, {
            precision: 4,
          }).format(),
          txn_type: item.txn_type,
          pokt_amt: formatRewardData(item?.pokt_amt),
          percent: item.percent,
          txn_hash: item.txn_hash,
          wallet_address: item.wallet_address,
          staked_balance: formatRewardData(item?.staked_balance),
        }
      })
    : []

  const userRewardData = useMemo(() => {
    return userRewardQuery.data && userRewardQuery?.data.length
      ? userRewardQuery?.data.map((item: any) => {
          return {
            ...item,
            as_of_date: item.as_of_date.split('T')[0],
            staked_balance: formatRewardData(Number(item?.staked_balance)),
            fees_taken: formatRewardData(Number(item?.fees_taken)),
            gross_rewards: formatRewardData(Number(item?.gross_rewards)),
            injections: formatRewardData(Number(item?.injections)),
            net_rewards: formatRewardData(Number(item?.net_rewards)),
            sweeps: formatRewardData(Number(item?.sweeps)),
            transfers: formatRewardData(Number(item?.transfers)),
            unstakes: formatRewardData(Number(item?.unstakes)),
            bonus_airdrops: formatRewardData(Number(item?.bonus_airdrops)),
            pokt_price: currency(item.pokt_price, {
              precision: 4,
            }).format(),
          }
        })
      : []
  }, [userRewardQuery])

  const poktStaked =
    userDataQuery && formatRewardData(userDataQuery?.staked_amount)

  const poktPrice = userDataQuery?.pokt_price
    ? currency(userDataQuery?.pokt_price, {
        precision: 4,
      }).format()
    : '-'

  const totalValue = userDataQuery?.staked_value
    ? currency(userDataQuery?.staked_value).format({
        precision: 2,
      })
    : '-'

  const grossRewards = userDataQuery?.gross_rewards
    ? currency(userDataQuery?.gross_rewards).format({
        symbol: '',
      })
    : '-'

  const netRewards = userDataQuery?.net_rewards
    ? currency(userDataQuery?.net_rewards).format({
        symbol: '',
      })
    : '-'

  const totalSwept = userDataQuery?.sweeps_distributed
    ? currency(userDataQuery?.sweeps_distributed).format({
        symbol: '',
      })
    : '-'

  const totalUnstaked = userDataQuery?.unstakes_distributed
    ? currency(userDataQuery?.unstakes_distributed).format({
        symbol: '',
      })
    : '-'

  const copyToClipboard = () => {
    navigator.clipboard.writeText(userDataQuery?.wallet_address as string)
    setCopySuccess(true)

    setTimeout(() => {
      setCopySuccess(false)
    }, 1000)
  }

  if (status === 'unauthenticated') signIn()

  useEffect(() => {
    accessToken && data?.length && refetch()
  }, [accessToken, data, startDate, endDate, refetch])

  useEffect(() => {
    if (user?.customerIds?.length === 0) router.push('/account/wallets')
  }, [user])

  return (
    <>
      {(isLoading || isUserLoading || isUserDataLoading) && (
        <div className="mx-auto" ref={containerRef}>
          <header className="flex flex-col gap-1 mb-6">
            <Typography variant="h2">
              <Skeleton variant="text" width={300} />
            </Typography>
          </header>

          <Grid container spacing={3}>
            <Grid item xs={12} lg={4}>
              <Skeleton variant="rounded" height={344} />
            </Grid>
            <Grid item xs={12} lg={8}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={12}>
                  <Skeleton variant="rounded" height={95} />
                </Grid>
                <Grid item xs={12} sm={6} md={6}>
                  <Skeleton variant="rounded" height={108} />
                </Grid>
                <Grid item xs={12} sm={6} md={6}>
                  <Skeleton variant="rounded" height={108} />
                </Grid>
                <Grid item xs={12} sm={6} md={6}>
                  <Skeleton variant="rounded" height={108} />
                </Grid>
                <Grid item xs={12} sm={6} md={6}>
                  <Skeleton variant="rounded" height={108} />
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          <section className="text-center mt-24 mb-16">
            <div className="flex justify-center">
              <Typography variant="h2">
                <Skeleton variant="text" width={300} />
              </Typography>
            </div>
            <div className="block sm:flex justify-center items-center gap-4 mx-auto">
              <Typography variant="h2">
                <Skeleton variant="text" width={180} className="flex mx-auto" />
              </Typography>
              <Typography variant="h2">
                <Skeleton variant="text" width={180} className="flex mx-auto" />
              </Typography>
              <Typography variant="h3">
                <Skeleton variant="text" width={130} className="flex mx-auto" />
              </Typography>
            </div>

            <div className="w-full mt-3">
              <Skeleton variant="rounded" height={344} />
            </div>
          </section>
          <div className="mt-24">
            <div className="mb-3 flex justify-end">
              <Skeleton
                variant="rounded"
                width={150}
                height={48}
                className="mb-3 flex justify-end"
              />
            </div>
            <Skeleton variant="rounded" height={344} />
          </div>
        </div>
      )}
      {status === 'authenticated' &&
        accessToken &&
        !isLoading &&
        !isUserLoading &&
        !isUserDataLoading && (
          <div className="mx-auto" ref={containerRef}>
            <header className="flex flex-col gap-1 mb-6">
              <h1 className="mt-0 mb-0">Dashboard</h1>
            </header>

            <Grid container spacing={3}>
              <Grid item xs={12} lg={4}>
                <PoktInfo
                  totalStaked={poktStaked}
                  poktPrice={poktPrice}
                  totalValue={totalValue}
                  handleRefetch={refetchPoktData}
                />
              </Grid>
              <Grid item xs={12} lg={8}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={12}>
                    <div className="px-6 py-6 rounded drop-shadow-xl block lg:flex bg-slate-100">
                      <div className="w-full lg:w-1/4 xl:w-2/5">
                        <p className="text-slate-700 my-0">Username</p>
                        <p className="text-black my-0 font-semibold">
                          {user?.username}
                        </p>
                      </div>
                      <div className="mt-6 sm:mt-0 w-full lg:w-3/4 xl:w-3/5 relative my-0">
                        {userDataQuery?.wallet_nickname ? (
                          <>
                            <p className="text-slate-700 my-0">
                              Wallet Nickname
                            </p>
                            <p className="text-black text-sx md:text-base break-words my-0 font-semibold">
                              {userDataQuery?.wallet_nickname}
                            </p>
                          </>
                        ) : (
                          <div>
                            <p className="text-slate-700 my-0">POKT Address</p>

                            {copySuccess && (
                              <div className="absolute right-2 top-0 p-2 bg-black text-white text-sm rounded-lg">
                                Copied!
                              </div>
                            )}

                            <div className="block md:flex items-center relative">
                              <p className="text-black text-sx md:text-base break-words my-0 font-semibold">
                                {userDataQuery?.wallet_address
                                  ? userDataQuery?.wallet_address
                                  : '-'}
                              </p>

                              <IconButton
                                className="ml-0 md:ml-5 2xl:ml-20 p-0"
                                onClick={copyToClipboard}
                              >
                                <FileCopyIcon />
                              </IconButton>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Grid>
                  <Grid item xs={12} sm={6} md={6}>
                    <DashboardInfoCard
                      label="Gross Rewards"
                      value={grossRewards}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={6}>
                    <DashboardInfoCard label="Net Rewards" value={netRewards} />
                  </Grid>
                  <Grid item xs={12} sm={6} md={6}>
                    <DashboardInfoCard label="Total Swept" value={totalSwept} />
                  </Grid>
                  <Grid item xs={12} sm={6} md={6}>
                    <DashboardInfoCard
                      label="Total Unstaked"
                      value={totalUnstaked}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            <section className="text-center mt-24 mb-16">
              <h2>Balance History</h2>
              {data?.length > 0 ? (
                <PoktBalanceChart
                  data={data}
                  start={startDate}
                  end={endDate}
                  onClearDates={() => {
                    setStartDate(null)
                    setEndDate(null)
                  }}
                  onStartDateChange={(value) => setStartDate(value)}
                  onEndDateChange={(value) => setEndDate(value)}
                />
              ) : (
                <div className="my-16">No data found!</div>
              )}
            </section>
            {userRewardQuery?.isLoading ? (
              <div className="flex items-center justify-center">
                <CircularProgress />
              </div>
            ) : (
              <div className="mt-24">
                <div className="mb-3 flex justify-end">
                  <Button
                    variant="contained"
                    className="btn bg-brand-blue-dark text-white py-3 px-4 rounded"
                    disabled={isPullingCSV}
                    onClick={() => setShowModal(true)}
                  >
                    {isPullingCSV ? 'Generating...' : 'Download CSV'}
                  </Button>
                </div>
                <ReportTable
                  headCells={headCells}
                  resultData={userRewardData}
                  useEnhancedHead={false}
                  showPager={true}
                />
              </div>
            )}
          </div>
        )}

      <Dialog maxWidth="xs" open={showModal} disableEscapeKeyDown>
        <DialogTitle>Select a date range to download.</DialogTitle>
        <DialogContent>
          <DatePicker
            label="Start Date"
            className="w-full mt-4"
            onChange={(value) => setCSVStartDate(value)}
            renderInput={(params) => <TextField {...params} />}
            value={csvStartDate}
          />
          <DatePicker
            label="End Date"
            className="w-full mt-4"
            onChange={(value) => setCSVEndDate(value)}
            renderInput={(params) => <TextField {...params} />}
            value={csvEndDate}
          />
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            onClick={() => {
              setShowModal(false)
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCSVDownload}
            disabled={isPullingCSV}
          >
            Download
          </Button>
        </DialogActions>
      </Dialog>

      <CSVLink
        data={formatCsvData}
        filename={`my-report-${excelDate}.csv`}
        target="_blank"
        headers={headers}
        ref={csvLinkEl}
        asyncOnClick={true}
        onClick={() => setDate(new Date())}
      />
    </>
  )
}

export default Dashboard

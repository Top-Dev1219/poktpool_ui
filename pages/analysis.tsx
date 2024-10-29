import { CircularProgress, Alert, Typography } from '@mui/material'
import Skeleton from '@mui/material/Skeleton'
import currency from 'currency.js'
import type { NextPage } from 'next'
import { signIn, useSession } from 'next-auth/react'
import Head from 'next/head'
import qs from 'qs'
import { useEffect, useRef, useState } from 'react'
import { useQuery } from 'react-query'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import PageLayout from '../components/PageLayout'
import PoktBalanceChart from '../components/PoktBalanceChart'
import useAccessToken from '../hooks/useAccessToken'
import Grid from '@mui/material/Grid'
import axios from 'axios'
import PoktInfo from '../components/PoktInfo'
import useUser from '../hooks/useUser'
import Link from 'next/link'
import { format } from 'date-fns'
import { formatUTCDate } from '../src/utils/time'

const Analytics: NextPage = () => {
  const containerRef = useRef<any>()
  const { user } = useUser()
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [poktInput, setPoktInput] = useState('0')
  const [calcReward, setCalcReward] = useState(0)

  const { data, error, refetch } = useQuery(
    ['member/analytics', startDate, endDate],
    () =>
      axios
        .get(
          `data/balance-history?${qs.stringify({
            ...(startDate ? { startDate } : {}),
            ...(endDate ? { endDate } : {}),
          })}`,
          {}
        )
        .then((res) => res.data)
  )

  const {
    data: poolData,
    isLoading,
    refetch: refetchPoolData,
  } = useQuery('data/pool-metrics', () =>
    axios.get('data/pool-metrics', {}).then((res) => res.data)
  )

  const totalPoktStaked = poolData?.staked_balance
    ? currency(poolData.staked_balance, {
        precision: 2,
        symbol: '',
      }).format()
    : '-'

  const poktPrice = poolData?.pokt_price
    ? currency(poolData?.pokt_price, { precision: 4 }).format()
    : '-'

  const totalValue =
    poolData?.staked_balance && poolData?.pokt_price
      ? currency(
          Number(poolData.staked_balance) * Number(poolData.pokt_price),
          {
            precision: 2,
          }
        ).format()
      : '-'

  const dailyEarningPerK = poolData?.daily_earn_per_k
    ? currency(poolData.daily_earn_per_k * 15, {
        precision: 2,
        symbol: '',
      }).format()
    : '-'

  const earningValue = poolData?.daily_earn_per_k
    ? currency(poolData?.daily_earn_per_k * poolData?.pokt_price * 15, {
        precision: 2,
      }).format()
    : '-'

  const calcManualReward = () => {
    const calcValue = (Number(poktInput) / 1000) * poolData?.daily_earn_per_k
    setCalcReward(calcValue)
  }

  const handleRefetch = () => {
    refetch()
    refetchPoolData()
  }

  return (
    <>
      <Head>
        <meta name="description" content="" />
      </Head>
      <PageLayout title="Pool Analytics">
        {isLoading ? (
          <div className="mx-auto">
            <header className="flex flex-col gap-1 mb-6">
              <Typography variant="h2">
                <Skeleton variant="text" width={300} />
              </Typography>
            </header>
            <Grid container spacing={2}>
              <Grid item xs={12} lg={6} xl={4}>
                <Skeleton variant="rounded" height={344} />
              </Grid>
              <Grid item xs={12} lg={6} xl={8}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Skeleton variant="rounded" height={164} />
                  </Grid>
                  <Grid item xs={12}>
                    <Skeleton variant="rounded" height={164} />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            <section className="mt-20 sm:mt-28">
              <div className="max-w-4xl mx-auto">
                <Typography variant="h3">
                  <Skeleton variant="text" width={300} />
                </Typography>
                <Typography variant="h5">
                  <Skeleton variant="text" />
                </Typography>
                <Typography variant="h5">
                  <Skeleton variant="text" />
                </Typography>

                <Skeleton variant="rounded" height={144} />

                <div className="mt-10 mb-2">
                  <Typography variant="h3">
                    <Skeleton variant="text" width={300} />
                  </Typography>
                </div>
                <Typography variant="h5">
                  <Skeleton variant="text" />
                </Typography>
                <Typography variant="h5">
                  <Skeleton variant="text" />
                </Typography>
                <div className="block sm:flex items-center gap-10 mt-12">
                  <Skeleton
                    variant="rectangular"
                    width="30%"
                    height={56}
                    className="flex mx-auto my-4"
                  />
                  <Skeleton
                    variant="rectangular"
                    width="25%"
                    height={56}
                    className="flex mx-auto my-4"
                  />
                  <Skeleton
                    variant="rectangular"
                    width="30%"
                    height={56}
                    className="flex mx-auto my-4"
                  />
                </div>
              </div>
            </section>

            <section className="text-center mt-24 mb-16">
              <div className="flex justify-center">
                <Typography variant="h2">
                  <Skeleton variant="text" width={300} />
                </Typography>
              </div>
              <div className="block sm:flex justify-center items-center gap-4 mx-auto">
                <Typography variant="h2">
                  <Skeleton
                    variant="text"
                    width={180}
                    className="flex mx-auto"
                  />
                </Typography>
                <Typography variant="h2">
                  <Skeleton
                    variant="text"
                    width={180}
                    className="flex mx-auto"
                  />
                </Typography>
                <Typography variant="h3">
                  <Skeleton
                    variant="text"
                    width={130}
                    className="flex mx-auto"
                  />
                </Typography>
              </div>

              <div className="w-full mt-3">
                <Skeleton variant="rounded" height={344} />
              </div>
            </section>
          </div>
        ) : (
          <div className="mx-auto" ref={containerRef}>
            {user?.customerIds?.length === 0 && (
              <Alert
                severity="warning"
                className="max-w-4xl mx-auto mb-12 warning-alert-style text-brand-orange"
              >
                To start earning in the pool today, click{' '}
                <Link passHref href="/account/verification">
                  <span className="my-0 text-brand-blue-dark cursor-pointer hover:underline">
                    here
                  </span>
                </Link>
              </Alert>
            )}
            <header className="flex flex-col gap-1 mb-6">
              <h1 className="mt-0 mb-0">Pool Analytics</h1>
            </header>
            <Grid container spacing={2}>
              <Grid item xs={12} lg={6} xl={4}>
                <PoktInfo
                  totalStaked={totalPoktStaked}
                  poktPrice={poktPrice}
                  totalValue={totalValue}
                  handleRefetch={handleRefetch}
                />
              </Grid>
              <Grid item xs={12} lg={6} xl={8}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <div className="p-6 rounded drop-shadow-xl bg-slate-100">
                      <p className="text-slate-700 my-4">Active Members</p>
                      <h3 className="text-black text-3xl font-bold my-5 heading-number-tag">
                        {poolData?.staked_members
                          ? currency(poolData.staked_members, {
                              precision: 0,
                              symbol: '',
                            }).format()
                          : '-'}
                      </h3>
                    </div>
                  </Grid>
                  <Grid item xs={12}>
                    <div className="p-6 rounded drop-shadow-xl bg-slate-100">
                      <p className="text-slate-700 my-4">Recent POKT Staked</p>
                      <h3 className="text-black text-3xl font-bold my-5 heading-number-tag">
                        {poolData?.recent_stakes
                          ? currency(poolData.recent_stakes, {
                              precision: 2,
                              symbol: '',
                            }).format()
                          : '-'}
                      </h3>
                    </div>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            <section className="mt-20 sm:mt-28">
              <div className="max-w-4xl mx-auto">
                <h2 className="mb-0">Pool Performance</h2>
                <p className="my-0">
                  The pool&apos;s performance is a weighted aggregate of the
                  gross rewards from all of the vendors with whom poktpool™
                  stakes.
                </p>
                <p>
                  The daily earnings are based on the last tranche which closed
                  at{' '}
                  {poolData?.last_tranche_timestamp &&
                    format(
                      formatUTCDate(poolData.last_tranche_timestamp),
                      'yyyy-MM-dd HH:mm:ss'
                    )}
                </p>
                <div className="bg-brand-blue-dark rounded-md px-10 py-4">
                  <div className="block sm:flex">
                    <div className="w-full sm:w-1/2">
                      <p className="text-white">
                        poktpool daily earnings per 15,000 POKT
                      </p>
                      <h1 className="text-white font-semibold text-4xl sm:text-5xl my-1 heading-number-tag">
                        {dailyEarningPerK}
                      </h1>
                    </div>
                    <div className="sm:flex sm:justify-center w-full sm:w-1/4">
                      <div className="sm:pl-6">
                        <p className="text-white">POKT Price</p>
                        <h2 className="text-white mt-8 mb-1 heading-number-tag">
                          {isLoading ? <CircularProgress /> : poktPrice}
                        </h2>
                      </div>
                    </div>
                    <div className="sm:flex sm:justify-end w-full sm:w-1/4">
                      <div>
                        <p className="text-white">USD Value</p>
                        <h2 className="text-white mt-8 mb-1 heading-number-tag">
                          {isLoading ? <CircularProgress /> : earningValue}
                        </h2>
                      </div>
                    </div>
                  </div>
                </div>

                <h2 className="mt-10 mb-2">Estimate Rewards</h2>
                <p className="mt-0">
                  Enter any amount of POKT here to calculate gross rewards based
                  on the last tranche.
                </p>
                <div className="block sm:flex items-center gap-10 mt-12">
                  <TextField
                    fullWidth
                    className="bg-white"
                    label="Enter POKT here"
                    type="number"
                    InputProps={{ inputProps: { step: 'any' } }}
                    onChange={(e) => setPoktInput(e.target.value)}
                    onKeyPress={(e) => e.which == 13 && calcManualReward()}
                  />
                  <div className="flex justify-center sm:block">
                    <Button
                      className="bg-brand-blue-dark text-white my-8 sm:my-0 p-4 hover:bg-brand-blue-dark"
                      onClick={calcManualReward}
                    >
                      Calculate
                    </Button>
                  </div>

                  <div className="flex">
                    <div className="border border-slate-300 border-solid w-full sm:w-48 h-14 px-4">
                      <p className="mt-3">
                        <span className="font-bold text-2xl">
                          {calcReward
                            ? currency(calcReward, {
                                precision: 2,
                                symbol: '',
                              }).format()
                            : ''}
                        </span>

                        {calcReward && 'POKT'}
                      </p>
                    </div>
                    <div className="border border-slate-300 border-solid w-full sm:w-48 h-14 px-4">
                      <p className="mt-3">
                        <span className="font-bold text-2xl">
                          {calcReward && poolData?.pokt_price
                            ? currency(calcReward * poolData?.pokt_price, {
                                precision: 2,
                              }).format()
                            : ''}
                        </span>
                        {calcReward && 'USD'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="text-center mt-24 mb-16">
              <h2>Balance History</h2>
              {data?.length > 0 && (
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
              )}
            </section>
          </div>
        )}
      </PageLayout>
    </>
  )
}

export default Analytics

import { useState, useEffect } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useMutation } from 'react-query'
import {
  Alert,
  AlertTitle,
  Button,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Skeleton,
} from '@mui/material'
import axios from 'axios'
import { useRouter } from 'next/router'
import currency from 'currency.js'
import useAccessToken from '../../../../hooks/useAccessToken'
import { useAuthQuery } from '../../../../hooks/useApi'
import { StepIndicator } from './StepIndicator'

const poktCurrency = {
  precision: 2,
  symbol: '',
}

const formatPokt = (amount: number) => currency(amount, poktCurrency).format()

export const TrancheStats = () => {
  const { status, data: sessionData } = useSession()
  const [error, setErrorObj] = useState<{ error: string; message: string[] }>()
  const [showError, setShowError] = useState(false)
  const router = useRouter()
  const accessToken = useAccessToken()
  const [submitted, setSubmitted] = useState(false)

  const trancheId = router.query.slug

  const { data: trancheStats, isLoading: isTrancheStatsLoading } = useAuthQuery(
    `admin/tranche-stats/${trancheId}`,
    undefined,
    { enabled: !!trancheId }
  )

  useEffect(() => {
    const session: any = sessionData

    if (session?.permissions && !session?.permissions?.includes(1)) {
      router.push('manage/dashboard')
    }
  }, [sessionData, router])

  if (status === 'unauthenticated') signIn()

  const handleProcessTranche = () => {
    setSubmitted(true)
    processTranche({
      trancheId: Number(trancheId),
    })
  }

  const { mutate: processTranche } = useMutation(
    ({ trancheId }: { trancheId: number }) =>
      axios.post(
        `admin/distribute-post-tranche`,
        { trancheId },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      ),
    {
      onSuccess: async (res) => {
        const data = await res.data
        router.replace(`/admin/tranche/complete/${trancheId}`)
      },
      onError: (error: any) => {
        setShowError(true)
        setErrorObj(error?.response?.data)
      },
    }
  )

  return (
    <>
      <div className="flex max-w-5xl mx-auto">
        <StepIndicator />
      </div>
      <section className="max-w-4xl mx-auto">
        {showError && (
          <Stack className="my-8">
            {error?.error && (
              <Alert
                onClose={() => {
                  setErrorObj({ error: '', message: [] })
                  setShowError(false)
                }}
                severity="error"
              >
                <AlertTitle>{error?.error}</AlertTitle>
                {typeof error.message === 'string' && <p>{error.message}</p>}
                {Array.isArray(error.message) && (
                  <ul className="pl-4">
                    {error.message?.map((message, i) => (
                      <li key={i} className="list-disc">
                        {message}
                      </li>
                    ))}
                  </ul>
                )}
              </Alert>
            )}
          </Stack>
        )}

        {isTrancheStatsLoading && (
          <>
            <section className="mb-8">
              <Skeleton variant="text" width={200} height={60} />
            </section>
            <section>
              <TableContainer component={Paper}>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell component="th" scope="row" className="py-1">
                        <Skeleton variant="text" height={40} />
                      </TableCell>
                      <TableCell align="right" className="py-1">
                        <Skeleton variant="text" height={40} />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row" className="py-1">
                        <Skeleton variant="text" height={40} />
                      </TableCell>
                      <TableCell align="right" className="py-1">
                        <Skeleton variant="text" height={40} />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row" className="py-1">
                        <Skeleton variant="text" height={40} />
                      </TableCell>
                      <TableCell align="right" className="py-1">
                        <Skeleton variant="text" height={40} />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row" className="py-1">
                        <Skeleton variant="text" height={40} />
                      </TableCell>
                      <TableCell align="right" className="py-1">
                        <Skeleton variant="text" height={40} />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row" className="py-1">
                        <Skeleton variant="text" height={40} />
                      </TableCell>
                      <TableCell align="right" className="py-1">
                        <Skeleton variant="text" height={40} />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row" className="py-1">
                        <Skeleton variant="text" height={40} />
                      </TableCell>
                      <TableCell align="right" className="py-1">
                        <Skeleton variant="text" height={40} />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row" className="py-1">
                        <Skeleton variant="text" height={40} />
                        <ul className="mt-2 mb-0 list-disc">
                          <li className="list-disc">
                            <Skeleton variant="text" height={40} />
                          </li>
                          <li className="list-disc">
                            <Skeleton variant="text" height={40} />{' '}
                          </li>
                        </ul>
                      </TableCell>
                      <TableCell align="right" className="py-1">
                        <Skeleton variant="text" height={40} />
                        <ul className="mt-2 mb-0">
                          <li>
                            <Skeleton variant="text" height={40} />
                          </li>
                          <li>
                            <Skeleton variant="text" height={40} />
                          </li>
                        </ul>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row" className="py-1">
                        <Skeleton variant="text" height={40} />
                      </TableCell>
                      <TableCell align="right" className="py-1">
                        <Skeleton variant="text" height={40} />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row" className="py-1">
                        <Skeleton variant="text" height={40} />
                      </TableCell>
                      <TableCell align="right" className="py-1">
                        <Skeleton variant="text" height={40} />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row" className="py-1">
                        <Skeleton variant="text" height={40} />
                      </TableCell>
                      <TableCell align="right" className="py-1">
                        <Skeleton variant="text" height={40} />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row" className="py-1">
                        <Skeleton variant="text" height={40} />
                      </TableCell>
                      <TableCell align="right" className="py-1">
                        <Skeleton variant="text" height={40} />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row" className="py-1">
                        <Skeleton variant="text" height={40} />
                      </TableCell>
                      <TableCell align="right" className="py-1">
                        <Skeleton variant="text" height={40} />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row" className="py-1">
                        <Skeleton variant="text" height={40} />
                      </TableCell>
                      <TableCell align="right" className="py-1">
                        <Skeleton variant="text" height={40} />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </section>
          </>
        )}

        {trancheStats && (
          <>
            <section className="mb-8">
              <h2>Tranche Stats</h2>
            </section>
            <section>
              <TableContainer component={Paper}>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell component="th" scope="row">
                        Tranche End
                      </TableCell>
                      <TableCell align="right">
                        {trancheStats.tranche_end &&
                          trancheStats.tranche_end.split('T')[0]}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row">
                        Exchange Rate
                      </TableCell>
                      <TableCell align="right">
                        {trancheStats?.exchange_rate}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row">
                        Current Node Count
                      </TableCell>
                      <TableCell align="right">
                        {trancheStats?.active_nodes}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row">
                        Infrastructure Fees
                      </TableCell>
                      <TableCell align="right">
                        {trancheStats?.infrastructure_fees &&
                          formatPokt(trancheStats?.infrastructure_fees)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row">
                        Gross Rewards
                      </TableCell>
                      <TableCell align="right">
                        {trancheStats?.gross_rewards &&
                          formatPokt(trancheStats?.gross_rewards)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row">
                        Commissions
                      </TableCell>
                      <TableCell align="right">
                        {trancheStats?.commissions &&
                          formatPokt(trancheStats?.commissions)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row">
                        Incoming Unstakes
                        <ul className="mt-2 mb-0 list-disc">
                          <li className="list-disc">
                            Staked Balance Unstakes:
                          </li>
                          <li className="list-disc">Rewards Unstaked: </li>
                        </ul>
                      </TableCell>
                      <TableCell align="right">
                        {trancheStats?.incoming_unstakes &&
                          formatPokt(trancheStats?.incoming_unstakes)}
                        <ul className="mt-2 mb-0">
                          <li>
                            {trancheStats?.balance_unstaked &&
                              formatPokt(trancheStats?.balance_unstaked)}
                          </li>
                          <li>
                            {trancheStats?.rewards_unstaked &&
                              formatPokt(trancheStats?.rewards_unstaked)}
                          </li>
                        </ul>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row">
                        Sweeps to Send
                      </TableCell>
                      <TableCell align="right">
                        {trancheStats?.sweeps_tosend &&
                          formatPokt(trancheStats?.sweeps_tosend)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row">
                        Unstakes to Send
                      </TableCell>
                      <TableCell align="right">
                        {trancheStats?.unstakes_tosend &&
                          formatPokt(trancheStats?.unstakes_tosend)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row">
                        Rollovers
                      </TableCell>
                      <TableCell align="right">
                        {trancheStats?.rollovers &&
                          formatPokt(trancheStats?.rollovers)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row">
                        New POKT Injected
                      </TableCell>
                      <TableCell align="right">
                        {trancheStats?.new_equity_injected &&
                          formatPokt(trancheStats?.new_equity_injected)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row">
                        Total Incoming POKT
                      </TableCell>
                      <TableCell align="right">
                        {trancheStats?.total_incoming_equity &&
                          formatPokt(trancheStats?.total_incoming_equity)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row">
                        Cancelled Unstakes
                      </TableCell>
                      <TableCell align="right">
                        {trancheStats?.unstakes_cancelled &&
                          formatPokt(trancheStats?.unstakes_cancelled)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              <Button
                className="flex-shrink-0 py-3 mt-4"
                type="submit"
                disabled={!trancheStats?.enableTransferButton || submitted}
                variant="contained"
                onClick={handleProcessTranche}
              >
                Process Tranche
              </Button>
            </section>
          </>
        )}
      </section>
    </>
  )
}

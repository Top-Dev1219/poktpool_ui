import { useEffect, useState } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useMutation } from 'react-query'
import {
  Alert,
  AlertTitle,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
} from '@mui/material'
import { FieldValues, useForm } from 'react-hook-form'
import { useRouter } from 'next/router'
import currency from 'currency.js'
import axios from 'axios'
import { useAuthQuery } from '../../../../hooks/useApi'
import useAccessToken from '../../../../hooks/useAccessToken'
import { StepIndicator } from './StepIndicator'

interface CloseTranchPayload {}

const poktCurrency = {
  precision: 2,
  symbol: '',
}

const formatPokt = (amount: number) => currency(amount, poktCurrency).format()

export const TrancheClose = () => {
  const router = useRouter()
  const { status, data: sessionData } = useSession()
  const accessToken = useAccessToken()
  const {
    handleSubmit: handleCloseTrancheSubmit,
    register: registerCloseTrancheFields,
    watch: watchCloseTrancheFields,
    setValue,
  } = useForm()
  const [enableTrancheClose, setEnableTrancheClose] = useState(false)
  const [isTrancheClosed, setIsTrancheClosed] = useState(false)
  const [showNodeCountSuccess, setNodeCountSuccess] = useState(false)
  const [showNodeRoundingSuccess, setNodeRoundingSuccess] = useState(false)
  const [showError, setShowError] = useState(false)
  const [error, setErrorObj] = useState<{ error: string; message: string[] }>()
  const { data: openTrancheData } = useAuthQuery('admin/tranche/current-open')

  const trancheId = router.query.slug

  const { data: upcomingUnstakes } = useAuthQuery(
    `admin/upcoming-unstakes`,
    undefined
  )

  const { data: providerTrancheSweeps, refetch } = useAuthQuery(
    `admin/vendor-to-aggregated/${trancheId}`,
    undefined,
    { enabled: !!trancheId }
  )

  const { data: trancheData } = useAuthQuery(
    `admin/tranche/${trancheId}`,
    undefined,
    { enabled: !!trancheId }
  )

  const { mutate: closeTranche, isLoading: isCloseTrancheLoading } =
    useMutation(
      (closeTranchPayload: any) =>
        axios.post(`admin/close-tranche`, closeTranchPayload, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }),
      {
        onSuccess: () => {
          setIsTrancheClosed(true)
          router.push(`/admin/tranche/tranche-stats/${trancheId}`)
        },
        onError: (error: any) => {
          setShowError(true)
          setErrorObj(error?.response?.data)
        },
      }
    )

  const onCloseTrancheSubmit = ({
    rewards,
    infra_discount,
    activedays,
  }: FieldValues) => {
    const closeTrancheData = {
      tranche_to_close: openTrancheData?.tranche_id,
      rewards: +rewards,
    } as any

    if (infra_discount) {
      closeTrancheData.infra_discount = +infra_discount
    }

    if (activedays) {
      closeTrancheData.activedays = +activedays
    }

    if (closeTrancheData.tranche_to_close && closeTrancheData.rewards)
      closeTranche(closeTrancheData)
  }

  let noRevShareSum = 0

  if (
    providerTrancheSweeps?.transactions &&
    providerTrancheSweeps?.transactions.length
  ) {
    noRevShareSum =
      providerTrancheSweeps?.transactions
        .filter((item: any) => item.chain_txn_type_code === 8)
        .reduce((sum: number, o: any) => sum + Number(o.amount), 0) / 1000000
  }

  useEffect(() => {
    setValue('rewards', noRevShareSum.toFixed(2))
  }, [noRevShareSum])

  useEffect(() => {
    if (trancheData && trancheData?.eligible_to_close) {
      setEnableTrancheClose(true)
    } else {
      setEnableTrancheClose(false)
    }
  }, [trancheData])

  useEffect(() => {
    const session: any = sessionData

    if (session?.permissions && !session?.permissions?.includes(1)) {
      router.push('manage/dashboard')
    }
  }, [sessionData, router])

  if (status === 'unauthenticated') signIn()

  return (
    <>
      <div className="flex max-w-5xl mx-auto">
        <StepIndicator />
      </div>
      <section className="max-w-4xl mx-auto">
        {showNodeCountSuccess && (
          <Stack className="mb-8">
            <Alert
              severity="success"
              onClose={() => setNodeCountSuccess(false)}
            >
              <AlertTitle>Update node count successful!</AlertTitle>
            </Alert>
          </Stack>
        )}
        {showNodeRoundingSuccess && (
          <Stack className="mb-8">
            <Alert
              severity="success"
              onClose={() => setNodeRoundingSuccess(false)}
            >
              <AlertTitle>Update node rounding successful!</AlertTitle>
            </Alert>
          </Stack>
        )}
        {showError && (
          <Stack className="mb-8">
            {error?.error && (
              <Alert
                onClose={() => {
                  setShowError(false)
                  setErrorObj({ error: '', message: [] })
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
        <h1>Tranche</h1>
        <div className="grid gap-8 grid-cols-2">
          <section>
            <h3 className="mb-12">
              Total staked:{' '}
              {openTrancheData?.total_staked_amount
                ? formatPokt(openTrancheData?.total_staked_amount)
                : '-'}
            </h3>
            <h3>Close Tranche {openTrancheData?.pool_tranche_seq}</h3>
            <p>
              Total Pending Stakes:{' '}
              {openTrancheData?.total_pending_stakes &&
                formatPokt(openTrancheData?.total_pending_stakes)}
            </p>
            <form onSubmit={handleCloseTrancheSubmit(onCloseTrancheSubmit)}>
              <TextField
                fullWidth
                className="bg-white"
                label="Rewards"
                type="number"
                InputProps={{ inputProps: { step: 'any' } }}
                defaultValue={noRevShareSum.toFixed(2)}
                {...registerCloseTrancheFields('rewards', {
                  required: true,
                })}
                autoFocus
              />
              <div className="flex gap-4 my-4">
                <TextField
                  fullWidth
                  className="bg-white"
                  label="Infra Discount Percent"
                  type="number"
                  InputProps={{ inputProps: { step: 'any' } }}
                  {...registerCloseTrancheFields('infra_discount', {
                    required: false,
                  })}
                />
                <TextField
                  fullWidth
                  className="bg-white"
                  label="Active Days"
                  type="number"
                  InputProps={{ inputProps: { step: 'any' } }}
                  {...registerCloseTrancheFields('activedays', {
                    required: false,
                  })}
                />
              </div>
              <Button
                className="flex-shrink-0 py-3"
                type="submit"
                disabled={
                  watchCloseTrancheFields('rewards') === '' ||
                  isCloseTrancheLoading ||
                  isTrancheClosed ||
                  !enableTrancheClose ||
                  openTrancheData?.tranche_id === undefined
                }
                variant="contained"
              >
                Close Tranche
              </Button>
            </form>
            <Alert
              severity="info"
              className="mt-4 info-alert-style text-brand-blue-dark"
            >
              Enter the percentage discount, if any, off of infrastructure fees
              as though there would be a percent sign after it. For example, to
              give a 10% discount, enter 10. The discount may include up to
              decimal places such as 12.75.
            </Alert>
          </section>
          <section>
            <h3 className="mb-12">
              # of BINs:{' '}
              {openTrancheData?.number_of_bins
                ? currency(openTrancheData?.number_of_bins, {
                    symbol: '',
                    precision: 0,
                  }).format()
                : '-'}
            </h3>
            <h3>Upcoming Unstakes</h3>
            <TableContainer component={Paper}>
              <Table>
                <TableBody>
                  {Array.isArray(upcomingUnstakes) &&
                    upcomingUnstakes?.map(({ timezone, amount_owed }: any) => (
                      <TableRow key={timezone}>
                        <TableCell component="th" scope="row">
                          {timezone.split('T')[0]}
                        </TableCell>
                        <TableCell component="td" scope="row" align="right">
                          {formatPokt(amount_owed)}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </section>
        </div>

        {isCloseTrancheLoading && (
          <div className="text-center p-8">
            <CircularProgress />
          </div>
        )}
      </section>
    </>
  )
}

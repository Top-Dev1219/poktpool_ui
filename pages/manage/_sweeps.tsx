import {
  Button,
  ButtonGroup,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  TextField,
  Snackbar,
} from '@mui/material'
import currency from 'currency.js'
import { format, getUnixTime } from 'date-fns'
import { signIn, useSession } from 'next-auth/react'
import { useEffect, useState, useMemo } from 'react'
import { useMutation, useQuery } from 'react-query'
import axios from 'axios'
import { CSVLink } from 'react-csv'
import { useForm, FieldValues } from 'react-hook-form'
import useAccessToken from '../../hooks/useAccessToken'
import useUser from '../../hooks/useUser'
import useWindowSize from '../../hooks/useWindowSize'
import { formatUTCDate } from '../../src/utils/time'
import useCustomerId from '../../hooks/useCustomerId'
import { useRouter } from 'next/router'

export type Sweep = {
  amount: string
  status: string
  sweep_req_date: string
  network_txn_id: string
  recipient_wallet_id: string
  pokt_amount: number
  txn_type_code: number
  txn_type_desc: string
  verification_desc: string
}

const headers = [
  { label: 'Date', key: 'sweep_date' },
  { label: 'Status', key: 'sweep_status' },
  { label: 'Wallet Address', key: 'wallet_address' },
  { label: 'Transaction ID', key: 'tx_id' },
  { label: 'POKT Amount', key: 'pokt_amount' },
]

export default function Sweeps() {
  const { status } = useSession()
  const { user, refetchUser } = useUser()
  const router = useRouter()
  const [showFullWalletIds, setShowFullWalletIds] = useState(false)
  const [showFullTxnId, setShowFullTxnId] = useState(false)
  const [sweepSelection, setSweepSelection] = useState<number>(0)
  const accessToken = useAccessToken()
  const { customerId } = useCustomerId()
  const [date, setDate] = useState(new Date())
  const excelDate = format(date, 'yyyy-MM-dd HH:mm:ss')
  const [patchSuccess, setPatchSuccess] = useState(false)
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({ mode: 'onChange' })

  const { data: userSweepPercent, refetch } = useQuery(
    'Member/user-sweep-percent',
    () =>
      axios
        .get(`withdraw/sweep-percent?customerId=${customerId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((res) => res.data),
    {
      enabled: !!accessToken && !!customerId,
    }
  )

  const { isLoading: mutatingSweepPercent, mutate: mutateSweepPercent } =
    useMutation(({ sweepPercent }: { sweepPercent: number }) =>
      axios
        .patch(
          `withdraw/sweep-percent?customerId=${customerId}`,
          { sweepPercent },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        )
        .then((res) => {
          const data = res.data
          refetch()
          setPatchSuccess(true)
          setValue('sweepPercent', data?.sweepPercent)
          return data
        })
    )

  const onSubmit = ({ sweepPercent }: FieldValues) => {
    mutateSweepPercent({
      sweepPercent: Number(sweepPercent),
    })
  }

  const { data: transactions, isLoading: isSweepsLoading } = useQuery(
    'withdraw/sweeps',
    () =>
      axios
        .get(`withdraw/sweeps?customerId=${customerId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((res) => res.data),
    {
      enabled: !!accessToken && !!customerId,
    }
  )

  const formattedData = useMemo(() => {
    return transactions && transactions.length
      ? transactions
          .sort(
            (a: any, b: any) =>
              getUnixTime(new Date(b.sweep_req_date)) -
              getUnixTime(new Date(a.sweep_req_date))
          )
          .map((item: any) => {
            return {
              ...item,
              sweep_date:
                item?.sweep_req_date &&
                format(
                  formatUTCDate(item?.sweep_req_date),
                  'yyyy-MM-dd HH:mm:ss'
                ),
              sweep_status: item?.status,
              wallet_address: item?.recipient_wallet_id,
              tx_id: item?.network_txn_id,
              pokt_amount:
                item?.pokt_amount &&
                currency(item?.pokt_amount, {
                  precision: 2,
                  symbol: '',
                }).format(),
            }
          })
      : []
  }, [transactions])

  const [showEndAutocompoundDialog, setShowEndAutocompoundDialog] =
    useState(false)

  useEffect(() => {
    mutatingSweepPercent === false && refetchUser()
  }, [mutatingSweepPercent, refetchUser])

  useEffect(() => {
    if (user?.customerIds?.length === 0) router.push('/account/wallets')
  }, [user])

  if (status === 'unauthenticated') signIn()

  return (
    <>
      <Dialog
        open={showEndAutocompoundDialog}
        onClose={() => setShowEndAutocompoundDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Are you sure you want to turn off compounding all?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description"></DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setShowEndAutocompoundDialog(false)
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              setShowEndAutocompoundDialog(false)
              mutateSweepPercent({ sweepPercent: sweepSelection })
              setTimeout(refetchUser, 1000)
            }}
            autoFocus
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={patchSuccess}
        autoHideDuration={3000}
        onClose={() => setPatchSuccess(false)}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          Sweep request has been submitted successfully!
        </Alert>
      </Snackbar>

      <div className="container mx-auto px-4">
        <section className="max-w-4xl mb-16">
          <h1 className="text-4xl">Sweeps</h1>
          <Alert
            severity="info"
            className="rounded-md info-alert-style text-brand-blue-dark"
          >
            Note that 0.01 POKT will be taken from any outgoing sweep or unstake
            transactions to cover gas fees. <br />
            If your sweep amount is less than 1 POKT, it will be automatically
            compounded to your account rather than sending a sweep transaction.
          </Alert>
          <p className="mt-8">
            poktpool compounds 100% of your rewards by default.
          </p>
          <div className="my-8 flex gap-2 items-baseline">
            Currently Compounding:&nbsp;&nbsp;
            <h2 className="m-0 heading-number-tag">
              {userSweepPercent?.sweepPercent
                ? 100 - Number(userSweepPercent?.sweepPercent)
                : 100}
              %
            </h2>
          </div>
          <p>
            Specify the percent of your net rewards you would like to receive to
            your wallet each tranche. Any amount not swept will automatically
            compound to your staked balance to earn more rewards.
          </p>

          <div>
            <form
              noValidate
              autoComplete="off"
              onSubmit={handleSubmit(onSubmit)}
            >
              <div className="flex ">
                <div className="w-72">
                  <TextField
                    id="outlined-number"
                    label="Percentage"
                    type="number"
                    {...register('sweepPercent', {
                      required: true,
                      min: 0,
                      max: 100,
                      validate: (value) => Number.isInteger(Number(value)),
                    })}
                    error={!!errors.sweepPercent}
                    helperText={
                      'Enter a valid integer between 1 and 100. Enter 0 to compound 100%.'
                    }
                    inputProps={{ min: 0, max: 100, step: 1 }}
                    variant="outlined"
                    fullWidth
                    disabled={mutatingSweepPercent}
                  />
                </div>
              </div>
              <div className="mt-8">
                <Button
                  variant="contained"
                  size="large"
                  className="py-3"
                  disabled={mutatingSweepPercent}
                  type="submit"
                >
                  Submit
                </Button>
              </div>
            </form>
          </div>
        </section>
        <section>
          <div className="flex justify-between items-center">
            <h2 className="text-xl">Sweep History</h2>
            <div>
              <CSVLink
                data={formattedData}
                filename={`sweep-history-${excelDate}.csv`}
                className="btn bg-brand-blue-dark text-white py-3 px-4 rounded"
                target="_blank"
                headers={headers}
                onClick={() => setDate(new Date())}
              >
                Download CSV
              </CSVLink>
            </div>
          </div>
          {isSweepsLoading ? (
            <div className="w-full text-center py-4">
              <CircularProgress />
            </div>
          ) : transactions?.length > 0 ? (
            <TableContainer component={Paper} className="mb-16 not-prose">
              <Table aria-label="Stake status queue table">
                <TableHead>
                  <TableRow className="bg-brand-blue-dark">
                    <TableCell align="center">
                      <span className="text-white">Date</span>
                    </TableCell>
                    <TableCell align="center">
                      <span className="text-white">Status</span>
                    </TableCell>
                    <TableCell align="center">
                      <span className="text-white">Wallet Address</span>
                    </TableCell>
                    <TableCell align="center">
                      <span className="text-white">Transaction ID</span>
                    </TableCell>
                    <TableCell align="center">
                      <span className="text-white">POKT Amount</span>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(transactions as Sweep[])
                    .sort(
                      (a, b) =>
                        getUnixTime(new Date(b.sweep_req_date)) -
                        getUnixTime(new Date(a.sweep_req_date))
                    )
                    .map(
                      ({
                        amount,
                        status,
                        sweep_req_date,
                        network_txn_id,
                        pokt_amount,
                        recipient_wallet_id,
                      }) => (
                        <TableRow
                          key={network_txn_id}
                          sx={{
                            '&:last-child td, &:last-child th': { border: 0 },
                          }}
                        >
                          <TableCell align="center">
                            {sweep_req_date &&
                              format(
                                formatUTCDate(sweep_req_date),
                                'yyyy-MM-dd HH:mm:ss'
                              )}
                          </TableCell>
                          <TableCell align="center">{status}</TableCell>
                          <TableCell
                            align="center"
                            onClick={() =>
                              setShowFullWalletIds(!showFullWalletIds)
                            }
                          >
                            {showFullWalletIds
                              ? recipient_wallet_id
                              : recipient_wallet_id
                              ? `...${recipient_wallet_id.slice(-8)}`
                              : '—'}
                          </TableCell>
                          <TableCell
                            align="center"
                            onClick={() => setShowFullTxnId(!showFullTxnId)}
                          >
                            {showFullTxnId
                              ? network_txn_id
                              : network_txn_id
                              ? `...${network_txn_id?.slice(-8)}`
                              : '—'}
                          </TableCell>
                          <TableCell align={pokt_amount ? 'right' : 'center'}>
                            {pokt_amount
                              ? currency(pokt_amount, {
                                  precision: 2,
                                  symbol: '',
                                }).format()
                              : 'Not Available Yet'}
                          </TableCell>
                        </TableRow>
                      )
                    )}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <p className="text-center">No sweeps found.</p>
          )}
        </section>
      </div>
    </>
  )
}

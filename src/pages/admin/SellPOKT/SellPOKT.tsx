import { useMemo, useState, useEffect } from 'react'
import { useQuery, useMutation } from 'react-query'
import { useSession, signIn } from 'next-auth/react'
import currency from 'currency.js'
import { format, getUnixTime } from 'date-fns'
import axios from 'axios'
import {
  Typography,
  Box,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  TextField,
  Stack,
  Alert,
  AlertTitle,
} from '@mui/material'
import useAccessToken from '../../../../hooks/useAccessToken'
import { formatUTCDate } from '../../../utils/time'
import { CircularProgress } from '@mui/material'
import { CSVLink } from 'react-csv'
import { useRouter } from 'next/router'
import useUser from '../../../../hooks/useUser'

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

export const SellPOKT = () => {
  const accessToken = useAccessToken()
  const router = useRouter()
  const { status, data: sessionData } = useSession()
  const [date, setDate] = useState(new Date())
  const excelDate = format(date, 'yyyy-MM-dd HH:mm:ss')
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false)
  const [error, setErrorObj] = useState<{ error: string; message: string[] }>()
  const [showTransferDialog, setShowTransferDialog] = useState(false)
  const [commitId, setCommitId] = useState('')
  const [commitTotal, setCommitTotal] = useState('')
  const [transferAmount, setTransferAmount] = useState(0)
  const [distributionType, setDistributionType] = useState('')

  const { data: sellPoktBalances, isLoading: dataLoading } = useQuery(
    'admin-sell/balances',
    () =>
      axios
        .get('admin-sell/balances', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((res) => res.data),
    {
      enabled: !!accessToken,
    }
  )

  const {
    data: sellCommmitsData,
    isLoading: commitsLoading,
    refetch: refetchCommits,
    isRefetching: refetchingCommits,
  } = useQuery(
    'admin-sell/commits',
    () =>
      axios
        .get('admin-sell/commits', {
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
    return sellCommmitsData && sellCommmitsData.length
      ? sellCommmitsData
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
  }, [sellCommmitsData])

  const getDistributionType = (stake_percent: string) => {
    switch (stake_percent) {
      case '1.00':
        return 'Stake'
      case '0.50':
        return '50 / 50'
      case '0.00':
        return 'Send'
      default:
        return `${Number(stake_percent) * 100}% Stake`
    }
  }

  const { mutate: submitReject } = useMutation(
    ({ sale_commit_id }: { sale_commit_id: string }) =>
      axios.post(
        `admin-sell/reject-commit`,
        {
          sale_commit_id,
        },
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

        if (data?.error) {
          setShowError(true)
          setErrorObj(data)
        } else {
          setShowSuccess(true)
          setShowError(false)
          refetchCommits()
        }
      },
      onError: (error: any) => {
        setShowError(true)
        setErrorObj(error?.response?.data)
      },
    }
  )

  const { mutate: submitProcessCommit } = useMutation(
    ({ sale_commit_id, amount }: { sale_commit_id: number; amount: number }) =>
      axios.post(
        `admin-sell/process-commit`,
        {
          sale_commit_id,
          amount,
        },
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

        if (data?.error) {
          setShowError(true)
          setErrorObj(data)
        } else {
          setShowSuccess(true)
          setShowError(false)
          refetchCommits()
        }
      },
      onError: (error: any) => {
        setShowError(true)
        setErrorObj(error?.response?.data)
      },
    }
  )

  if (status === 'unauthenticated') signIn()

  useEffect(() => {
    const session: any = sessionData

    if (session?.permissions && !session?.permissions?.includes(12)) {
      router.push('manage/dashboard')
    }
  }, [sessionData, router])

  return (
    <>
      {showError && (
        <Stack className="mb-8 mt-8">
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
                  {error.message?.map((message, i: number) => (
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
      {showSuccess && (
        <Alert
          className="mt-8"
          severity="success"
          onClose={() => setShowSuccess(false)}
        >
          <AlertTitle>Success</AlertTitle>
          Your request has been submitted successfully!
        </Alert>
      )}
      <div className="my-4 flex justify-between">
        <Typography className="text-xl">Sell POKT</Typography>
      </div>
      <div className="grid gap-4 grid-cols-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="my-0">POKT to Sell</p>
          <h2 className="my-0">
            {sellPoktBalances?.available &&
              currency(sellPoktBalances?.available, {
                precision: 0,
                symbol: '',
              }).format()}
          </h2>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="my-0">POKT Sold</p>
          <h2 className="my-0">
            {sellPoktBalances?.sold &&
              currency(sellPoktBalances?.sold, {
                precision: 0,
                symbol: '',
              }).format()}
          </h2>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="my-0">Pending POKT</p>
          <h2 className="my-0">
            {sellPoktBalances?.pending &&
              currency(sellPoktBalances?.pending, {
                precision: 0,
                symbol: '',
              }).format()}
          </h2>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="my-0">Balance</p>
          <h2 className="my-0">
            {sellPoktBalances?.current_balance &&
              currency(sellPoktBalances?.current_balance, {
                precision: 0,
                symbol: '',
              }).format()}
          </h2>
        </div>
      </div>
      <section className="mt-16">
        <div className="flex justify-between items-center">
          <h3>Purchase Commitments</h3>
          <div>
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
        <Box sx={{ overflow: 'auto' }}>
          <Box sx={{ width: '100%', display: 'table', tableLayout: 'fixed' }}>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                  <TableRow className="bg-brand-blue-dark text-white">
                    <TableCell className="text-white" align="center">
                      Username
                    </TableCell>
                    <TableCell className="text-white" align="center">
                      Commit Time
                    </TableCell>
                    <TableCell className="text-white" align="center">
                      Status
                    </TableCell>
                    <TableCell className="text-white" align="center">
                      POKT Purchased
                    </TableCell>
                    <TableCell className="text-white" align="center">
                      Spot Price
                    </TableCell>
                    <TableCell className="text-white" align="center">
                      Total Price
                    </TableCell>
                    <TableCell className="text-white" align="center">
                      Wallet Address
                    </TableCell>
                    <TableCell className="text-white" align="center">
                      Distribution
                      <br />
                      Type
                    </TableCell>
                    <TableCell className="text-white" align="center">
                      Payment
                      <br /> Currency
                    </TableCell>
                    <TableCell className="text-white" align="center">
                      Payment
                      <br /> Transaction Hash
                    </TableCell>
                    <TableCell className="text-white" align="center">
                      POKT
                      <br /> Transaction Hash
                    </TableCell>
                    <TableCell className="text-white" align="center">
                      Stake Tx ID
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sellCommmitsData &&
                    sellCommmitsData.length &&
                    sellCommmitsData
                      .sort(
                        (a: any, b: any) =>
                          getUnixTime(new Date(b.txn_timestamp)) -
                          getUnixTime(new Date(a.txn_timestamp))
                      )
                      .map((commit: any, i: number) => (
                        <TableRow
                          key={i}
                          sx={{
                            '&:last-child td, &:last-child th': { border: 0 },
                          }}
                        >
                          <TableCell align="center">
                            <Box
                              className="cursor-pointer text-brand-blue-dark"
                              onClick={() => {
                                setCommitId(commit?.sale_commit_id)
                                setCommitTotal(commit?.commit_total)
                                setTransferAmount(commit?.token_amount)
                                setDistributionType(commit?.stake_percent)
                                setShowTransferDialog(true)
                              }}
                            >
                              {commit?.username}
                            </Box>
                          </TableCell>

                          <TableCell align="center">
                            {commit?.sale_commit_status}
                          </TableCell>
                          <TableCell align="center">
                            {commit?.token_amount &&
                              currency(commit?.token_amount, {
                                precision: 0,
                                symbol: '',
                              }).format()}
                          </TableCell>
                          <TableCell align="center">
                            $
                            {commit?.token_price &&
                              Number(commit?.token_price).toFixed(6)}
                          </TableCell>
                          <TableCell align="center">
                            {commit?.commit_total &&
                              currency(commit?.commit_total, {
                                precision: 2,
                              }).format()}
                          </TableCell>
                          <TableCell align="center">
                            {commit?.commit_exp_timestamp &&
                              format(
                                formatUTCDate(commit?.commit_exp_timestamp),
                                'yyyy-MM-dd HH:mm:ss'
                              )}
                          </TableCell>
                          <TableCell align="center">
                            {commit?.recpt_wallet_address}
                          </TableCell>
                          <TableCell align="center">
                            {getDistributionType(commit?.stake_percent)}
                          </TableCell>
                          <TableCell align="center">
                            {commit?.payment_currency_code &&
                            commit?.payment_currency_code === 4
                              ? 'USDC'
                              : 'USDT'}
                          </TableCell>
                          <TableCell align="center">
                            {commit?.payment_txn_hash}
                          </TableCell>
                          <TableCell align="center">
                            {commit?.distribution_txn_hash}
                          </TableCell>
                          <TableCell align="center">
                            {commit?.distribution_wallet_txn_id}
                          </TableCell>
                          <TableCell>
                            {commit?.sale_commit_status == 'Pending' && (
                              <Button
                                variant="contained"
                                disabled={refetchingCommits}
                                onClick={() =>
                                  submitReject({
                                    sale_commit_id: commit?.sale_commit_id,
                                  })
                                }
                              >
                                Reject
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
      </section>

      <Dialog
        open={showTransferDialog}
        onClose={() => setShowTransferDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="md"
      >
        <DialogContent className="w-full md:w-[500px]">
          <TextField
            className="w-full my-8"
            disabled
            value={
              commitTotal &&
              currency(commitTotal, {
                precision: 2,
              }).format()
            }
            label="Amount of USDC/USDT"
          />
          <TextField
            className="w-full"
            label="Estimated POKT Amout"
            disabled
            value={
              transferAmount &&
              currency(transferAmount, {
                precision: 0,
                symbol: '',
              }).format()
            }
          />
        </DialogContent>
        <DialogActions>
          <Button
            className="capitalize bg-transparent text-black"
            onClick={() => {
              setShowTransferDialog(false)
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            className="capitalize"
            disabled={
              distributionType === '1.00' || distributionType === '0.00'
            }
            onClick={() => {
              setShowTransferDialog(false)
              submitProcessCommit({
                sale_commit_id: Number(commitId),
                amount: Math.floor(Number(transferAmount)),
              })
            }}
            autoFocus
          >
            Transfer
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

import { useState, useMemo, useEffect } from 'react'
import {
  Stack,
  Alert,
  AlertTitle,
  Divider,
  Box,
  Select,
  TextField,
  MenuItem,
  FormControl,
  RadioGroup,
  Radio,
  FormControlLabel,
  Checkbox,
  Button,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
} from '@mui/material'
import { useSession, signIn } from 'next-auth/react'
import { useQuery, useMutation } from 'react-query'
import { FieldValues, useForm } from 'react-hook-form'
import axios from 'axios'
import currency from 'currency.js'
import { format, getUnixTime } from 'date-fns'
import { ClipboardCopyIcon } from '@heroicons/react/solid'
import { CSVLink } from 'react-csv'
import { formatUTCDate } from '../../../utils/time'
import copyToClipboard from '../../../copyToClipboard'
import PageLayout from '../../../../components/PageLayout'
import useAccessToken from '../../../../hooks/useAccessToken'
import useCustomerId from '../../../../hooks/useCustomerId'

const customSelectStyle = {
  maxHeight: 300,
}

const poktpoolWallet = 'c46fd195948d7c5c19b8f3c69ad69cfa4f6a7cb9'

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

const BUY_POKT_DIVIDER: number = Number(process.env.BUY_POKT_DIVIDER)

export const BuyPOKT = () => {
  const { status } = useSession()
  const accessToken = useAccessToken()
  const { customerId } = useCustomerId()
  const { handleSubmit, register, setValue } = useForm()
  const [amountToBuy, setAmountToBuy] = useState('')
  const [sailCommitId, setSailCommitId] = useState('')
  const [currencyCode, setCurrencyCode] = useState(4)
  const [showDialog, setShowDialog] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [txHash, setTxHash] = useState('')
  const [date, setDate] = useState(new Date())
  const excelDate = format(date, 'yyyy-MM-dd HH:mm:ss')
  const [error, setErrorObj] = useState<{ error: string; message: string[] }>()
  const [userWallet, setUserWallet] = useState<string>('')

  const { data: poktAvailable } = useQuery('buy/pokt-available', () =>
    axios.get(`buy/pokt-available`).then((res) => res.data)
  )

  const { data: poktPrice, refetch: refetchPoktPrice } = useQuery(
    'buy/pokt-price',
    () => axios.get(`buy/pokt-price`).then((res) => res.data)
  )

  const { data: commitHistory, refetch } = useQuery(
    'member/buy/commit-history',
    () =>
      axios
        .get(`buy/commit-history?customerId=${customerId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((res) => res.data),
    {
      enabled: !!accessToken && !!customerId,
    }
  )

  const {
    data: walletsData,
    refetch: refetchWallets,
    isFetching,
  } = useQuery(
    'Member/WalletsData',
    () =>
      axios
        .get(`wallet/list`, {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        })
        .then((res) => res.data),
    { enabled: !!accessToken }
  )

  const getAmountList = () => {
    let amountList = []

    for (let i = 1; i <= poktAvailable?.amount / BUY_POKT_DIVIDER; i++) {
      amountList.push(BUY_POKT_DIVIDER * i)
    }

    return amountList
  }

  const getTotalPrice = () => {
    let rateFixed = ''
    if (poktPrice && amountToBuy)
      rateFixed = Number(poktPrice?.xe_rate).toFixed(6)
    return Number(rateFixed) * Number(amountToBuy)
  }

  const formattedData = useMemo(() => {
    return commitHistory && commitHistory.length
      ? commitHistory
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
  }, [commitHistory])

  const onSubmit = ({
    stakePercent,
    tokenAmount,
    discord,
    email,
  }: FieldValues) => {
    commitToBuy({
      xe_rate_id: poktPrice?.xe_rate_id,
      token_amount: tokenAmount,
      stake_percent: Number(stakePercent),
      discord_handle: discord,
      telegram_handle: email,
    })
  }

  const { mutate: commitToBuy } = useMutation(
    ({
      xe_rate_id,
      token_amount,
      stake_percent,
      discord_handle,
      telegram_handle,
    }: {
      xe_rate_id: string
      token_amount: number
      stake_percent: number
      discord_handle: string
      telegram_handle: string
    }) =>
      axios.post(
        `buy/commit?customerId=${customerId}`,
        {
          xe_rate_id,
          token_amount,
          stake_percent,
          discord_handle,
          telegram_handle,
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
          setSailCommitId(data?.sale_commit_id)
          setShowDialog(true)
        }
      },
      onError: (error: any) => {
        setShowError(true)
        setErrorObj(error?.response?.data)
      },
    }
  )

  const { mutate: submitTx } = useMutation(
    ({
      sale_commit_id,
      payment_currency_code,
      payment_txn_hash,
    }: {
      sale_commit_id: number
      payment_currency_code: number
      payment_txn_hash: string
    }) =>
      axios.post(
        `buy/submit-payment?customerId=${customerId}`,
        {
          sale_commit_id,
          payment_currency_code,
          payment_txn_hash,
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
          refetch()
        }
      },
      onError: (error: any) => {
        setShowError(true)
        setErrorObj(error?.response?.data)
      },
    }
  )

  const handleSubmitTx = () => {
    setShowDialog(false)
    submitTx({
      sale_commit_id: Number(sailCommitId),
      payment_currency_code: currencyCode,
      payment_txn_hash: txHash,
    })
  }

  const isLoggedin = status === 'authenticated'

  useEffect(() => {
    if (walletsData?.active)
      setUserWallet(
        walletsData?.active.filter(
          (item: any) => item.customer_id === customerId
        )?.[0]?.p_wallet_id
      )
  }, [walletsData, customerId])

  useEffect(() => {
    setValue('stakePercent', 1)
  }, [])

  useEffect(() => {
    let interval = setInterval(() => {
      refetchPoktPrice()
    }, 1000 * 30)

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [])

  return (
    <PageLayout>
      <section className={`max-w-5xl mb-8 `}>
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
        <header>
          <h1 className="text-4xl">Buy POKT</h1>
          <Alert
            severity="info"
            className="rounded-md info-alert-style text-brand-blue-dark"
          >
            To purchase POKT you must complete KYC and have a verified wallet
            with poktpool. You may choose to send the POKT to your account in
            the pool or to an external verified wallet.
          </Alert>
        </header>
        <Divider className="my-10" />
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex">
            <div className="w-1/2">
              <p className="text-2xl font-bold my-0">
                POKT Available:
                <span className="font-normal ml-8">
                  {poktAvailable?.amount &&
                    currency(poktAvailable?.amount, {
                      precision: 0,
                      symbol: '',
                    }).format()}
                </span>
              </p>
            </div>
            <div className="w-1/2">
              <p className="text-2xl font-bold my-0">
                Current Price:{' '}
                <span className="font-normal ml-8">
                  {poktPrice?.xe_rate &&
                    currency(poktPrice?.xe_rate, {
                      precision: 6,
                    }).format()}
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center my-8">
            <div className="w-1/2">
              <div className="flex gap-2 items-center">
                <p className="text-2xl font-bold my-0">Amount to Buy:</p>
                <Box className="w-48 ml-6">
                  <FormControl fullWidth size="medium">
                    <Select
                      className="bg-white"
                      labelId="demo-select-small"
                      id="vendorId"
                      MenuProps={{ style: customSelectStyle }}
                      value={amountToBuy}
                      displayEmpty
                      disabled={!isLoggedin}
                      {...register('tokenAmount', {
                        required: true,
                      })}
                      onChange={(e) => setAmountToBuy(e.target.value)}
                    >
                      {getAmountList().map((list) => (
                        <MenuItem key={list} value={list}>
                          {list}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </div>
            </div>
            <div className="w-1/2">
              <p className="text-2xl font-bold my-0">
                Total:{' '}
                <span className="font-normal">
                  {getTotalPrice() &&
                    currency(getTotalPrice(), {
                      precision: 2,
                    }).format()}
                </span>
              </p>
            </div>
          </div>
          <div className="flex my-4 gap-4">
            <p className="text-2xl font-bold my-0">Distribution Method:</p>
            <div className="ml-8">
              <FormControl>
                <RadioGroup
                  aria-labelledby="demo-controlled-radio-buttons-group"
                  defaultValue={1}
                  {...register('stakePercent', {
                    required: true,
                  })}
                >
                  <FormControlLabel
                    value={1}
                    control={<Radio />}
                    disabled={!isLoggedin}
                    label="Stake in poktpool"
                  />
                  <FormControlLabel
                    value={0}
                    control={<Radio />}
                    disabled={!isLoggedin}
                    label="Send to Wallet"
                  />
                  <FormControlLabel
                    value={0.5}
                    control={<Radio />}
                    disabled={!isLoggedin}
                    label="50% Stake / 50% Send"
                  />
                </RadioGroup>
              </FormControl>
            </div>
          </div>
          <div className="flex my-8 gap-8 items-center">
            <p className="text-2xl shrink-0 font-bold my-0">
              Distribution Wallet:
            </p>
            <TextField
              type="text"
              label="Wallet Address"
              fullWidth
              value={userWallet}
              disabled
            />
          </div>
          <div className="flex my-8 gap-8 items-center">
            <p className="text-2xl shrink-0 font-bold my-0">
              Contact Info (optional):
            </p>
            <div className="flex w-full justify-between gap-4">
              <TextField
                type="text"
                label="Discord"
                fullWidth
                disabled={!isLoggedin}
                {...register('discord')}
              />
              <TextField
                type="text"
                label="Email"
                fullWidth
                disabled={!isLoggedin}
                {...register('email')}
              />
            </div>
          </div>
          <Divider className="mt-10 mb-6" />
          <div className="flex items-start">
            <Checkbox disabled={!isLoggedin} />
            <p className="my-0 pt-2">
              By selecting Commit to Buy, you are agreeing to pay the amount
              above in either USDC or USDT in exchange for the amount of POKT
              selected. Your payment must be received and the transaction hash
              submitted within 2 hours of committing to buy or the transaction
              will expire. The payment must be made in one transaction. Repeated
              failure to fulfill your commitments to buy may result in being
              denied future access to this feature.
            </p>
          </div>
          <Button
            variant="contained"
            size="large"
            className="mt-4"
            disabled={!isLoggedin}
            type="submit"
          >
            Commit to Buy
          </Button>
        </form>
      </section>

      {isLoggedin && (
        <section className="mt-24">
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
                        Transfer
                        <br /> Complete
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {commitHistory &&
                      commitHistory.length &&
                      commitHistory
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
                              {commit?.commit_exp_timestamp &&
                                format(
                                  formatUTCDate(commit?.commit_exp_timestamp),
                                  'yyyy-MM-dd HH:mm:ss'
                                )}
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
                              {commit?.recpt_wallet_address}
                            </TableCell>
                            <TableCell align="center">
                              {commit?.txn_type_code}
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
                              {commit?.sale_commit_status === 'Complete' &&
                                'Complete'}
                            </TableCell>
                          </TableRow>
                        ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Box>
        </section>
      )}

      <Dialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="md"
      >
        <DialogTitle id="alert-dialog-title">
          Which currency will you use?
        </DialogTitle>
        <DialogContent className="w-full md:w-[500px]">
          <FormControl>
            <RadioGroup
              className="inline-block"
              aria-labelledby="demo-controlled-radio-buttons-group"
              name="controlled-radio-buttons-group"
              defaultValue="4"
              onChange={(e) => setCurrencyCode(Number(e.target.value))}
            >
              <FormControlLabel value="4" control={<Radio />} label="USDC" />
              <FormControlLabel
                className="ml-6"
                value="5"
                control={<Radio />}
                label="USDT"
              />
            </RadioGroup>
          </FormControl>
          <TextField
            className="w-full my-4"
            disabled
            InputProps={{
              endAdornment: (
                <InputAdornment
                  position="end"
                  onClick={() => {
                    setIsCopied(true)
                    copyToClipboard(poktpoolWallet)
                  }}
                >
                  {isCopied ? (
                    <span>Copied</span>
                  ) : (
                    <ClipboardCopyIcon className="cursor-pointer w-5 h-5" />
                  )}
                </InputAdornment>
              ),
            }}
            label="poktpool Wallet"
            value={poktpoolWallet}
          />
          <TextField
            className="w-full"
            label="Transaction Hash"
            value={txHash}
            onChange={(e) => setTxHash(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button
            className="capitalize bg-transparent text-black"
            onClick={() => {
              setShowDialog(false)
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            className="capitalize"
            onClick={handleSubmitTx}
            autoFocus
          >
            Submit Transaction
          </Button>
        </DialogActions>
      </Dialog>
    </PageLayout>
  )
}

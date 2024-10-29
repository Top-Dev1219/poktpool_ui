import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/router'
import { signIn, useSession } from 'next-auth/react'
import {
  Alert,
  AlertTitle,
  Button,
  ButtonGroup,
  CircularProgress,
  Stack,
  TextField,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
} from '@mui/material'
import { FieldValues, useForm } from 'react-hook-form'
import { useMutation, useQuery } from 'react-query'
import { format, getUnixTime, parseISO } from 'date-fns'
import axios from 'axios'
import { sanitize } from 'dompurify'
import { CSVLink } from 'react-csv'
import currency from 'currency.js'
import { formatUTCDate } from '../../src/utils/time'
import UnstakesTable from '../../components/UnstakesTable'
import useAccessToken from '../../hooks/useAccessToken'
import { useAuthQuery } from '../../hooks/useApi'
import useUser from '../../hooks/useUser'
import useCustomerId from '../../hooks/useCustomerId'

interface UnstakePayload {
  primaryWalletId: string
  twoFactorCode?: string
  oneTimeCode?: string
  unstakingPercent?: number
  unstakingAmount?: number
}

export type Unstake = {
  amt_unstaked: string
  currency_code: number
  customer_id: string
  perc_unstake: string
  txn_pokt_amount: null
  txn_type_code: number
  unstake_cancelled: boolean
  unstake_complete: boolean
  unstake_due_date: null
  unstake_pokt_amount: string
  unstake_process_date: null
  unstake_req_date: string
  unstake_req_id: number
} & {
  txns?: {
    network_txn_id: string
    pokt_amount: number
  }[]
}

const headers = [
  { label: 'Request Date', key: 'unstake_req_date' },
  { label: 'Status', key: 'unstake_status' },
  { label: 'Due Date', key: 'unstake_due_date' },
  { label: 'Transaction ID', key: 'tx_id' },
  { label: 'Amount', key: 'pokt_amount' },
  { label: 'Percent', key: 'percent' },
]

export default function Unstake() {
  const { status } = useSession()
  const router = useRouter()
  const { customerId, user } = useCustomerId()
  const accessToken = useAccessToken()
  const { clearErrors, setValue, handleSubmit, register, watch } = useForm()
  const [error, setErrorObj] = useState<{ error: string; message: string[] }>()
  const [success, setSuccessObj] = useState<{ status: string }>()
  const [showError, setShowError] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showCancelSuccess, setShowCancelSuccess] = useState(false)
  const [unstakePayload, setUnstakePayload] = useState<UnstakePayload>({
    primaryWalletId: '',
    unstakingAmount: 0,
  })
  const [modalOpen, setModalOpen] = useState(false)
  const [openSurvey, setOpenSurvey] = useState(false)
  const [date, setDate] = useState(new Date())
  const excelDate = format(date, 'yyyy-MM-dd HH:mm:ss')
  const [fullUnstake, setFullUnstake] = useState(false)

  const {
    data,
    isLoading: isUnstakesLoading,
    refetch: refetchUnstakes,
  } = useAuthQuery(
    `withdraw/unstakes?customerId=${customerId}`,
    {},
    { enabled: !!customerId }
  )

  const handleRequestUnstake = () => {
    if (user?.isTwoFactorEnabled) {
      setModalOpen(true)
    } else {
      requestOTPCode()
    }
  }

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const unstakeType = event.target.value

    switch (unstakeType) {
      case 'amountUnstake':
        setFullUnstake(false)
        setUnstakePayload({
          primaryWalletId: unstakePayload.primaryWalletId,
          unstakingAmount: 0,
        })
        break
      case 'fullUnstake':
        setFullUnstake(true)
        setUnstakePayload({
          primaryWalletId: unstakePayload.primaryWalletId,
          unstakingPercent: 100,
        })
        break
      default:
        break
    }
  }

  const {
    data: userBalance,
    isLoading: isBalanceLoading,
    isRefetching: isBalanceRefetching,
    refetch: refetchUserBalance,
  } = useQuery(
    'userBalance',
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

  const { mutate: requestOTPCode, isLoading: sendingOTPCode } = useMutation(
    () =>
      axios.post(
        `withdraw/request-unstake-code?customerId=${customerId}`,
        {},
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

        setModalOpen(true)
      },
    }
  )

  const { mutate: cancelUnstake } = useMutation(
    ({ unstake_req_id }: { unstake_req_id: number }) =>
      axios.post(
        `withdraw/cancel-unstake?customerId=${customerId}`,
        { unstake_req_id },
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
          setShowCancelSuccess(true)
          setShowError(false)
          setSuccessObj(data)
          refetchUnstakes()
        }
      },
    }
  )

  const unstakes = useMemo(() => {
    if (data) {
      return data.sort(
        (a: Unstake, b: Unstake) =>
          getUnixTime(new Date(b?.unstake_req_date)) -
          getUnixTime(new Date(a?.unstake_req_date))
      ) as Unstake[]
    } else {
      return []
    }
  }, [data])

  const selectedPercent = watch('unstakingPercent')

  const { mutate: submitUnstake } = useMutation(
    (unstakePayload: UnstakePayload) =>
      axios.post(
        `withdraw/unstake?customerId=${customerId}`,
        { ...unstakePayload },
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
          setSuccessObj(data)
          refetchUnstakes()
          // trigger the survey here
          setOpenSurvey(true)
        }
      },
      onError: (error: any) => {
        setShowError(true)
        setErrorObj(error?.response?.data)
      },
    }
  )

  const userDataQuery = useQuery(
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

  const handleConfirmUnstake = (unstakePayload: UnstakePayload) => {
    submitUnstake(unstakePayload)
    setModalOpen(false)
  }

  if (status === 'unauthenticated') signIn()

  const onSubmit = ({
    oneTimeCode,
    primaryWalletId,
    unstakingPercent,
  }: FieldValues) => {
    submitUnstake({
      oneTimeCode: sanitize(oneTimeCode),
      primaryWalletId: sanitize(primaryWalletId),
      unstakingPercent: +unstakingPercent,
    })
  }

  const unstakeStatus = (
    unstake_cancelled: boolean,
    unstake_complete: boolean
  ) => {
    switch (true) {
      case !unstake_cancelled && !unstake_complete:
        return 'pending'
      case unstake_cancelled && unstake_complete:
        return 'cancelled'
      case !unstake_cancelled && unstake_complete:
        return 'complete'
      default:
        return ''
    }
  }

  const formattedData = useMemo(() => {
    return unstakes && unstakes.length
      ? unstakes.map((item: any) => {
          return {
            ...item,
            unstake_req_date:
              item?.unstake_req_date &&
              format(formatUTCDate(item?.unstake_req_date), 'yyyy-MM-dd HH:mm'),
            unstake_status: unstakeStatus(
              item?.unstake_cancelled,
              item?.unstake_complete
            ),
            unstake_due_date:
              item?.unstake_due_date &&
              format(parseISO(item?.unstake_due_date), 'yyyy-MM-dd'),
            tx_id: item?.txns[0]?.network_txn_id,
            pokt_amount:
              item?.unstake_pokt_amount && item?.unstake_process_date
                ? currency(item?.unstake_pokt_amount).format({
                    symbol: '',
                  })
                : 'Not Available Yet',
            percent: `${+item?.perc_unstake * 100}%`,
          }
        })
      : []
  }, [unstakes])

  useEffect(() => {
    setValue(
      'unstakingAmount',
      userDataQuery?.data?.staked_amount * (selectedPercent / 100)
    )
  }, [selectedPercent, setValue, userDataQuery?.data?.staked_amount])

  useEffect(() => {
    if (user?.customerIds?.length === 0) router.push('/account/wallets')
  }, [user])

  useEffect(() => {
    setUnstakePayload({
      ...unstakePayload,
      primaryWalletId: userDataQuery?.data?.wallet_address,
    })
  }, [userDataQuery?.data?.wallet_address])

  return (
    <>
      <section className="container mb-16 px-4">
        <header className="max-w-4xl mb-8">
          <h1 className="text-4xl">Unstake</h1>
          <Alert
            severity="info"
            className="rounded-md info-alert-style text-brand-blue-dark"
          >
            Note that 0.01 POKT will be taken from any outgoing sweep or unstake
            transactions to cover gas fees.
          </Alert>
        </header>
        {showSuccess && (
          <Stack className="mb-8">
            <Alert severity="success" onClose={() => setShowSuccess(false)}>
              <AlertTitle>
                {success?.status || 'Unstake request successful!'}
              </AlertTitle>
            </Alert>
          </Stack>
        )}
        {showCancelSuccess && (
          <Stack className="mb-8">
            <Alert
              severity="info"
              className="info-alert-style text-brand-blue-dark"
              onClose={() => setShowCancelSuccess(false)}
            >
              <AlertTitle>
                {success?.status || 'Unstake request cancelled!'}
              </AlertTitle>
            </Alert>
          </Stack>
        )}
        {showError && (
          <Stack className="mb-8">
            {error?.error && (
              <Alert
                onClose={() => {
                  clearErrors()
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
        <form className="prose" onSubmit={handleSubmit(onSubmit)}>
          <p>
            By clicking the Unstake button you are unstaking some or all of your
            staked POKT from the pool. This action will trigger the 21-day
            cooldown period. Once the 21-days has passed, you will receive your
            unstaked POKT in the wallet associated with your account.
          </p>
          <div className="flex items-baseline my-8">
            <p className="m-0 pb-1">Staked Balance: </p>
            <h2 className="m-0 ml-4 heading-number-tag">
              {isBalanceLoading || isBalanceRefetching ? (
                <CircularProgress />
              ) : (
                currency(userBalance?.staked_amount, {
                  symbol: '',
                  precision: 2,
                }).format()
              )}
            </h2>
          </div>
          <div className="grid gap-8 mb-8">
            <TextField
              label="POKT Wallet Address"
              type="text"
              disabled
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              value={userDataQuery?.data?.wallet_address}
            />

            <div>
              <p className="mt-0">Select how you want to unstake.</p>
              <div>
                <FormControl>
                  <RadioGroup
                    className="inline-block"
                    aria-labelledby="demo-controlled-radio-buttons-group"
                    name="controlled-radio-buttons-group"
                    defaultValue="amountUnstake"
                    onChange={handleRadioChange}
                  >
                    <FormControlLabel
                      value="amountUnstake"
                      control={<Radio />}
                      label="Stake by amount"
                    />
                    <FormControlLabel
                      className="ml-6"
                      value="fullUnstake"
                      control={<Radio />}
                      label="Full unstake (100%)"
                    />
                  </RadioGroup>
                </FormControl>
              </div>
              {!fullUnstake && (
                <TextField
                  id="outlined-number"
                  label="POKT Amount"
                  type="number"
                  className="mt-8"
                  helperText="Please enter the amount in POKT."
                  onChange={(e) =>
                    setUnstakePayload({
                      ...unstakePayload,
                      unstakingAmount: Number(e.target.value),
                    })
                  }
                />
              )}
            </div>
          </div>
          <div className="inline-grid grid-flow-col gap-2">
            <Button
              variant="contained"
              disabled={unstakePayload.unstakingAmount === 0 || sendingOTPCode}
              onClick={handleRequestUnstake}
            >
              Unstake
            </Button>
          </div>
        </form>
      </section>
      <section>
        <div className="flex justify-between items-center">
          <h2 className="text-xl">Unstake History</h2>
          <div>
            <CSVLink
              data={formattedData}
              filename={`unstake-history-${excelDate}.csv`}
              className="btn bg-brand-blue-dark text-white py-3 px-4 rounded"
              target="_blank"
              headers={headers}
              onClick={() => setDate(new Date())}
            >
              Download CSV
            </CSVLink>
          </div>
        </div>
        {isUnstakesLoading ? (
          <div className="w-full text-center py-4">
            <CircularProgress />
          </div>
        ) : (
          <UnstakesTable
            onCancelUnstake={(payload) => {
              cancelUnstake({ unstake_req_id: payload })
            }}
            data={unstakes}
          />
        )}
      </section>
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Confirm your unstake request
        </DialogTitle>
        <DialogContent>
          {user?.isTwoFactorEnabled ? (
            <>
              <p className="mt-0 mb-8">
                Please enter your two factor authentication code.
              </p>
              <TextField
                id="outlined-password-input"
                label="Two Factor Code"
                type="text"
                fullWidth
                onChange={(e) =>
                  setUnstakePayload({
                    ...unstakePayload,
                    twoFactorCode: e.target.value,
                  })
                }
              />
            </>
          ) : (
            <>
              <p className="mt-0 mb-8">
                Please enter your one time passcode from your email.
              </p>
              <TextField
                id="outlined-password-input"
                label="One Time Passcode"
                type="text"
                fullWidth
                onChange={(e) =>
                  setUnstakePayload({
                    ...unstakePayload,
                    oneTimeCode: e.target.value,
                  })
                }
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)} autoFocus>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => handleConfirmUnstake(unstakePayload)}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openSurvey}
        onClose={() => setOpenSurvey(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogContent>
          <iframe
            src="https://us1.zonka.co/h7WN8h?zf_embed=1&zf_embedintrooff=0&zf_embedheaderoff=1&zf_embedfooteroff=0&zf_embednavigation=0"
            width="100%"
            height="500px"
            frameBorder="0"
          >
            Loading…
          </iframe>
          <div className="flex justify-end">
            <Button onClick={() => setOpenSurvey(false)} autoFocus>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

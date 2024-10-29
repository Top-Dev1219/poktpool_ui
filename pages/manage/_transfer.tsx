import { ChangeEvent, useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/router'
import { signIn, useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery } from 'react-query'
import {
  Alert,
  AlertTitle,
  Button,
  IconButton,
  CircularProgress,
  Stack,
  TextField,
  InputAdornment,
  Box,
  Radio,
  RadioGroup,
  FormControl,
  FormControlLabel,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material'
import currency from 'currency.js'
import { CSVLink } from 'react-csv'
import { ClipboardCopyIcon } from '@heroicons/react/solid'
import DeleteIcon from '@mui/icons-material/Delete'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { format } from 'date-fns'
import axios from 'axios'
import { sanitize } from 'dompurify'
import useAccessToken from '../../hooks/useAccessToken'
import { ReportTable, HeadCell } from '../../components/ReportTable'
import { formatUTCDate } from '../../src/utils/time'
import copyToClipboard from '../../src/copyToClipboard'
import useCustomerId from '../../hooks/useCustomerId'
import useUser from '../../hooks/useUser'

interface RecepientTypes {
  customer_id: string
  to_customer_id: string
  amount: string | number
  memo: string
}
interface TransferPayloadTypes {
  twoFactorCode?: string
  oneTimeCode?: string
  balance_type: string
  list: RecepientTypes[]
}

const headCells: readonly HeadCell[] = [
  {
    id: 'transfer_timestamp',
    numeric: true,
    disablePadding: true,
    label: 'Date & Time',
  },
  {
    id: 'direction',
    numeric: true,
    disablePadding: false,
    label: 'In/Out',
  },
  {
    id: 'to_wallet_id',
    numeric: true,
    disablePadding: false,
    label: 'Wallet ID',
  },
  {
    id: 'memo',
    numeric: true,
    disablePadding: false,
    label: 'Memo',
  },
  {
    id: 'pokt_amount',
    numeric: false,
    disablePadding: false,
    label: 'POKT Amount',
  },
]

let deleteItem: number = 0

const headers = [
  { label: 'Date & Time', key: 'transfer_timestamp' },
  { label: 'Direction', key: 'direction' },
  { label: 'Wallet ID', key: 'to_wallet_id' },
  { label: 'Memo', key: 'memo' },
  { label: 'POKT Amount', key: 'pokt_amount' },
]

export default function Transfer() {
  const { status } = useSession()
  const accessToken = useAccessToken()
  const { user } = useUser()
  const router = useRouter()
  const { clearErrors, handleSubmit } = useForm()
  const [error, setErrorObj] = useState<{ error: string; message: string[] }>()
  const [success, setSuccessObj] = useState<{ status: string }>()
  const [transferError, setTransferError] = useState(false)
  const [showAddressError, setShowAddressError] = useState<number[]>([])
  const [showSuccess, setShowSuccess] = useState(false)
  const [amountError, setAmountError] = useState<number[]>([])
  const [isCopied, setIsCopied] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [isValidate, setIsValidate] = useState<number[]>([])
  const [isOverAmount, setIsOverAmount] = useState(false)
  const theme = useTheme()
  const matches = useMediaQuery(theme.breakpoints.up('sm'))
  const [date, setDate] = useState(new Date())
  const excelDate = format(date, 'yyyy-MM-dd HH:mm:ss')

  const { customerId } = useCustomerId()

  const [recepient, setRecepient] = useState<RecepientTypes[]>([
    {
      customer_id: '',
      to_customer_id: '',
      amount: '',
      memo: '',
    },
  ])

  const [transferPayload, setTransferPayload] = useState<TransferPayloadTypes>({
    balance_type: 'Staked',
    list: [],
  })

  const {
    data: transferTransactions,
    isLoading: isTransfersLoading,
    isRefetching: isTransferRefetching,
    dataUpdatedAt,
    refetch: refetchTransfers,
  } = useQuery(
    'transferTransactions',
    () =>
      axios
        .get(`stake/transfers?customerId=${customerId}`, {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        })
        .then((res) => res.data),
    { enabled: !!accessToken && !!customerId }
  )

  const { mutate: requestOTPCode } = useMutation(
    () =>
      axios.post(
        `stake/request-transfer-code?customerId=${customerId}`,
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

        setIsConfirmModalOpen(true)
      },
    }
  )

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

  const { mutate: submitTransfer } = useMutation(
    (transferPayload: TransferPayloadTypes) =>
      axios
        .post(
          `stake/transfer?customerId=${customerId}`,
          { ...transferPayload },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        )
        .then((res) => {
          setShowSuccess(true)
          setTransferError(false)
          refetchTransfers()
          refetchUserBalance()
        })
        .catch((e) => {
          setErrorObj(e?.response?.data)
          setTransferError(true)
          setShowSuccess(false)
        })
  )

  if (status === 'unauthenticated') signIn()

  const transactionData = useMemo(() => {
    return transferTransactions && transferTransactions.length
      ? transferTransactions.map((item: any) => {
          return {
            ...item,
            transfer_timestamp: format(
              formatUTCDate(item.transfer_timestamp),
              'yyyy-MM-dd HH:mm:ss'
            ),
            from_balance: item.from_balance,
            to_wallet_id: item.to_wallet_id,
            memo: item.memo,
            pokt_amount: currency(item.pokt_amount, {
              symbol: '',
              precision: 2,
            }).format(),
          }
        })
      : []
  }, [transferTransactions])

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTransferPayload({
      ...transferPayload,
      balance_type: (event.target as HTMLInputElement).value,
    })
    const staked = userBalance?.staked_amount
    const pending = userBalance?.pending_stakes

    let result: number[] = []
    for (let i = 0; i < recepient.length; i++) {
      if (event.target.value === 'Staked') {
        if (
          Number(recepient[i].amount) > staked ||
          Number(recepient[i].amount) === 0
        ) {
          setAmountError([...result, i])
        } else {
          setAmountError([])
        }
      } else {
        if (
          Number(recepient[i].amount) > pending ||
          Number(recepient[i].amount) === 0
        ) {
          setAmountError([...result, i])
        } else {
          setAmountError([])
        }
      }
    }
  }

  const handleCopy = (value: string) => {
    setIsCopied(value)
    copyToClipboard(value)
  }

  const handleMemo = async (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index: number
  ) => {
    setRecepient(
      recepient.map((r, i) =>
        i === index ? { ...r, memo: e.target.value } : r
      )
    )
  }

  const handleAddress = async (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index: number
  ) => {
    setRecepient(
      recepient.map((r, i) =>
        i === index ? { ...r, customer_id: e.target.value } : r
      )
    )
    if (e.target.value.length == 40) {
      setIsValidate(
        !isValidate.includes(index) ? [index, ...isValidate] : isValidate
      )
      await axios
        .get(`stake/transfer/query-customer?walletId=${e.target.value}`, {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        })
        .then((res) => {
          const data = res.data

          if (data && data.customer_id) {
            setShowAddressError(showAddressError.filter((i) => i !== index))
            const tempRecepient = recepient.map((r, i) => {
              return i === index
                ? {
                    ...r,
                    amount: r.amount,
                    customer_id: sanitize(e.target.value),
                    to_customer_id: sanitize(data.customer_id),
                  }
                : r
            })
            setRecepient(tempRecepient)
          } else {
            setShowAddressError(
              !showAddressError.includes(index)
                ? [index, ...showAddressError]
                : showAddressError
            )
          }
        })
        .catch((e) => {
          setShowAddressError(
            !showAddressError.includes(index)
              ? [index, ...showAddressError]
              : showAddressError
          )
        })
      setIsValidate(isValidate.filter((i) => i !== index))
    } else {
      setShowAddressError(
        !showAddressError.includes(index)
          ? [index, ...showAddressError]
          : showAddressError
      )
    }
  }

  const deleteAddress = (i: number) => {
    setRecepient(recepient.filter((_, index) => index !== i))
  }

  const validateAmount = (value: any, index: number) => {
    const amount = Number(value)
    const staked = userBalance?.staked_amount
    const pending = userBalance?.pending_stakes

    if (transferPayload.balance_type === 'Staked') {
      if (amount > staked || amount === 0) {
        setAmountError([index, ...amountError])
      } else {
        setAmountError(amountError.filter((i) => i !== index))
      }
    } else {
      if (amount > pending || amount === 0) {
        setAmountError([index, ...amountError])
      } else {
        setAmountError(amountError.filter((i) => i !== index))
      }
    }
  }

  const handleAmount = (value: any, index: number) => {
    validateAmount(value, index)
    setRecepient(
      recepient.map((r, i) => (i === index ? { ...r, amount: value } : r))
    )
  }

  let totalAmount = 0
  for (let item in recepient) {
    if (recepient[item].amount) {
      totalAmount += Number(recepient[item].amount)
    }
  }

  const onSubmit = () => {
    for (let i = 0; i < recepient.length; i++) {
      if (Number(recepient[i].amount) === 0) {
        setAmountError([i])
        return
      }
    }

    const totalAmount = recepient.reduce((a, b) => a + Number(b.amount), 0)
    const staked = userBalance?.staked_amount
    const pending = userBalance?.pending_stakes

    if (transferPayload.balance_type === 'Staked') {
      if (totalAmount > staked) {
        setIsOverAmount(true)
      } else {
        setIsOverAmount(false)
        setTransferPayload({
          ...transferPayload,
          list: recepient.map((r) => {
            return { ...r, amount: Number(r.amount) }
          }),
        })

        if (user?.isTwoFactorEnabled) {
          setIsConfirmModalOpen(true)
        } else {
          requestOTPCode()
        }
      }
    } else {
      if (totalAmount > pending) {
        setIsOverAmount(true)
      } else {
        setIsOverAmount(false)
        setTransferPayload({
          ...transferPayload,
          list: recepient.map((r) => {
            return { ...r, amount: Number(r.amount) }
          }),
        })
        if (user?.isTwoFactorEnabled) {
          setIsConfirmModalOpen(true)
        } else {
          requestOTPCode()
        }
      }
    }
  }

  const sendTransfer = async () => {
    await submitTransfer(transferPayload)

    setRecepient([
      { to_customer_id: '', amount: '', customer_id: '', memo: '' },
    ])
  }

  useEffect(() => {
    isCopied && setTimeout(() => setIsCopied(''), 1000)
  }, [isCopied])

  useEffect(() => {
    if (user?.customerIds?.length === 0) router.push('/account/wallets')
  }, [user])

  return (
    <>
      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Cancel Transfer</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Do you want to delete this item?
          </DialogContentText>
        </DialogContent>
        <DialogActions className="p-4">
          <Button variant="outlined" onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              deleteAddress(deleteItem)
              setIsModalOpen(false)
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <section className="px-0 container mb-16 sm:px-4">
        <header className="prose mb-8">
          <h1>Transfer</h1>
        </header>
        {showSuccess}
        {showSuccess && (
          <Stack className="mb-8">
            <Alert severity="success" onClose={() => setShowSuccess(false)}>
              <AlertTitle>
                {success?.status || 'Transfer request successful!'}
              </AlertTitle>
            </Alert>
          </Stack>
        )}
        {transferError && (
          <Stack className="mb-8">
            {error?.error && (
              <Alert
                onClose={() => {
                  clearErrors()
                  setTransferError(false)
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
        <Box>
          <p>
            By selecting transfer you are transferring POKT to a wallet ID
            associated with a poktpool member. Once submitted the POKT will be
            immediately transferred from your poktpool account to theirs.
          </p>
          <Box className="block sm:flex my-8">
            <Box className="flex items-end">
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
            </Box>
            <Box className="flex items-end ml-0 sm:ml-24">
              <p className="m-0 pb-1">Pending stakes: </p>
              <h2 className="m-0 ml-4 heading-number-tag">
                {isBalanceLoading || isBalanceRefetching ? (
                  <CircularProgress />
                ) : (
                  currency(userBalance?.pending_stakes, {
                    symbol: '',
                    precision: 2,
                  }).format()
                )}
              </h2>
            </Box>
          </Box>
          <Box className="block items-center sm:flex">
            <p>
              Do you wish to transfer from your staked balance or pending
              stakes?
            </p>
            <Box className="sm:ml-8">
              <FormControl>
                <RadioGroup
                  className="inline-block"
                  aria-labelledby="demo-controlled-radio-buttons-group"
                  name="controlled-radio-buttons-group"
                  value={transferPayload.balance_type}
                  onChange={handleRadioChange}
                >
                  <FormControlLabel
                    value="Staked"
                    control={<Radio />}
                    label="Staked"
                  />
                  <FormControlLabel
                    className="ml-6"
                    value="Pending"
                    control={<Radio />}
                    label="Pending"
                  />
                </RadioGroup>
              </FormControl>
            </Box>
          </Box>
        </Box>
        <form className="max-w-5xl" onSubmit={handleSubmit(onSubmit)}>
          <p className="mt-12">
            Please enter the wallets of the members you wish to send to and the
            amounts
          </p>
          {matches ? (
            <Box className="mt-8">
              {recepient.map((item, index) => (
                <Box
                  key={index.toString()}
                  className="block sm:flex justify-between mb-4"
                  sx={{ height: '78px' }}
                >
                  <Box className="flex pt-2 mr-4">
                    {!isValidate.includes(index) &&
                    item.customer_id &&
                    !showAddressError.includes(index) ? (
                      <CheckCircleIcon color="success" fontSize="large" />
                    ) : (
                      <CheckCircleOutlineIcon
                        color="disabled"
                        fontSize="large"
                      />
                    )}
                  </Box>
                  <TextField
                    className="w-full mr-2 sm:w-1/2"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment
                          position="end"
                          onClick={() => handleCopy(item.customer_id)}
                        >
                          {isCopied && isCopied === item.customer_id ? (
                            <span>Copied</span>
                          ) : (
                            <ClipboardCopyIcon className="cursor-pointer w-5 h-5" />
                          )}
                        </InputAdornment>
                      ),
                    }}
                    error={showAddressError.includes(index)}
                    helperText={
                      showAddressError.includes(index) && 'Incorrect wallet ID!'
                    }
                    required
                    label="To Address"
                    value={item.customer_id}
                    onChange={(e) => handleAddress(e, index)}
                    disabled={isValidate.includes(index)}
                  />
                  <TextField
                    className="w-full mr-2 sm:w-1/5"
                    id="outlined-required"
                    value={item.amount}
                    label="Amount"
                    type="number"
                    required
                    inputProps={{
                      step: 'any',
                    }}
                    error={amountError.includes(index)}
                    helperText={
                      amountError.includes(index) && 'Incorrect amount entry!'
                    }
                    onChange={(e) => handleAmount(e.target.value, index)}
                  />
                  <TextField
                    id="outlined-required"
                    value={item.memo}
                    label="Memo"
                    type="text"
                    onChange={(e) => handleMemo(e, index)}
                  />
                  <Box className="pt-1">
                    <IconButton
                      aria-label="delete"
                      disabled={false}
                      size="large"
                      onClick={() => {
                        deleteItem = index
                        setIsModalOpen(true)
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              ))}
            </Box>
          ) : (
            <Box className="mt-8">
              {recepient.map((item, index) => (
                <Box key={index.toString()} className="flex mb-8">
                  <Box className="flex pt-4 mr-4">
                    {!isValidate.includes(index) &&
                    item.customer_id &&
                    !showAddressError.includes(index) ? (
                      <CheckCircleIcon color="success" fontSize="medium" />
                    ) : (
                      <CheckCircleOutlineIcon
                        color="disabled"
                        fontSize="medium"
                      />
                    )}
                  </Box>
                  <Box>
                    <TextField
                      className="w-full"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment
                            position="end"
                            onClick={() => handleCopy(item.customer_id)}
                          >
                            {isCopied && isCopied === item.customer_id ? (
                              <span>Copied</span>
                            ) : (
                              <ClipboardCopyIcon className="cursor-pointer w-5 h-5" />
                            )}
                          </InputAdornment>
                        ),
                      }}
                      error={showAddressError.includes(index)}
                      helperText={
                        showAddressError.includes(index) &&
                        'Incorrect wallet ID!'
                      }
                      required
                      label="To Address"
                      value={item.customer_id}
                      onChange={(e) => handleAddress(e, index)}
                      disabled={isValidate.includes(index)}
                    />
                    <TextField
                      className="w-full mt-4"
                      id="outlined-required"
                      defaultValue={item.amount.toString()}
                      label="Amount"
                      type="number"
                      required
                      inputProps={{
                        step: 'any',
                      }}
                      error={amountError.includes(index)}
                      helperText={
                        amountError.includes(index) && 'Incorrect amount entry!'
                      }
                      onChange={(e) => handleAmount(e.target.value, index)}
                    />
                    <TextField
                      className="w-full mt-4"
                      id="outlined-required"
                      value={item.memo}
                      label="Memo"
                      type="text"
                      onChange={(e) => handleMemo(e, index)}
                    />
                  </Box>
                  <Box className="pt-36 ">
                    <IconButton
                      aria-label="delete"
                      disabled={false}
                      size="large"
                      onClick={() => {
                        deleteItem = index
                        setIsModalOpen(true)
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              ))}
            </Box>
          )}

          <Box className="flex justify-end">
            <Button
              className="flex bg-transparent border-none text-blue hover:bg-transparent hover:underline "
              onClick={() =>
                setRecepient([
                  ...recepient,
                  { to_customer_id: '', amount: '', customer_id: '', memo: '' },
                ])
              }
            >
              + Add new recipient
            </Button>
          </Box>
          <Box className="inline-grid grid-flow-col gap-2 mt-12 items-center">
            <Button
              variant="contained"
              size="large"
              type="submit"
              disabled={amountError.length == 0 || !isOverAmount ? false : true}
            >
              Transfer
            </Button>
            {isOverAmount && (
              <p className="text-red-600 my-0">
                The amount entered exceeds your balance!
              </p>
            )}
          </Box>

          <Dialog
            open={isConfirmModalOpen}
            onClose={() => setIsConfirmModalOpen(false)}
            fullWidth
            maxWidth="sm"
            className="p-4"
          >
            <DialogTitle>Please confirm your transfer</DialogTitle>
            <DialogContent>
              <p className="mb-8">
                You are transferring a total of {totalAmount} POKT. This will
                happen immediately and cannot be undone.
              </p>
              {recepient.map((item) => (
                <div
                  className="flex justify-between mt-2 text-sm"
                  key={item.to_customer_id}
                >
                  <div>{item.customer_id}</div>
                  <div>{item.amount} POKT</div>
                </div>
              ))}
              {user?.isTwoFactorEnabled ? (
                <>
                  <p className="mt-8 mb-4">
                    Please enter your two factor authentication code.
                  </p>
                  <TextField
                    id="outlined-password-input"
                    label="Two Factor Code"
                    type="text"
                    fullWidth
                    onChange={(e) =>
                      setTransferPayload({
                        ...transferPayload,
                        twoFactorCode: sanitize(e.target.value),
                      })
                    }
                  />
                </>
              ) : (
                <>
                  <p className="mt-8 mb-4">
                    Please enter your one time passcode from your email.
                  </p>
                  <TextField
                    id="outlined-password-input"
                    label="One Time Passcode"
                    type="text"
                    fullWidth
                    onChange={(e) =>
                      setTransferPayload({
                        ...transferPayload,
                        oneTimeCode: sanitize(e.target.value),
                      })
                    }
                  />
                </>
              )}
            </DialogContent>
            <DialogActions className="p-4">
              <Button
                variant="outlined"
                onClick={() => setIsConfirmModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  sendTransfer()
                  setIsConfirmModalOpen(false)
                }}
              >
                Confirm
              </Button>
            </DialogActions>
          </Dialog>
        </form>

        <div className="flex mt-20 justify-between items-center">
          <h2 className="flex items-center">
            Transfer{' '}
            {!isTransfersLoading && (
              <span className="text-sm font-normal ml-4">
                Last Updated: {format(dataUpdatedAt, 'yyyy-MM-dd HH:mm:ss')}
              </span>
            )}
          </h2>
          <div>
            <CSVLink
              data={transactionData}
              filename={`transfer-history-${excelDate}.csv`}
              className="btn bg-brand-blue-dark text-white py-3 px-4 rounded"
              target="_blank"
              headers={headers}
              onClick={() => setDate(new Date())}
            >
              Download CSV
            </CSVLink>
          </div>
        </div>
        {isTransfersLoading || isTransferRefetching ? (
          <div className="text-center">
            <CircularProgress />
          </div>
        ) : (
          <ReportTable
            headCells={headCells}
            resultData={transactionData}
            useEnhancedHead={false}
            showPager={true}
          />
        )}
      </section>
    </>
  )
}

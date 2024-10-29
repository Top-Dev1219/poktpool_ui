import { ClipboardCopyIcon } from '@heroicons/react/solid'
import {
  Alert,
  AlertTitle,
  Button,
  CircularProgress,
  InputAdornment,
  Stack,
  TextField,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  IconButton,
  TableContainer,
  Table,
  Paper,
  TableBody,
  TableRow,
  TableCell,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material'
import { format, getUnixTime } from 'date-fns'
import { signIn, useSession } from 'next-auth/react'
import { useEffect, useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery } from 'react-query'
import axios from 'axios'
import { useRouter } from 'next/router'
import { sanitize } from 'dompurify'
import { CSVLink } from 'react-csv'
import currency from 'currency.js'
import { formatUTCDate } from '../../src/utils/time'
import StakeStatusQueue from '../../components/StakeStatusQueue'
import useAccessToken from '../../hooks/useAccessToken'
import copyToClipboard from '../../src/copyToClipboard'
import useCustomerId from '../../hooks/useCustomerId'
import useUser from '../../hooks/useUser'
import {
  pocketImportWithPPK,
  pocketSendTransactionWithPPK,
  pocketImportWithPrivatekey,
  pocketSendTransactionWithPKey,
} from '../../hooks/usePoktImport'
import { AttachFile } from '@mui/icons-material'

const poktpoolWallet = 'c46fd195948d7c5c19b8f3c69ad69cfa4f6a7cb9'

const headers = [
  { label: 'Date', key: 'staked_date' },
  { label: 'Status', key: 'staked_status' },
  { label: 'Transaction ID', key: 'tx_id' },
  { label: 'POKT Amount', key: 'pokt_amount' },
]

export default function Stake() {
  const { status } = useSession()
  const router = useRouter()
  const accessToken = useAccessToken()
  const {
    formState: { errors },
    clearErrors,
    setError,
    handleSubmit,
    register,
  } = useForm()
  const [error, setErrorObj] = useState<{ error: string; message: string[] }>()
  const [txId, setTxId] = useState('')
  const [txIdMissing, setTxIdMissing] = useState(true)
  const [showError, setShowError] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [importByPpk, setImportByPpk] = useState(true)
  const [stepOne, setStepOne] = useState(true)
  const [stepTwo, setStepTwo] = useState(false)
  const [passphrase, setPassPhrase] = useState<string>('')
  const [stakeAmount, setStakeAmount] = useState<number>(0)
  const [stakeMemo, setStakeMemo] = useState<string>('')
  const { customerId, user } = useCustomerId()
  const [date, setDate] = useState(new Date())
  const [keyFile, setKeyFile] = useState<string>('')
  const [filename, setFilename] = useState('')
  const [wallet, setWallet] = useState<any>(undefined)
  const [privateKey, setPrivateKey] = useState<string>('')
  const [sessionPassphrase, setSessionPassphrase] = useState<string>('')
  const [showImportError, setShowImportError] = useState(false)
  const [importErrMessage, setImportErrMessage] = useState('')
  const [showModalKey, setShowModalKey] = useState<string>('')
  const [showSendTxModal, setShowSendTxModal] = useState(false)
  const [enableSendTx, setEnableSendTx] = useState(false)
  const [submitTxSuccess, setSubmitTxSuccess] = useState(false)
  const [disableSendBtn, setDisableSendBtn] = useState(false)
  const excelDate = format(date, 'yyyy-MM-dd HH:mm:ss')

  const { mutate: submitStake, isLoading: stakeLoading } = useMutation(
    ({ txId, stake_method }: { txId: string; stake_method: string }) =>
      axios.post(
        `stake/transaction?customerId=${customerId}`,
        { txId: sanitize(txId), stake_method: stake_method },
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
          setError('txId', { type: 'manual' })
          setErrorObj(data)
        } else {
          setSubmitTxSuccess(true)
          setShowError(false)
          refetchUserBalance()
          refetchTransactions()
        }
      },
      onError: (error: any) => {
        setShowError(true)
        setErrorObj(error?.response?.data)
      },
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

  const { mutate: submitRawTx, isLoading: isMutating } = useMutation(
    (result: any) =>
      axios.post(`user/submit-tx`, result, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }),
    {
      onSuccess: async (res) => {
        const data = await res.data

        if (data?.error) {
          setShowError(true)
          setError('txId', { type: 'manual' })
          setErrorObj(data)
        } else {
          setSubmitTxSuccess(true)
          setShowError(false)
          setStepTwo(true)
          submitStake({
            txId: data?.txHash,
            stake_method: 'Wallet Integration',
          })
        }
      },
      onError: (error: any) => {
        setShowError(true)
        setErrorObj(error?.response?.data)
      },
    }
  )

  const {
    data: transactions,
    dataUpdatedAt,
    isLoading,
    refetch: refetchTransactions,
  } = useQuery(
    'stake/transactions',
    () =>
      axios
        .get(`stake/transactions?customerId=${customerId}`, {
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
    data: userBalance,
    isLoading: userBalanceLoading,
    refetch: refetchUserBalance,
  } = useQuery(
    'user/wallet-balance',
    () =>
      axios
        .get(`user/wallet-balance?address=${wallet?.addressHex}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((res) => res.data),
    {
      enabled: !!accessToken && !!wallet?.addressHex,
    }
  )

  useEffect(() => {
    if (accessToken) {
      const interval = setInterval(() => {
        refetchTransactions()
      }, 1000 * 60)

      return () => clearInterval(interval)
    }
  }, [accessToken, refetchTransactions])

  const handleModalConfirm = () => {
    if (showModalKey === 'updateActiveWallet') {
      setStepOne(false)
      setStepTwo(true)
      localStorage.setItem(
        'customerId',
        walletsData?.active.find(
          (item: any) =>
            item.p_wallet_id.toLowerCase() === wallet?.addressHex.toLowerCase()
        ).customer_id
      )
    }
    setShowModalKey('')
  }

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const importType = event.target.value
    setSessionPassphrase('')
    setPassPhrase('')

    switch (importType) {
      case 'importByPkey':
        setImportByPpk(false)
        break
      case 'importByPpk':
        setImportByPpk(true)
        break
      default:
        break
    }
  }

  const handleImport = () => {
    if (importByPpk) {
      if (keyFile) {
        fetch(keyFile)
          .then((res) => res.json())
          .then((res) => {
            pocketImportWithPPK(res, passphrase).then((importedAccount) => {
              if (importedAccount instanceof Error) {
                setImportErrMessage(importedAccount?.message)
                setShowImportError(true)
              } else {
                if (
                  walletsData?.active
                    .map((item: any) => item?.p_wallet_id.toLowerCase())
                    .includes(importedAccount.addressHex.toLowerCase())
                ) {
                  console.log(
                    walletsData?.active.find(
                      (item: any) =>
                        item.p_wallet_id.toLowerCase() ===
                        importedAccount?.addressHex.toLowerCase()
                    )?.customer_id
                  )
                  if (
                    walletsData?.active.find(
                      (item: any) =>
                        item.p_wallet_id.toLowerCase() ===
                        importedAccount?.addressHex.toLowerCase()
                    )?.customer_id !== customerId
                  ) {
                    setShowModalKey('updateActiveWallet')
                  } else {
                    setStepOne(false)
                    setStepTwo(true)
                  }
                  setWallet(importedAccount)
                } else {
                  setShowModalKey('noActiveWallet')
                }
              }
            })
          })
          .catch((err) => {
            setImportErrMessage(err.message)
            setShowImportError(true)
          })
      }
    } else {
      pocketImportWithPrivatekey(
        Buffer.from(privateKey, 'hex'),
        sessionPassphrase
      )
        .then((importedAccount) => {
          if (importedAccount instanceof Error) {
            setImportErrMessage(importedAccount?.message)
            setShowImportError(true)
          } else {
            if (
              walletsData?.active
                .map((item: any) => item?.p_wallet_id.toLowerCase())
                .includes(importedAccount.addressHex.toLowerCase())
            ) {
              if (
                walletsData?.active.find(
                  (item: any) =>
                    item.p_wallet_id.toLowerCase() ===
                    importedAccount?.addressHex.toLowerCase()
                )?.customer_id !== customerId
              ) {
                setShowModalKey('updateActiveWallet')
              } else {
                setStepOne(false)
                setStepTwo(true)
              }
              setWallet(importedAccount)
            } else {
              setShowModalKey('noActiveWallet')
            }
          }
        })
        .catch((err) => {
          setImportErrMessage(err.message)
          setShowImportError(true)
        })
    }
  }

  const comparePassphrase = (value: string) => {
    if (value === sessionPassphrase) {
      setEnableSendTx(true)
    } else {
      setEnableSendTx(false)
    }
  }

  const handleSendTx = () => {
    if (importByPpk) {
      fetch(keyFile)
        .then((res) => res.json())
        .then((res) => {
          pocketSendTransactionWithPPK(
            res,
            passphrase,
            poktpoolWallet,
            stakeAmount,
            stakeMemo
          )
            .then(async (result: any) => {
              setDisableSendBtn(true)
              await submitRawTx(result)

              setTimeout(() => {
                setDisableSendBtn(false)
                setSubmitTxSuccess(true)
              }, 8 * 1000)
            })
            .catch((err) => console.log(err))
        })
        .catch((err) => {
          console.log(err)
        })
    } else {
      setShowSendTxModal(true)
    }
  }

  const handleSendTxByPkey = () => {
    setEnableSendTx(false)
    setShowSendTxModal(false)
    pocketSendTransactionWithPKey(
      privateKey,
      poktpoolWallet,
      stakeAmount,
      stakeMemo
    )
      .then(async (result: any) => {
        setDisableSendBtn(true)
        await submitRawTx(result)
        setTimeout(() => {
          setDisableSendBtn(false)
          setSubmitTxSuccess(true)
        }, 8 * 1000)
      })
      .catch((err) => console.log(err))
  }

  const handlePPKFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (file) {
      setKeyFile(URL.createObjectURL(file))
      setFilename(file.name)
    } else {
      setKeyFile('')
      setFilename('')
    }
  }

  const handleTxId = (value: string) => {
    if (value.length === 0) {
      setTxIdMissing(true)
    } else {
      setTxIdMissing(false)
      setTxId(value)
    }
  }

  const handleStake = () => {
    submitStake({ txId, stake_method: 'Transaction Hash Entry' })

    setTimeout(refetchTransactions, 1000)
  }

  const formattedData = useMemo(() => {
    return transactions && transactions.length
      ? transactions
          .sort(
            (a: any, b: any) =>
              getUnixTime(new Date(b.txn_timestamp)) -
              getUnixTime(new Date(a.txn_timestamp))
          )
          .map((item: any) => {
            return {
              ...item,
              staked_date:
                item?.txn_timestamp &&
                format(
                  formatUTCDate(item?.txn_timestamp),
                  'yyyy-MM-dd HH:mm:ss'
                ),
              staked_status: item?.verification_desc,
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

  const renderModalContent = () => {
    switch (showModalKey) {
      case 'noActiveWallet':
        return 'The imported wallet does not exist in your active wallets list. Please add it first and try again. '
      case 'updateActiveWallet':
        return 'Your imported wallet is different from your active wallet. Do you want to change it into this wallet?'
      default:
        break
    }
  }

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    //these fail to keep the modal open
    event.stopPropagation()
    return false
  }

  useEffect(() => {
    isCopied && setTimeout(() => setIsCopied(false), 2000)
  }, [isCopied])

  useEffect(() => {
    if (user?.customerIds?.length === 0) router.push('/account/wallets')
  }, [user, router])

  if (status === 'unauthenticated') signIn()

  return (
    <>
      {status === 'authenticated' && (
        <section className="">
          <div className="mx-auto px-4 mb-8">
            <header className="prose mb-8">
              <h1>Stake</h1>
            </header>
            {submitTxSuccess && (
              <Stack className="mb-8">
                <Alert
                  severity="success"
                  onClose={() => setSubmitTxSuccess(false)}
                >
                  <AlertTitle>
                    Your request has been submitted successfully!
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
                    {typeof error.message === 'string' && (
                      <p>{error.message}</p>
                    )}
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

            <Alert
              severity="info"
              className="rounded-md info-alert-style text-brand-blue-dark my-8"
            >
              If you have more than one wallet, ensure that you have activated
              the correct wallet in your wallet settings page. The wallet
              address which the stake is submitted from must match the sender of
              the transaction hash in order to be verified.
            </Alert>
            <div className="mb-8">
              <p>
                To stake POKT in the pool visit{' '}
                <a
                  href="https://wallet.pokt.network/"
                  rel="noreferrer"
                  target="_blank"
                >
                  Pocket Wallet
                </a>{' '}
                and send POKT to poktpool’s wallet
              </p>
              <form className="mb-8">
                <div className="flex gap-4 justify-between">
                  <div className="w-1/2">
                    <TextField
                      className="w-full"
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
                  </div>
                  <div className="w-1/2">
                    <div className="grid gap-8 mb-4">
                      <TextField
                        label="Transaction Hash"
                        onChange={(e) => handleTxId(e.target.value)}
                        error={!!errors.txId}
                      />
                    </div>
                  </div>
                </div>
                <p className="mt-0">
                  <strong>IMPORTANT:</strong> Save your complete transaction
                  hash (64 digits). This is your receipt, and you will be
                  required to enter it in your staking request, below. Also, you
                  must send from your PERSONAL wallet address, not from an
                  exchange wallet.
                </p>
                <Button
                  variant="contained"
                  onClick={handleStake}
                  disabled={stakeLoading}
                  className={
                    'transition-all duration-200' +
                    (txIdMissing ? ' stake_custom_invalidate' : '')
                  }
                >
                  Stake
                </Button>
              </form>
            </div>

            <section className="my-16">
              <h2>Import Account</h2>
              {showImportError && (
                <Stack className="mb-4 max-w-2xl">
                  <Alert
                    onClose={() => setShowImportError(false)}
                    severity="error"
                  >
                    <AlertTitle>Import Error!</AlertTitle>
                    <p>{importErrMessage}</p>
                  </Alert>
                </Stack>
              )}
              <div>
                <FormControl>
                  <RadioGroup
                    className="inline-block"
                    aria-labelledby="demo-controlled-radio-buttons-group"
                    name="controlled-radio-buttons-group"
                    defaultValue="importByPpk"
                    onChange={handleRadioChange}
                  >
                    <FormControlLabel
                      value="importByPpk"
                      control={<Radio />}
                      label="Key File"
                    />
                    <FormControlLabel
                      className="ml-6"
                      value="importByPkey"
                      control={<Radio />}
                      label="Private Key"
                    />
                  </RadioGroup>
                </FormControl>
              </div>
              <div className="mt-8">
                {importByPpk ? (
                  <>
                    {stepOne && (
                      <div className="flex gap-4 items-baseline">
                        <div className="w-1/2 relative">
                          <input
                            type="file"
                            onChange={handlePPKFileSelect}
                            style={{
                              position: 'absolute',
                              zIndex: 10,
                              opacity: 0,
                              width: '100%',
                              height: '100%',
                              top: 0,
                              cursor: 'pointer',
                            }}
                          />
                          <TextField
                            fullWidth
                            type="text"
                            label={!filename && 'Select Keyfile'}
                            value={filename}
                            InputProps={{
                              endAdornment: (
                                <IconButton>
                                  <AttachFile />
                                </IconButton>
                              ),
                            }}
                          />
                        </div>
                        <div className="w-1/2">
                          <TextField
                            fullWidth
                            type="password"
                            className="bg-white"
                            label="Keyfile Passphrase"
                            value={passphrase}
                            onChange={(e) => setPassPhrase(e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {stepOne && (
                      <div className="flex gap-4 items-baseline">
                        <div className="w-1/2">
                          <TextField
                            fullWidth
                            type="password"
                            className="bg-white"
                            label="Private Key"
                            onChange={(e) => setPrivateKey(e.target.value)}
                          />
                        </div>
                        <div className="w-1/2">
                          <TextField
                            fullWidth
                            type="password"
                            className="bg-white"
                            label="Session Passphrase"
                            helperText="Please create a temporary passphrase to encrypt your Private key during this session. It will be required to confirm transactions."
                            value={sessionPassphrase}
                            onChange={(e) =>
                              setSessionPassphrase(e.target.value)
                            }
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}
                <div>
                  {stepTwo && (
                    <div className="max-w-3xl">
                      <TextField
                        className="w-full"
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

                      <div className="my-8">
                        <TableContainer component={Paper} className="not-prose">
                          <Table aria-label="Stake status queue table">
                            <TableBody>
                              <TableRow>
                                <TableCell className="bg-[#d5d5d5] text-base text-black border-white">
                                  Your Wallet Address:
                                </TableCell>
                                <TableCell className="uppercase text-base font-bold">
                                  {wallet?.addressHex}
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell className="bg-[#d5d5d5] text-base text-black">
                                  Wallet Balance:
                                </TableCell>
                                <TableCell className="text-base font-bold">
                                  {userBalance?.balance &&
                                    currency(userBalance?.balance / 1000000, {
                                      precision: 2,
                                      symbol: '',
                                    }).format()}
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </div>
                      <TextField
                        className="w-full"
                        type="number"
                        label="Amount"
                        required
                        inputProps={{
                          step: 'any',
                        }}
                        onChange={(e) =>
                          setStakeAmount(Number(e.target.value) * 1000000)
                        }
                      />
                      <TextField
                        fullWidth
                        label="Memo"
                        size="medium"
                        type="text"
                        multiline
                        rows={3}
                        className="bg-white mr-8 mt-4"
                        inputProps={{
                          style: {
                            padding: 10,
                          },
                        }}
                        onChange={(e) => setStakeMemo(e.target.value)}
                      />
                    </div>
                  )}
                </div>
                {stepOne ? (
                  <Button
                    variant="contained"
                    className="mt-4"
                    size="large"
                    disabled={
                      importByPpk
                        ? !keyFile || !passphrase
                        : !privateKey || !sessionPassphrase
                    }
                    onClick={handleImport}
                  >
                    Import
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    className="mt-4"
                    size="large"
                    disabled={isMutating || stakeAmount === 0 || disableSendBtn}
                    onClick={handleSendTx}
                  >
                    Send
                  </Button>
                )}
                {submitTxSuccess && (
                  <Stack className="my-8">
                    <Alert
                      severity="success"
                      onClose={() => setSubmitTxSuccess(false)}
                    >
                      <AlertTitle>
                        Your request has been submitted successfully!
                      </AlertTitle>
                    </Alert>
                  </Stack>
                )}
              </div>
            </section>

            <div className="flex justify-between items-center">
              <h2 className="flex items-center">
                Staking Status{' '}
                {!isLoading && (
                  <span className="text-sm font-normal ml-4">
                    Last Updated: {format(dataUpdatedAt, 'yyyy-MM-dd HH:mm:ss')}
                  </span>
                )}
              </h2>
              <div>
                <CSVLink
                  data={formattedData}
                  filename={`stake-status-report-${excelDate}.csv`}
                  className="btn bg-brand-blue-dark text-white py-3 px-4 rounded"
                  target="_blank"
                  headers={headers}
                  onClick={() => setDate(new Date())}
                >
                  Download CSV
                </CSVLink>
              </div>
            </div>
            {isLoading ? (
              <div className="text-center">
                <CircularProgress />
              </div>
            ) : (
              <StakeStatusQueue queue={transactions || []} />
            )}
          </div>
        </section>
      )}

      <Dialog
        maxWidth="xs"
        open={showModalKey !== ''}
        onBackdropClick={handleBackdropClick}
        disableEscapeKeyDown
      >
        <DialogContent>
          <p className="my-1">{renderModalContent()}</p>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setShowModalKey('')}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleModalConfirm}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        maxWidth="xs"
        open={showSendTxModal}
        onBackdropClick={handleBackdropClick}
        disableEscapeKeyDown
      >
        <DialogContent>
          <p className="text-center text-lg">
            Confirm your session passphrase to complete the transaction.
          </p>
          <TextField
            fullWidth
            type="password"
            className="bg-white"
            label="Session Passphrase"
            onChange={(e) => comparePassphrase(e.target.value)}
          />
          <p className="text-center mt-8">
            You are sending{' '}
            <span className="font-semibold">
              {stakeAmount &&
                currency(stakeAmount / 1000000, {
                  precision: 2,
                  symbol: '',
                }).format()}
            </span>{' '}
            POKT to:
          </p>
          <TextField
            className="w-full"
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
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            onClick={() => {
              setShowSendTxModal(false)
              setEnableSendTx(false)
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={!enableSendTx}
            onClick={handleSendTxByPkey}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

import React, { useState } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useQuery, useMutation } from 'react-query'
import Image from 'next/image'
import axios from 'axios'
import Link from 'next/link'
import {
  Button,
  Tabs,
  Tab,
  Typography,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  InputAdornment,
  IconButton,
  Alert,
  Skeleton,
} from '@mui/material'
import currency from 'currency.js'
import { sanitize } from 'dompurify'
import { ClipboardCopyIcon } from '@heroicons/react/solid'
import AddIcon from '@mui/icons-material/Add'
import PageLayout from '../../../../components/PageLayout'
import useAccessToken from '../../../../hooks/useAccessToken'
import poktpoolColorfulLogo from '../../../../public/images/poktpool-logo-color.png'
import { POKTPOOL_STRING } from '../../../constants'

const poktpoolWallet = 'c46fd195948d7c5c19b8f3c69ad69cfa4f6a7cb9'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  )
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  }
}

export const MyPortfolio = () => {
  const { status, data: sessionData } = useSession()
  const [value, setValue] = React.useState(0)
  const accessToken = useAccessToken()
  const router = useRouter()
  const [showAddNewWallet, setShowAddNewWallet] = useState(false)
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')
  const [walletError, setWalletError] = useState('')
  const [nickname, setNickname] = useState('')
  const [randAmount, setRandAmount] = useState(0)
  const [showSuccess, setShowSuccess] = useState(false)

  const {
    data: userPortfolio,
    isLoading: portfolioDataLoading,
    refetch,
  } = useQuery(
    'user/portfolio',
    () =>
      axios
        .get('user/portfolio', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((res) => {
          const data = res.data

          return data
        }),
    {
      enabled: !!accessToken,
    }
  )

  const moveToDashboard = (cid: string) => {
    if (cid) {
      localStorage.setItem('customerId', cid)
    }
    router.push('manage')
  }

  const handleNickname = (value: string) => {
    setNickname(value)
  }

  const handleWalletId = async (value: string) => {
    setWalletError('')
    setWalletAddress(value)
    if (value.length >= 40) {
      const checkWallet = await axios
        .get(`wallet/check-wallet?walletAddress=${value}`, {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        })
        .then((res) => res.data)
        .catch((e) => {
          setWalletError(e.response.data.message)
        })
    }
  }

  const handleAddWallet = () => {
    addWallet({ walletAddress, nickname })
    setShowAddNewWallet(false)
  }

  const handleConfirmAdd = () => {
    setConfirmModalOpen(false)
    refetch()
  }

  const calcBalance = (amount: number) => {
    if (userPortfolio?.pokt_price)
      return Number(userPortfolio?.pokt_price) * amount
    return 0
  }

  const getTotalBalance = () => {
    if (userPortfolio?.wallets && userPortfolio?.pokt_price) {
      return (
        userPortfolio?.wallets.reduce(
          (a: number, b: any) => a + Number(b.staked_amount),
          0
        ) * userPortfolio?.pokt_price
      )
    }
    return 0
  }

  const { mutate: addWallet } = useMutation(
    ({
      walletAddress,
      nickname,
    }: {
      walletAddress: string
      nickname?: string
    }) =>
      axios.post(
        `wallet/add`,
        {
          walletAddress: sanitize(walletAddress),
          nickname: sanitize(nickname ?? ''),
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
        setRandAmount(Number(data?.verf_amount) / 1000000)

        setWalletAddress('')
        setNickname('')
        setShowSuccess(true)
        setConfirmModalOpen(true)
      },
    }
  )

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue)
  }

  if (status === 'unauthenticated') signIn()

  return (
    <PageLayout title="My Portfolio">
      {userPortfolio && !portfolioDataLoading ? (
        <div className="max-w-7xl mx-auto px-4">
          <header className="flex flex-col gap-1 mb-6">
            <h1 className="mt-0 mb-0">My Portfolio</h1>
          </header>
          <div className="flex">
            <div className="px-8 py-6 relative rounded-xl bg-brand-blue-dark">
              <p className="text-white my-0">Portfolio Balance</p>
              <h1 className="text-white font-semibold text-4xl sm:text-5xl my-1 heading-number-tag">
                {currency(getTotalBalance(), {
                  precision: 2,
                }).format()}
              </h1>
            </div>
          </div>
          <div className="max-w-3xl">
            {showSuccess && (
              <Alert
                onClose={() => setShowSuccess(false)}
                severity="info"
                className="rounded-md info-alert-style text-brand-blue-dark mt-12"
              >
                Your request has been submitted successfully! Your wallet will
                appear on the Portfolio page once it has been verified.
              </Alert>
            )}
          </div>
          <div className="mt-12">
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                value={value}
                onChange={handleChange}
                aria-label="Pre Dashboard Page Tabs"
              >
                <Tab label="POKT" className="text-lg" {...a11yProps(0)} />
              </Tabs>
            </Box>
            <TabPanel value={value} index={0}>
              <div className="flex flex-wrap items-stretch">
                {userPortfolio?.wallets?.map((wallet: any, index: number) => (
                  <div
                    className="w-full mt-6 md:mt-0 md:w-1/3 pr-4"
                    key={index}
                  >
                    <div
                      className="bg-gradient-to-b from-brand-blue-dark to-brand-blue-light rounded-md pl-1 drop-shadow-2xl mb-8"
                      style={{ boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)' }}
                    >
                      <div className="rounded-md px-2 py-4 bg-white">
                        <h2
                          className="my-0 text-brand-blue-dark underline cursor-pointer"
                          onClick={() => moveToDashboard(wallet?.customer_id)}
                        >
                          {wallet?.wallet_nickname
                            ? wallet?.wallet_nickname
                            : `Wallet ${index + 1}`}
                        </h2>
                        <p className="my-1 text-sm break-words">
                          {wallet?.p_wallet_id}
                        </p>
                        <p className="my-0">
                          POKT Balance:{' '}
                          {wallet.staked_amount &&
                            currency(wallet.staked_amount, {
                              symbol: '',
                              precision: 2,
                            }).format()}
                        </p>
                        <p className="my-0">
                          USD Balance:{' '}
                          {currency(
                            calcBalance(Number(wallet?.staked_amount)),
                            {
                              precision: 2,
                            }
                          ).format()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="w-full mt-6 md:mt-0 md:w-1/3 pr-4 pb-8">
                  <IconButton
                    className="rounded-md w-full h-full mt-0 border border-solid border-slate-300 bg-transparent"
                    disabled={
                      userPortfolio?.wallets?.length +
                        userPortfolio?.pendingWalletCount >
                      2
                    }
                    onClick={() => setShowAddNewWallet(true)}
                  >
                    <AddIcon className="text-8xl font-thin" />
                  </IconButton>
                </div>
              </div>
              <p className="text-center">
                To view wallets pending verification, visit the{' '}
                <Link href="/account/wallets" passHref>
                  <a className="text-brand-blue-dark underline">Wallets</a>
                </Link>{' '}
                page.
              </p>
            </TabPanel>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4">
          <div>
            <Skeleton variant="text" width={300} height={100} />
          </div>
          <header className="flex my-2">
            <Skeleton variant="text" width={300} height={80} />
          </header>
          <div className="flex">
            <Skeleton variant="rounded" width={295} height={128} />
          </div>
          <div className="mt-15">
            <Skeleton variant="text" height={80} />
          </div>
          <div>
            <Skeleton variant="rounded" height={144} />
          </div>
          <div className="mt-8">
            <Skeleton variant="rounded" height={144} width={144} />
          </div>
        </div>
      )}

      <Dialog
        open={showAddNewWallet}
        onClose={() => setShowAddNewWallet(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="md"
      >
        <DialogTitle>Add a new wallet</DialogTitle>
        <DialogContent className="w-full md:w-[500px]">
          <TextField
            className="w-full mt-4"
            id="outlined-required"
            value={walletAddress}
            label="Wallet ID"
            type="text"
            error={walletError.length > 0}
            helperText={walletError}
            onChange={(e) => handleWalletId(e.target.value)}
          />
          <TextField
            className="w-full mt-4"
            id="outlined-required"
            value={nickname}
            label="Nickname (Optional)"
            type="text"
            onChange={(e) => handleNickname(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button
            className="capitalize bg-transparent text-black"
            onClick={() => {
              setShowAddNewWallet(false)
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            className="capitalize"
            onClick={handleAddWallet}
            autoFocus
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        disableEscapeKeyDown
      >
        <DialogTitle id="alert-dialog-title">
          <strong>Add a new wallet</strong>
        </DialogTitle>
        <DialogContent>
          <p className="mt-0">
            Please verify this wallet ID by sending{' '}
            {randAmount
              ? currency(randAmount, {
                  precision: 2,
                  symbol: '',
                }).format()
              : '-'}{' '}
            POKT to the following address.
          </p>
          <TextField
            className="w-full my-4"
            disabled
            InputProps={{
              endAdornment: (
                <InputAdornment
                  position="end"
                  onClick={() => {
                    setIsCopied(true)
                    navigator.clipboard.writeText(poktpoolWallet)
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
          <p>
            The test transaction must come in within 2 hours or the request will
            expire.
          </p>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={handleConfirmAdd}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </PageLayout>
  )
}

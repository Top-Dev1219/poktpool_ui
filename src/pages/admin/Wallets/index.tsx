import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useQuery, useMutation } from 'react-query'
import { useSession, signIn } from 'next-auth/react'
import axios from 'axios'
import currency from 'currency.js'
import { useForm, FieldValues } from 'react-hook-form'
import { ReactSortable } from 'react-sortablejs'
import {
  Divider,
  CircularProgress,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Button,
  RadioGroup,
  Radio,
  Snackbar,
  Alert,
  AlertTitle,
} from '@mui/material'
import { WalletCard } from './WalletCard'
import useAccessToken from '../../../../hooks/useAccessToken'

export interface WalletCardProps {
  id: number | string
  walletName: string
  walletAddress: string
  walletId: string
  balance: number
  is_active?: boolean
  rpt_display?: boolean
  refetch: () => void
}

export const AdminWallets = () => {
  const accessToken = useAccessToken()
  const router = useRouter()
  const { status, data: sessionData } = useSession()
  const [wallets, setWallets] = React.useState<WalletCardProps[]>([])
  const [showModal, setShowModal] = useState(false)
  const [patchSuccess, setPatchSuccess] = useState(false)
  const [randAmount, setRandAmount] = useState(0)
  const [hasPatchError, setHasPatchError] = useState(false)
  const [errorMsg, setErrorMsg] = useState(undefined)
  const [patchError, setPatchError] = useState<string[]>([])
  const { register, handleSubmit } = useForm()

  const {
    data: walletsList,
    isLoading: walletsLoading,
    refetch,
  } = useQuery(
    'admin/wallets-list',
    () =>
      axios
        .get('admin-wallets/list', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((res) => {
          const data = res.data

          if (data.wallets && data.wallets.length) {
            setWallets(
              data.wallets.sort(function (a: any, b: any) {
                return (
                  data.order.indexOf(a.wallet_id) -
                  data.order.indexOf(b.wallet_id)
                )
              })
            )
          }

          return data
        }),
    {
      enabled: !!accessToken,
    }
  )

  const handleSortable = () => {
    let newOrder: string[] = []
    wallets.forEach((wallet: any) => newOrder.push(wallet?.wallet_id))

    axios
      .post(
        `admin-wallets/order`,
        { walletIds: newOrder },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      )
      .then((res) => res.data)
  }

  const onSubmit = (data: FieldValues) => {
    const payload = wallets
      .filter((item) => !item.rpt_display)
      .map((item: any, index) => ({
        is_active: item.is_active ?? false,
        rpt_display: data['rpt_display' + index] === 'true' ? true : false,
        wallet_name: item.wallet_name,
        wallet_id: item.wallet_id,
      }))

    updateWalletName({ payload: { updates: payload } })
  }

  const { mutate: updateWalletName } = useMutation(
    ({ payload }: { payload: any }) =>
      axios.patch(`admin-wallets/edit`, payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }),
    {
      onSuccess: async (res) => {
        const data = await res.data
        setShowModal(false)
        setPatchSuccess(true)
        refetch()
      },
      onError: (error: any) => {
        setHasPatchError(true)
        setErrorMsg(error.response.data.error)
        setPatchError([error.response.data.message])
      },
    }
  )

  const totalBalance = () => {
    let totalSum = 0

    if (walletsList?.wallets.length) {
      for (let i = 0; i < walletsList?.wallets.length; i++) {
        totalSum += Number(walletsList?.wallets?.[i].balance)
      }
    }
    return totalSum / 1000000
  }

  useEffect(() => {
    const session: any = sessionData

    if (session?.permissions && !session?.permissions?.includes(7)) {
      router.push('manage/dashboard')
    }
  }, [sessionData, router])

  if (status === 'unauthenticated') signIn()

  return (
    <>
      {hasPatchError && (
        <Snackbar
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          open={hasPatchError}
          autoHideDuration={3000}
          onClose={() => setHasPatchError(false)}
        >
          <Alert className="capitalize" severity="error" sx={{ width: '100%' }}>
            <AlertTitle>Error</AlertTitle>
            <>
              <p>{errorMsg}</p>
              <ul>
                {patchError.map((error: string, index: number) => (
                  <li key={index} className="list-disc">
                    {error}
                  </li>
                ))}
              </ul>
            </>
          </Alert>
        </Snackbar>
      )}

      <div className="mb-6">
        <Typography className="text-xl">Wallets</Typography>
      </div>

      <div className="md:flex">
        <div className="flex gap-2 items-center md:w-1/3">
          <p className="my-0">Number of Wallets:</p>
          <h1 className="my-0 heading-number-tag">
            {walletsList?.wallets.length ? walletsList?.wallets.length : '-'}
          </h1>
        </div>

        <div className="flex gap-2 items-center md:w-1/3">
          <p className="my-0">Total POKT:</p>
          <h1 className="my-0 heading-number-tag">
            {totalBalance()
              ? currency(totalBalance(), {
                  symbol: '',
                  precision: 2,
                }).format()
              : '-'}
          </h1>
        </div>

        <div className="flex gap-2 items-center md:w-1/3">
          <p className="my-0">Block Last Updated:</p>
          <h1 className="my-0 heading-number-tag">
            {walletsList?.blockId ? walletsList?.blockId : '-'}
          </h1>
        </div>
      </div>
      {walletsLoading ? (
        <div className="flex justify-center w-full">
          <CircularProgress />
        </div>
      ) : (
        <div className="w-full mt-8">
          {wallets.length ? (
            <>
              <div>
                <h3 className="mb-0">Active Wallets</h3>
                <Divider className="mt-2 mb-6" />
                <React.Fragment>
                  <ReactSortable
                    filter=".addImageButtonContainer"
                    dragClass="sortableDrag"
                    list={wallets}
                    setList={(newList) => setWallets(newList)}
                    animation={200}
                    easing="ease-out"
                    className="relative md:grid gap-6 grid-cols-3 2xl:grid-cols-4"
                    ghostClass="dropArea"
                    handle=".dragHandle"
                    preventOnFilter={true}
                    onStart={() => console.log('started...')}
                    onEnd={handleSortable}
                  >
                    <>
                      {wallets
                        .filter((item) => item?.is_active && item.rpt_display)
                        .map((wallet: any, index: number) => (
                          <div
                            key={`wallet-card-${index}`}
                            className="dragHandle grid-items mt-4 md:mt-0 cursor-grab"
                          >
                            <WalletCard
                              walletName={wallet.wallet_name}
                              walletAddress={wallet.wallet_address}
                              balance={wallet.balance}
                              id={wallet.id}
                              walletId={wallet.wallet_id}
                              is_active={wallet.is_active}
                              rpt_display={wallet.rpt_display}
                              refetch={refetch}
                            />
                          </div>
                        ))}
                    </>
                  </ReactSortable>
                </React.Fragment>
              </div>

              <div className="mt-8">
                <h3 className="mb-0">Inactive Wallets</h3>
                <Divider className="mt-2 mb-6" />
                <React.Fragment>
                  <ReactSortable
                    filter=".addImageButtonContainer"
                    dragClass="sortableDrag"
                    list={wallets}
                    setList={(newList) => setWallets(newList)}
                    animation={200}
                    easing="ease-out"
                    className="relative md:grid gap-6 grid-cols-3 2xl:grid-cols-4"
                    ghostClass="dropArea"
                    handle=".dragHandle"
                    preventOnFilter={true}
                    onStart={() => console.log('started...')}
                    onEnd={handleSortable}
                  >
                    <>
                      {wallets
                        .filter((item) => !item?.is_active && item.rpt_display)
                        .map((wallet: any, index: number) => (
                          <div
                            key={`wallet-card-${index}`}
                            className="dragHandle grid-items mt-4 md:mt-0 cursor-grab"
                          >
                            <WalletCard
                              walletName={wallet.wallet_name}
                              walletAddress={wallet.wallet_address}
                              balance={wallet.balance}
                              walletId={wallet.wallet_id}
                              is_active={wallet.is_active}
                              rpt_display={wallet.rpt_display}
                              id={wallet.id}
                              refetch={refetch}
                            />
                          </div>
                        ))}
                    </>
                  </ReactSortable>
                </React.Fragment>
              </div>

              <div className="flex justify-center my-8">
                <Button
                  className="my-0 text-base capitalize  text-brand-blue-dark underline cursor-pointer hover:bg-transparent hover:underline disabled:text-slate-700 disabled:cursor-not-allowed"
                  disabled={
                    wallets.filter((item) => !item.rpt_display).length == 0
                  }
                  onClick={() => setShowModal(true)}
                >
                  View currently hidden wallets
                </Button>
              </div>
            </>
          ) : (
            <></>
          )}
        </div>
      )}

      <Dialog open={showModal} disableEscapeKeyDown>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>Edit Wallet</DialogTitle>
          <DialogContent className="w-[500px]">
            {wallets
              .filter((item) => !item.rpt_display)
              .map((wallet: any, index: number) => (
                <div className="flex items-center mt-4" key={index}>
                  <div className="w-2/5">
                    <p className="my-0">{wallet.wallet_name}</p>
                  </div>
                  <div className="w-3/5">
                    <FormControl>
                      <RadioGroup
                        row
                        aria-labelledby="demo-controlled-radio-buttons-group"
                        defaultValue={wallet?.rpt_display?.toString() ?? 'true'}
                        {...register('rpt_display' + index)}
                      >
                        <FormControlLabel
                          value="true"
                          control={<Radio />}
                          label="Show"
                        />
                        <FormControlLabel
                          className="ml-4"
                          value="false"
                          control={<Radio />}
                          label="Hide"
                        />
                      </RadioGroup>
                    </FormControl>
                  </div>
                </div>
              ))}
          </DialogContent>
          <DialogActions>
            <Button
              variant="outlined"
              onClick={() => {
                setShowModal(false)
              }}
            >
              Cancel
            </Button>
            <Button variant="contained" type="submit">
              Save
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={patchSuccess}
        autoHideDuration={3000}
        onClose={() => setPatchSuccess(false)}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          <AlertTitle>Success</AlertTitle>
          Wallet information has been updated successfully!
        </Alert>
      </Snackbar>
    </>
  )
}

import React, { useEffect, useState } from 'react'
import {
  Snackbar,
  Alert,
  AlertTitle,
  TextField,
  Button as MuiButton,
  InputAdornment,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material'
import axios from 'axios'
import { useQuery, useMutation } from 'react-query'
import useAccessToken from '../../../../hooks/useAccessToken'
import { ActiveWalletsTable } from './components/ActiveWalletsTable'
import { PendingWalletsTable } from './components/PendingWalletsTable'
import { AddNewWallet } from './components/AddNewWallet'
import { ClipboardCopyIcon } from '@heroicons/react/solid'
import currency from 'currency.js'
import { sanitize } from 'dompurify'

export const poktpoolWallet = 'c46fd195948d7c5c19b8f3c69ad69cfa4f6a7cb9'

export const MultiWallets = () => {
  const [totalWallets, setTotalWallets] = useState(0)
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [randAmount, setRandAmount] = useState(0)
  const [hasPatchError, setHasPatchError] = useState(false)
  const [errorMsg, setErrorMsg] = useState(false)
  const [patchError, setPatchError] = useState<string[]>([])

  const accessToken = useAccessToken()
  const {
    data: walletsData,
    isLoading,
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

  const { mutate: retryAddWallet } = useMutation(
    ({ verf_req_id }: { verf_req_id: string }) =>
      axios.post(
        `wallet/retry`,
        { verf_req_id: sanitize(verf_req_id) },
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

        setConfirmModalOpen(true)
      },
      onError: (error: any) => {
        setHasPatchError(true)
        setErrorMsg(error.response.data.error)
        setPatchError([error.response.data.message])
      },
    }
  )

  const handleConfirmAdd = () => {
    setConfirmModalOpen(false)
    refetchWallets()
  }

  useEffect(() => {
    setTotalWallets(
      walletsData?.active?.length +
        walletsData?.pending?.filter((p: any) => p?.req_status !== 'Expired')
          .length
    )
  }, [walletsData])

  useEffect(() => {
    isCopied && setTimeout(() => setIsCopied(false), 2000)
  }, [isCopied])

  return (
    <div className="max-w-5xl mx-auto">
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
      {walletsData?.active?.length !== 0 && (
        <div className="my-16">
          <h2>Active Wallets</h2>
          <div>
            <ActiveWalletsTable
              isLoading={isLoading}
              activeWallets={walletsData?.active ? walletsData?.active : []}
              refetchWallets={refetchWallets}
              isFetching={isFetching}
            />
          </div>
        </div>
      )}
      {walletsData?.pending?.length !== 0 && (
        <div>
          <h2>Pending Wallets</h2>
          <div>
            <PendingWalletsTable
              isLoading={isLoading}
              pendingWallets={walletsData?.pending ? walletsData?.pending : []}
              retryAddWallet={retryAddWallet}
            />
          </div>
        </div>
      )}

      <div className="mt-16">
        <h2>Add a new wallet</h2>
        <div>
          <AddNewWallet
            totalWallets={totalWallets}
            refetchWallets={refetchWallets}
          />
        </div>
      </div>
      {totalWallets > 2 && (
        <div className="mt-8 max-w-3xl">
          <Alert
            severity="warning"
            className="warning-alert-style text-brand-orange"
          >
            <AlertTitle>
              <strong>Notice</strong>
            </AlertTitle>
            You’ve reached at the maximum number of wallets to be added.
          </Alert>
        </div>
      )}

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
          <MuiButton variant="contained" onClick={handleConfirmAdd}>
            Confirm
          </MuiButton>
        </DialogActions>
      </Dialog>
    </div>
  )
}

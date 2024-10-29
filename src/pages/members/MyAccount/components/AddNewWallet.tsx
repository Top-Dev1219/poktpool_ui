import { useState, useEffect } from 'react'
import {
  TextField,
  Button,
  InputAdornment,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material'
import { useQuery, useMutation } from 'react-query'
import axios from 'axios'
import currency from 'currency.js'
import { sanitize } from 'dompurify'
import { ClipboardCopyIcon } from '@heroicons/react/solid'
import useAccessToken from '../../../../../hooks/useAccessToken'
import { poktpoolWallet } from '../Wallets'

interface WalletProps {
  totalWallets: number
  refetchWallets: () => void
}

export const AddNewWallet = (props: WalletProps) => {
  const { totalWallets, refetchWallets } = props
  const accessToken = useAccessToken()
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')
  const [walletError, setWalletError] = useState('')
  const [nickname, setNickname] = useState('')
  const [randAmount, setRandAmount] = useState(0)

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
  }

  const handleConfirmAdd = () => {
    setConfirmModalOpen(false)
    refetchWallets()
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

        setConfirmModalOpen(true)
      },
    }
  )

  useEffect(() => {
    isCopied && setTimeout(() => setIsCopied(false), 2000)
  }, [isCopied])

  return (
    <>
      <div className="block sm:flex max-w-3xl gap-4">
        <TextField
          className="w-full sm:w-2/3"
          id="outlined-required"
          value={walletAddress}
          label="Wallet ID"
          type="text"
          error={walletError.length > 0}
          helperText={walletError}
          disabled={totalWallets > 2}
          onChange={(e) => handleWalletId(e.target.value)}
        />
        <TextField
          className="w-full mt-4 sm:mt-0 sm:w-1/3"
          id="outlined-required"
          value={nickname}
          label="Nickname (Optional)"
          type="text"
          disabled={totalWallets > 2}
          onChange={(e) => handleNickname(e.target.value)}
        />
      </div>
      <div className="mt-6">
        <Button
          variant="contained"
          size="large"
          className="px-16"
          disabled={totalWallets > 2}
          onClick={handleAddWallet}
        >
          ADD
        </Button>
      </div>

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
    </>
  )
}

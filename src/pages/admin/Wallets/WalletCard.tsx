import { useState } from 'react'
import {
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  FormControl,
  FormControlLabel,
  Box,
  RadioGroup,
  Radio,
  Snackbar,
  Alert,
  AlertTitle,
} from '@mui/material'
import currency from 'currency.js'
import axios from 'axios'
import { useMutation } from 'react-query'
import ModeEditIcon from '@mui/icons-material/ModeEdit'
import Link from 'next/link'
import { useForm, FieldValues } from 'react-hook-form'
import { WalletCardProps } from '.'
import useAccessToken from '../../../../hooks/useAccessToken'

type UpdateWalletNamePayload = {
  wallet_id: string
  wallet_name: string
  is_active: boolean
  rpt_display: boolean
}

export interface EditWalletPayload {
  updates: UpdateWalletNamePayload[]
}

export const WalletCard = (props: WalletCardProps) => {
  const {
    walletName,
    walletAddress,
    balance,
    walletId,
    is_active,
    rpt_display,
    refetch,
  } = props
  const accessToken = useAccessToken()
  const [showEditWalletModal, setShowEditWalletModal] = useState(false)
  const [patchSuccess, setPatchSuccess] = useState(false)
  const { register, handleSubmit } = useForm()

  const onSubmit = (data: FieldValues) => {
    const payload = {
      is_active: data.is_active === 'true' ? true : false,
      rpt_display: data.rpt_display === 'true' ? true : false,
      wallet_name: data.wallet_name,
      wallet_id: walletId,
    }
    setShowEditWalletModal(false)

    updateWalletName({ payload: payload })
  }

  const { mutate: updateWalletName } = useMutation(
    ({ payload }: { payload: UpdateWalletNamePayload }) =>
      axios.patch(
        `admin-wallets/edit`,
        { updates: [payload] },
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
        setPatchSuccess(true)
        refetch()
        // refetchProviderData()
        // setEnableEdit(false)
        // setShowVendorUpdateSuccess(true)
      },
      onError: (error: any) => {
        // setHasPatchError(true)
        // setPatchError([error.response.data.message])
        console.log(error)
      },
    }
  )

  return (
    <>
      <div
        className="w-full bg-gradient-to-b from-brand-blue-dark to-brand-blue-light rounded-md pl-1 drop-shadow-2xl"
        style={{ boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)' }}
      >
        <div className="rounded-md px-2 py-4 bg-white">
          <div className="flex justify-between items-center">
            <Link href={`/admin/wallets/${walletId}`} passHref>
              <a className="hover:text-brand-blue-dark font-bold cursor-pointer">
                {walletName}
              </a>
            </Link>
            <h3 className="my-0 text-base"></h3>
            <IconButton
              className="rounded-md"
              onClick={() => setShowEditWalletModal(true)}
            >
              <ModeEditIcon />
            </IconButton>
          </div>

          <p className="my-1 text-sm break-words">{walletAddress}</p>
          <p className="my-0">
            Balance:{' '}
            {balance &&
              currency(Number(balance) / 1000000, {
                symbol: '',
                precision: 2,
              }).format()}
          </p>
        </div>
      </div>

      <Dialog open={showEditWalletModal} disableEscapeKeyDown>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>Edit Wallet</DialogTitle>
          <DialogContent className="w-[500px]">
            <div className="flex items-center mt-4">
              <p className="my-0 w-2/5">Wallet Name</p>
              <TextField
                fullWidth
                className="bg-white w-3/5"
                label="Wallet Name"
                defaultValue={walletName}
                {...register('wallet_name')}
              />
            </div>
            <div className="flex items-center mt-4">
              <Box className="w-2/5">
                <p>Active?</p>
              </Box>
              <Box className="w-3/5">
                <FormControl>
                  <RadioGroup
                    row
                    aria-labelledby="demo-controlled-radio-buttons-group"
                    defaultValue={is_active?.toString() ?? 'true'}
                    {...register('is_active')}
                  >
                    <FormControlLabel
                      value="true"
                      control={<Radio />}
                      label="Active"
                    />
                    <FormControlLabel
                      className="ml-4"
                      value="false"
                      control={<Radio />}
                      label="Inactive"
                    />
                  </RadioGroup>
                </FormControl>
              </Box>
            </div>
            <div className="flex items-center">
              <Box className="w-2/5">
                <p>Display?</p>
              </Box>
              <Box className="w-3/5">
                <FormControl>
                  <RadioGroup
                    row
                    aria-labelledby="demo-controlled-radio-buttons-group"
                    defaultValue={rpt_display?.toString() ?? 'true'}
                    {...register('rpt_display')}
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
              </Box>
            </div>
          </DialogContent>
          <DialogActions>
            <Button
              variant="outlined"
              onClick={() => {
                setShowEditWalletModal(false)
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

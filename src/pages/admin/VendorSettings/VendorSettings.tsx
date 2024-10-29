import { useEffect, useState, useMemo } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useQuery, useMutation } from 'react-query'
import { FieldValues, useForm } from 'react-hook-form'
import axios from 'axios'
import {
  Typography,
  Button,
  Box,
  FormControl,
  Select,
  MenuItem,
  IconButton,
  TextField,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  FormControlLabel,
  Radio,
  RadioGroup,
  Alert,
  Snackbar,
} from '@mui/material'
import ModeEditIcon from '@mui/icons-material/ModeEdit'
import SaveIcon from '@mui/icons-material/Save'
import CloseIcon from '@mui/icons-material/Close'
import useAccessToken from '../../../../hooks/useAccessToken'

interface ProviderInfoPayload {
  vendor_id: number
  pool_id: number
  admin_email: string
  base_node_fee: number
  fee_frequency: string
  rev_share_rate: number
  rev_share_over: string
  reward_sweep_wallet_id: string
  revshare_wallet_id: string
  is_custodial: boolean
  is_active: boolean
  deduct_revshare: boolean
}

const initialSettings: ProviderInfoPayload = {
  vendor_id: 0,
  pool_id: 0,
  admin_email: '',
  base_node_fee: 0,
  fee_frequency: '',
  rev_share_rate: 0,
  rev_share_over: '',
  reward_sweep_wallet_id: '',
  revshare_wallet_id: '',
  is_custodial: true,
  is_active: true,
  deduct_revshare: true,
}

export const VendorSettings = () => {
  const router = useRouter()
  const accessToken = useAccessToken()
  const { handleSubmit, register, setValue, watch } = useForm()
  const { status, data: sessionData } = useSession()
  const [vendorId, setVendorId] = useState<number>(0)
  const [editVendorName, setEditVendorName] = useState(false)
  const [vendorName, setVendorName] = useState('')
  const [newVendorName, setNewVendorName] = useState('')
  const [addNewVendor, setAddNewVendor] = useState(false)
  const [poolId, setPoolId] = useState<number>(0)
  const [showvendorUpdateSuccess, setShowVendorUpdateSuccess] = useState(false)
  const [poolName, setPoolName] = useState('')
  const [enableEdit, setEnableEdit] = useState(false)
  const [addVendorSuccess, setAddVendorSuccess] = useState(false)
  const [hasPatchError, setHasPatchError] = useState(false)
  const [patchError, setPatchError] = useState<string[]>([])

  const { data: providerData, refetch: refetchProviderData } = useQuery(
    'admin-provider/data',
    () =>
      axios
        .get('admin-provider/data', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((res) => res.data),
    {
      enabled: !!accessToken,
    }
  )

  const { data: vendorSettings, refetch: refetchVendorSettings } = useQuery(
    `admin-provider/vendor-settings/${vendorId}`,
    () =>
      axios
        .get(`admin-provider/vendor-settings/${vendorId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((res) => res.data),
    {
      enabled: !!accessToken && !!vendorId,
    }
  )

  const { mutate: updateVendorName } = useMutation(
    ({ vendor_name }: { vendor_name: string }) =>
      axios.put(
        `admin-provider/vendor/${vendorId}`,
        { vendor_name },
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

        refetchProviderData()
      },
    }
  )

  const { mutate: createNewVendor } = useMutation(
    ({ vendor_name }: { vendor_name: string }) =>
      axios.post(
        `admin-provider/vendor`,
        { vendor_name },
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

        refetchProviderData()
        setAddVendorSuccess(true)
      },
      onError: (error: any) => {
        setHasPatchError(true)
        setPatchError(error.response.data.message)
      },
    }
  )

  const { mutate: updateVendorSettings } = useMutation(
    ({ vendorSettingPayload }: { vendorSettingPayload: ProviderInfoPayload }) =>
      axios.put(
        `admin-provider/vendor-setting`,
        { ...vendorSettingPayload },
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
        refetchVendorSettings()
        refetchProviderData()
        setEnableEdit(false)
        setShowVendorUpdateSuccess(true)
      },
      onError: (error: any) => {
        setHasPatchError(true)
        setPatchError([error.response.data.message])
      },
    }
  )

  const handleAddNewVendor = () => {
    createNewVendor({ vendor_name: newVendorName })
    setAddNewVendor(false)
  }

  const handleVendorNameUpdate = () => {
    updateVendorName({ vendor_name: vendorName })
    setEditVendorName(false)
  }

  const onSubmit = (data: FieldValues) => {
    const payload = {
      ...data,
      base_node_fee: Number(data.base_node_fee),
      rev_share_rate: Number(data.rev_share_rate) / 100,
      is_active: data.is_active === 'true' ? true : false,
      is_custodial: data.is_custodial === 'true' ? true : false,
      deduct_revshare: data.deduct_revshare === 'true' ? true : false,
      reward_sweep_wallet_id:
        vendorPoolSettings?.reward_sweep_wallet?.wallet_id.toString(),
      revshare_wallet_id:
        vendorPoolSettings?.revshare_wallet?.wallet_id.toString(),
      pool_id: poolId,
      vendor_id: vendorId,
    } as ProviderInfoPayload

    updateVendorSettings({ vendorSettingPayload: payload })
  }

  const vendorPoolSettings = useMemo(() => {
    if (vendorSettings && vendorSettings.vendor_pool_admins.length && poolId) {
      const poolItem =
        vendorSettings &&
        vendorSettings?.vendor_pool_admins.length &&
        vendorSettings?.vendor_pool_admins.find(
          (vp: any) => vp?.pool_id === poolId
        )
      return poolItem
    } else {
      return initialSettings
    }
  }, [vendorSettings, poolId])

  const addedPools = providerData?.pools?.filter(
    (item: any) =>
      !vendorSettings?.vendor_pool_admins
        ?.map((pool: any) => pool.pool_id)
        ?.includes(item.pool_id)
  )

  useEffect(() => {
    setValue('admin_email', vendorPoolSettings?.admin_email ?? null)
    setValue(
      'reward_sweep_wallet_id',
      vendorPoolSettings?.reward_sweep_wallet?.wallet_address ?? null
    )
    setValue(
      'revshare_wallet_id',
      vendorPoolSettings?.revshare_wallet?.wallet_address ?? null
    )
    setValue('rev_share_rate', Number(vendorPoolSettings?.rev_share_rate) * 100)
    setValue('rev_share_over', vendorPoolSettings?.rev_share_over ?? null)
    setValue('base_node_fee', Number(vendorPoolSettings?.base_node_fee))
    setValue('fee_frequency', vendorPoolSettings?.fee_frequency ?? null)
    setValue(
      'is_custodial',
      vendorPoolSettings?.is_custodial?.toString() ?? 'true'
    )
    setValue('is_active', vendorPoolSettings?.is_active?.toString() ?? 'true')
    setValue(
      'deduct_revshare',
      vendorPoolSettings?.deduct_revshare?.toString() ?? 'true'
    )
  }, [vendorPoolSettings, setValue])

  useEffect(() => {
    setVendorName(
      providerData?.vendors.find((vendor: any) => vendor.vendor_id === vendorId)
        ?.vendor_name
    )
  }, [providerData, vendorId])

  useEffect(() => {
    setPoolName(
      providerData?.pools.find((pool: any) => pool.pool_id === poolId)
        ?.pool_name
    )
  }, [providerData, poolId])

  useEffect(() => {
    const session: any = sessionData

    if (session?.permissions && !session?.permissions?.includes(10)) {
      router.push('manage/dashboard')
    }
  }, [sessionData, router, vendorId])

  if (status === 'unauthenticated') signIn()

  return (
    <div>
      <Typography className="text-xl mt-8">Provider Admin</Typography>
      {addVendorSuccess && (
        <div className="max-w-4xl my-4 mx-auto">
          <Alert
            severity="info"
            className="rounded-md info-alert-style text-brand-blue-dark"
            onClose={() => setAddVendorSuccess(false)}
          >
            A new provider has been added successfully!
          </Alert>
        </div>
      )}

      {showvendorUpdateSuccess && (
        <div className="max-w-4xl my-4 mx-auto">
          <Alert
            severity="info"
            className="rounded-md info-alert-style text-brand-blue-dark"
            onClose={() => setShowVendorUpdateSuccess(false)}
          >
            Provider settings have been updated successfully!
          </Alert>
        </div>
      )}
      <div className="max-w-4xl mx-auto">
        <Box className="md:flex items-center">
          <Box className="md:flex items-center">
            <h2 className="text-[18px] font-semibold mr-4">Select Provider</h2>
            <Box className="w-full md:w-56 md:mr-8">
              <FormControl fullWidth size="small">
                <Select
                  className="bg-white"
                  labelId="demo-select-small"
                  id="vendorId"
                  value={vendorId}
                  renderValue={() => {
                    if (!vendorId) {
                      return <span>Select provider</span>
                    }
                    return providerData?.vendors.find(
                      (vendor: any) => vendor.vendor_id === vendorId
                    )?.vendor_name
                  }}
                  displayEmpty
                  onChange={(e) => {
                    setVendorId(Number(e.target.value))
                    setPoolId(0)
                  }}
                >
                  {providerData?.vendors.map((vendor: any, index: number) => (
                    <MenuItem key={index} value={vendor.vendor_id}>
                      {vendor.vendor_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
          <h2 className="text-[18px] font-semibold mr-8">Or</h2>
          <Button
            className="bg-brand-blue-dark text-white hover:bg-brand-blue-dark py-2"
            onClick={() => setAddNewVendor(true)}
            variant="contained"
          >
            create a new provider
          </Button>
        </Box>

        {vendorId !== 0 && (
          <>
            <Box className="flex items-center my-8">
              <Box className="md:flex items-center gap-4">
                <h2 className="text-[18px]">Node Provider Name:</h2>
                <div className="flex gap-2">
                  <Box>
                    {editVendorName ? (
                      <TextField
                        label="Provider Name"
                        size="small"
                        fullWidth
                        InputLabelProps={{
                          shrink: true,
                        }}
                        value={vendorName}
                        onChange={(e) => setVendorName(e.target.value)}
                      />
                    ) : (
                      <h2 className="text-[18px] font-medium">
                        {vendorName} <span className="text-red-600">*</span>
                      </h2>
                    )}
                  </Box>

                  {editVendorName ? (
                    <div className="flex sm:block">
                      <IconButton
                        className="rounded-md p-2 border-solid bg-green-500 text-white hover:bg-green-600 hover:text-white"
                        onClick={handleVendorNameUpdate}
                      >
                        <SaveIcon />
                      </IconButton>
                      <IconButton
                        className="rounded-md p-2 border-solid bg-gray-300 text-white hover:bg-gray-400 ml-2"
                        onClick={() => setEditVendorName(false)}
                      >
                        <CloseIcon />
                      </IconButton>
                    </div>
                  ) : (
                    <IconButton
                      className="rounded-md p-2 border border-gray-400 border-solid hover:bg-brand-blue-dark hover:border-brand-blue-dark hover:text-white"
                      onClick={() => setEditVendorName(true)}
                    >
                      <ModeEditIcon />
                    </IconButton>
                  )}
                </div>
              </Box>
            </Box>

            <Box className="md:flex items-center justify-between my-8">
              <Box className="flex items-center">
                <h2 className="text-[18px] font-semibold mr-4">Select Pool</h2>
                <Box className="w-52 mr-8">
                  <FormControl fullWidth size="small">
                    <Select
                      className="bg-white"
                      labelId="demo-select-small"
                      id="poolId"
                      value={poolId}
                      renderValue={() => {
                        if (!poolId) {
                          return <span>Select pool</span>
                        }
                        return providerData?.pools?.find(
                          (item: any) => item.pool_id === poolId
                        )?.pool_name
                      }}
                      displayEmpty
                      onChange={(e) => setPoolId(Number(e.target.value))}
                    >
                      {vendorSettings?.vendor_pool_admins?.map(
                        (vendor: any, index: number) => (
                          <MenuItem key={index} value={vendor.pool_id}>
                            {
                              providerData?.pools?.find(
                                (item: any) => item?.pool_id === vendor?.pool_id
                              )?.pool_name
                            }
                          </MenuItem>
                        )
                      )}
                    </Select>
                  </FormControl>
                </Box>
              </Box>

              <Box className="flex items-center">
                <h2 className="text-[18px] font-semibold mr-4">Add To Pool</h2>
                <Box className="w-52 mr-8">
                  <FormControl fullWidth size="small">
                    <Select
                      className="bg-white"
                      labelId="demo-select-small"
                      id="poolId"
                      value={poolId}
                      renderValue={() => {
                        const poolInfo = addedPools?.find(
                          (item: any) => item.pool_id === poolId
                        )
                        if (poolInfo === undefined) {
                          return <span>Add To Pool</span>
                        }
                        return poolInfo.pool_name
                      }}
                      displayEmpty
                      disabled
                      onChange={(e) => setPoolId(Number(e.target.value))}
                    >
                      {addedPools.map((vendor: any, index: number) => (
                        <MenuItem key={index} value={vendor.pool_id}>
                          {vendor?.pool_name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Box>
            </Box>
          </>
        )}

        {poolId !== 0 && (
          <Box>
            <Box className="flex items-center justify-between bg-brand-blue-dark px-8 min-h-[50px]">
              <h2 className="text-[18px] my-3 text-white">{poolName}</h2>
              {enableEdit ? (
                <Button
                  className="text-white"
                  onClick={() => setEnableEdit(false)}
                >
                  Cancel
                </Button>
              ) : (
                <Button
                  startIcon={<ModeEditIcon className="text-white" />}
                  className="text-white"
                  onClick={() => setEnableEdit(true)}
                >
                  Edit
                </Button>
              )}
            </Box>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Box className="bg-white shadow-md px-8 py-4">
                <Box className="flex items-center">
                  <Box className="w-2/5">
                    <p>Email Address: </p>
                  </Box>
                  <Box className="w-3/5">
                    <TextField
                      id="outlined-basic"
                      size="small"
                      fullWidth
                      disabled={!enableEdit}
                      variant="outlined"
                      defaultValue={vendorPoolSettings?.admin_email}
                      {...register('admin_email')}
                    />
                  </Box>
                </Box>
                <Box className="flex items-center">
                  <Box className="w-2/5">
                    <p>Reward Sweep Wallet: </p>
                  </Box>
                  <Box className="w-3/5">
                    <TextField
                      id="outlined-basic"
                      size="small"
                      disabled
                      fullWidth
                      variant="outlined"
                      defaultValue={
                        vendorPoolSettings?.reward_sweep_wallet?.wallet_address
                      }
                      {...register('reward_sweep_wallet_id')}
                    />
                  </Box>
                </Box>
                <Box className="flex items-center">
                  <Box className="w-2/5">
                    <p>Rev Share Wallet: </p>
                  </Box>
                  <Box className="w-3/5">
                    <TextField
                      id="outlined-basic"
                      size="small"
                      disabled
                      fullWidth
                      variant="outlined"
                      defaultValue={
                        vendorPoolSettings?.revshare_wallet?.wallet_address
                      }
                      {...register('revshare_wallet_id')}
                    />
                  </Box>
                </Box>
                <Box className="flex items-center">
                  <Box className="w-2/5">
                    <p>Rev Share %: </p>
                  </Box>
                  <Box className="w-3/5">
                    <TextField
                      id="outlined-basic"
                      size="small"
                      type="number"
                      fullWidth
                      InputProps={{ inputProps: { step: 'any' } }}
                      disabled={!enableEdit}
                      variant="outlined"
                      defaultValue={vendorPoolSettings?.rev_share_rate * 100}
                      {...register('rev_share_rate')}
                    />
                  </Box>
                </Box>
                <Box className="flex items-center">
                  <Box className="w-2/5">
                    <p>Rev Share Over: </p>
                  </Box>
                  <Box className="w-3/5">
                    <Box className="w-2/3 mr-8">
                      <FormControl fullWidth size="small">
                        <Select
                          className="bg-white"
                          labelId="demo-select-small"
                          id="revShareOver"
                          fullWidth
                          disabled={!enableEdit}
                          renderValue={() => {
                            if (!poolId) {
                              return 'Select Rev Share Over'
                            }
                            return watch('rev_share_over')
                          }}
                          displayEmpty
                          {...register('rev_share_over')}
                        >
                          <MenuItem value="Zero">Zero</MenuItem>
                          <MenuItem value="Network Average">
                            Network Average
                          </MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  </Box>
                </Box>
                <Box className="flex items-center">
                  <Box className="w-2/5">
                    <p>Node Base Fee: </p>
                  </Box>
                  <Box className="w-3/5">
                    <TextField
                      id="outlined-basic"
                      size="small"
                      type="number"
                      fullWidth
                      InputProps={{ inputProps: { step: 'any' } }}
                      disabled={!enableEdit}
                      variant="outlined"
                      {...register('base_node_fee', {
                        required: true,
                      })}
                    />
                  </Box>
                </Box>
                <Box className="flex items-center">
                  <Box className="w-2/5">
                    <p>Fee Frequency: </p>
                  </Box>
                  <Box className="w-3/5">
                    <Box className="w-2/3 mr-8">
                      <FormControl fullWidth size="small">
                        <Select
                          className="bg-white"
                          labelId="demo-select-small"
                          id="feeFrequency"
                          disabled={!enableEdit}
                          renderValue={() => {
                            if (!poolId) {
                              return 'Select Fee Frequency'
                            }
                            return watch('fee_frequency')
                          }}
                          displayEmpty
                          {...register('fee_frequency', {
                            required: true,
                          })}
                        >
                          <MenuItem value="Daily">Daily</MenuItem>
                          <MenuItem value="Monthly">Monthly</MenuItem>
                          <MenuItem value="Staked Token">Staked Token</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  </Box>
                </Box>
                <Box className="flex items-center">
                  <Box className="w-2/5">
                    <p>
                      Custodial? <span className="text-red-600">*</span>:
                    </p>
                  </Box>
                  <Box className="w-3/5">
                    <FormControl>
                      <RadioGroup
                        row
                        aria-labelledby="demo-controlled-radio-buttons-group"
                        defaultValue={
                          vendorPoolSettings?.is_custodial?.toString() ?? 'true'
                        }
                        {...register('is_custodial')}
                      >
                        <FormControlLabel
                          disabled={!enableEdit}
                          value="true"
                          control={<Radio />}
                          label="Yes"
                        />
                        <FormControlLabel
                          disabled={!enableEdit}
                          value="false"
                          control={<Radio />}
                          label="No"
                        />
                      </RadioGroup>
                    </FormControl>
                  </Box>
                </Box>
                <Box className="flex items-center">
                  <Box className="w-2/5">
                    <p>
                      Active? <span className="text-red-600">*</span>:
                    </p>
                  </Box>
                  <Box className="w-3/5">
                    <FormControl>
                      <RadioGroup
                        row
                        aria-labelledby="demo-controlled-radio-buttons-group"
                        defaultValue={
                          vendorPoolSettings?.is_active?.toString() ?? 'true'
                        }
                        {...register('is_active')}
                      >
                        <FormControlLabel
                          disabled={!enableEdit}
                          value="true"
                          control={<Radio />}
                          label="Yes"
                        />
                        <FormControlLabel
                          disabled={!enableEdit}
                          value="false"
                          control={<Radio />}
                          label="No"
                        />
                      </RadioGroup>
                    </FormControl>
                  </Box>
                </Box>

                <Box className="flex items-center">
                  <Box className="w-2/5">
                    <p>
                      Deduct Revshare? <span className="text-red-600">*</span>:
                    </p>
                  </Box>
                  <Box className="w-3/5">
                    <FormControl>
                      <RadioGroup
                        row
                        aria-labelledby="demo-controlled-radio-buttons-group"
                        defaultValue={
                          vendorPoolSettings?.deduct_revshare?.toString() ??
                          'true'
                        }
                        {...register('deduct_revshare')}
                      >
                        <FormControlLabel
                          disabled={!enableEdit}
                          value="true"
                          control={<Radio />}
                          label="Yes"
                        />
                        <FormControlLabel
                          disabled={!enableEdit}
                          value="false"
                          control={<Radio />}
                          label="No"
                        />
                      </RadioGroup>
                    </FormControl>
                  </Box>
                </Box>
              </Box>

              <Box className="flex justify-end mt-8">
                <Button
                  type="submit"
                  disabled={!vendorId || !poolId}
                  variant="contained"
                  size="large"
                >
                  Save all changes
                </Button>
              </Box>
            </form>
          </Box>
        )}

        {addNewVendor && (
          <Dialog
            open={addNewVendor}
            disableEscapeKeyDown
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">Add New Provider</DialogTitle>
            <DialogContent>
              <p>Please enter a new provider name.</p>
              <div>
                <TextField
                  label="Provider Name"
                  size="medium"
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                  value={newVendorName}
                  onChange={(e) => setNewVendorName(e.target.value)}
                />
              </div>
            </DialogContent>
            <DialogActions>
              <Button
                variant="outlined"
                size="large"
                onClick={() => setAddNewVendor(false)}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                size="large"
                onClick={handleAddNewVendor}
              >
                Add
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </div>
      {hasPatchError && (
        <Snackbar
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          open={hasPatchError}
          autoHideDuration={3000}
          onClose={() => setHasPatchError(false)}
        >
          <Alert className="capitalize" severity="error" sx={{ width: '100%' }}>
            {patchError.length > 1 ? (
              patchError.map((error: string, index: number) => (
                <p key={index}>{error}</p>
              ))
            ) : (
              <p>{patchError}</p>
            )}
          </Alert>
        </Snackbar>
      )}
    </div>
  )
}

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useQuery, useMutation } from 'react-query'
import { useSession, signIn } from 'next-auth/react'
import axios from 'axios'
import currency from 'currency.js'
import { useForm, FieldValues } from 'react-hook-form'
import {
  Box,
  Typography,
  Select,
  FormControl,
  MenuItem,
  IconButton,
  InputAdornment,
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  Snackbar,
  Alert,
  AlertTitle,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import ModeEditIcon from '@mui/icons-material/ModeEdit'
import SaveIcon from '@mui/icons-material/Save'
import CloseIcon from '@mui/icons-material/Close'
import useAccessToken from '../../../../hooks/useAccessToken'

type NewModelType = {
  network_id: number
  vendor_id: number
  model_name: string
  fiat_per_node: number
  rev_share_rate: number
  tokens_per_node: number
}

export const MarketPerformance = () => {
  const accessToken = useAccessToken()
  const router = useRouter()
  const { status, data: sessionData } = useSession()
  const [showModal, setShowModal] = useState(false)
  const [showMissingIds, setShowMissingIds] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [networkId, setNetworkId] = useState('')
  const [vendorId, setVendorId] = useState('')
  const [modelId, setModelId] = useState(false)
  const [hasPatchError, setHasPatchError] = useState(false)
  const [errorMsg, setErrorMsg] = useState(false)
  const [patchError, setPatchError] = useState<string[]>([])
  const [patchSuccess, setPatchSuccess] = useState(false)
  const [updateSuccess, setUpdateSuccess] = useState(false)
  const [deleteSuccess, setDeleteSuccess] = useState(false)
  const { register, handleSubmit } = useForm()
  const [editPayload, setEditPayload] = useState<any>(undefined)

  const { data: pricingVendors, isLoading: vendorsLoading } = useQuery(
    'admin/admin-pricing-model/vendors',
    () =>
      axios
        .get('admin-pricing-model/vendors', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((res) => res.data),
    {
      enabled: !!accessToken,
    }
  )

  const {
    data: pricingModels,
    isLoading: modelsLoading,
    refetch: refetchModels,
  } = useQuery(
    ['admin-pricing-model/models', networkId, vendorId],
    () =>
      axios
        .get(
          `admin-pricing-model/models?network_id=${networkId}&vendor_id=${vendorId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        )
        .then((res) => res.data),
    {
      enabled: !!accessToken && !!networkId && !!vendorId,
    }
  )

  const handleAddNew = () => {
    if (networkId && vendorId) {
      setShowModal(true)
    } else {
      setShowMissingIds(true)
    }
  }

  const onSubmit = (data: FieldValues) => {
    const payload: NewModelType = {
      network_id: Number(networkId),
      vendor_id: Number(vendorId),
      model_name: data.model_name,
      fiat_per_node: Number(data.fiat_per_node),
      rev_share_rate: Number(data.rev_share_rate) / 100,
      tokens_per_node: Number(data.tokens_per_node),
    }

    setShowModal(false)

    addNewModel({ payload: payload })
  }

  const { mutate: addNewModel } = useMutation(
    ({ payload }: { payload: NewModelType }) =>
      axios.post('admin-pricing-model/model', payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }),
    {
      onSuccess: async (res) => {
        const data = await res.data
        refetchModels()
        setPatchSuccess(true)
      },
      onError: (error: any) => {
        setHasPatchError(true)
        setErrorMsg(error.response.data.error)
        setPatchError([error.response.data.message])
      },
    }
  )

  const updatePricingModel = () => {
    setEditPayload(undefined)
    updateModel({ payload: editPayload })
  }

  const { mutate: updateModel } = useMutation(
    ({ payload }: { payload: any }) =>
      axios.put(
        `admin-pricing-model/model/${payload.model_id}`,
        {
          model_name: editPayload.model_name,
          fiat_per_node: Number(editPayload.fiat_per_node),
          rev_share_rate: Number(editPayload.rev_share_rate / 100),
          tokens_per_node: Number(editPayload.tokens_per_node),
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
        refetchModels()
        setUpdateSuccess(true)
      },
      onError: (error: any) => {
        setHasPatchError(true)
        setErrorMsg(error.response.data.error)
        setPatchError([error.response.data.message])
      },
    }
  )

  const confirmDeleteModel = () => {
    deleteModel({ modelId: modelId })
    setShowDeleteModal(false)
  }

  const { mutate: deleteModel } = useMutation(
    ({ modelId }: { modelId: any }) =>
      axios.delete(`admin-pricing-model/model/${modelId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }),
    {
      onSuccess: async (res) => {
        const data = await res.data
        refetchModels()
        setDeleteSuccess(true)
      },
      onError: (error: any) => {
        setHasPatchError(true)
        setErrorMsg(error.response.data.error)
        setPatchError([error.response.data.message])
      },
    }
  )

  useEffect(() => {
    const session: any = sessionData

    if (session?.permissions && !session?.permissions?.includes(15)) {
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

      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={patchSuccess}
        autoHideDuration={3000}
        onClose={() => setPatchSuccess(false)}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          A new model was created successfully!
        </Alert>
      </Snackbar>

      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={updateSuccess}
        autoHideDuration={3000}
        onClose={() => setUpdateSuccess(false)}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          The model has been updated successfully!
        </Alert>
      </Snackbar>

      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={deleteSuccess}
        autoHideDuration={3000}
        onClose={() => setDeleteSuccess(false)}
      >
        <Alert severity="info" sx={{ width: '100%' }}>
          The model has been deleted successfully!
        </Alert>
      </Snackbar>

      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={showMissingIds}
        autoHideDuration={3000}
        onClose={() => setShowMissingIds(false)}
      >
        <Alert severity="error" sx={{ width: '100%' }}>
          Please select a network and a provider to proceed.
        </Alert>
      </Snackbar>

      <div className="mb-6">
        <Typography className="text-xl">Market Performance</Typography>
      </div>

      <section>
        <div className="md:flex items-center gap-8">
          <div className="md:flex items-center gap-4">
            <h2 className="text-[18px] font-semibold mr-4">Select Network</h2>
            <Box className="w-full md:w-56 mr-8">
              <FormControl fullWidth size="small">
                <Select
                  className="bg-white"
                  labelId="demo-select-small"
                  id="poolId"
                  value={networkId}
                  renderValue={() => {
                    if (!networkId) {
                      return <span>Select Network</span>
                    }
                    return pricingVendors?.networks?.find(
                      (item: any) => item.network_id === networkId
                    )?.network_name
                  }}
                  displayEmpty
                  onChange={(e) => setNetworkId(e.target.value)}
                >
                  {pricingVendors?.networks?.map(
                    (network: any, index: number) => (
                      <MenuItem key={index} value={network.network_id}>
                        {network.network_name}
                      </MenuItem>
                    )
                  )}
                </Select>
              </FormControl>
            </Box>
          </div>
          <div className="md:flex items-center gap-4">
            <h2 className="text-[18px] font-semibold mr-4">Select Provider</h2>
            <Box className="w-full md:w-56 mr-8">
              <FormControl fullWidth size="small">
                <Select
                  className="bg-white max-h-52"
                  labelId="demo-select-small"
                  id="txTypeCode"
                  value={vendorId}
                  renderValue={() => {
                    if (!vendorId) {
                      return <span>Select Provider</span>
                    }
                    return pricingVendors?.vendors?.find(
                      (item: any) => item.vendor_id === vendorId
                    )?.vendor_name
                  }}
                  displayEmpty
                  onChange={(e) => setVendorId(e.target.value)}
                >
                  {pricingVendors?.vendors?.map(
                    (vendor: any, index: number) => (
                      <MenuItem key={index} value={vendor.vendor_id}>
                        {vendor?.vendor_name}
                      </MenuItem>
                    )
                  )}
                </Select>
              </FormControl>
            </Box>
          </div>
          <div>
            <Button variant="contained" onClick={handleAddNew}>
              Add New Pricing Model
            </Button>
          </div>
        </div>
      </section>

      <section className="mt-12">
        <div className="relative md:grid gap-6 grid-cols-3 2xl:grid-cols-4">
          {pricingModels && pricingModels.length
            ? pricingModels.map((model: any, index: number) => {
                return (
                  <div
                    className="grid-items bg-white rounded-md shadow-md p-4"
                    key={index}
                  >
                    <div className="flex justify-between">
                      {editPayload?.model_id === model?.model_id ? (
                        <TextField
                          size="small"
                          className="bg-white"
                          InputLabelProps={{
                            shrink: true,
                          }}
                          value={
                            editPayload?.model_id === model.model_id
                              ? editPayload.model_name
                              : model.model_name
                          }
                          onChange={(e) =>
                            setEditPayload({
                              ...editPayload,
                              model_name: e.target.value,
                            })
                          }
                        />
                      ) : (
                        <h3 className="my-0">{model?.model_name}</h3>
                      )}

                      <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={() => {
                          setShowDeleteModal(true)
                          setModelId(model?.model_id)
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </div>
                    <div className="flex mt-4">
                      <div className="w-1/2">
                        <p className="text-center my-0">$ per Node</p>
                      </div>
                      <div className="w-1/2">
                        <TextField
                          size="small"
                          className="bg-white"
                          fullWidth
                          type="number"
                          disabled={editPayload?.model_id !== model?.model_id}
                          InputLabelProps={{
                            shrink: true,
                          }}
                          value={
                            editPayload?.model_id === model.model_id
                              ? Number(editPayload.fiat_per_node)
                              : currency(Number(model.fiat_per_node), {
                                  symbol: '',
                                  precision: 2,
                                }).format()
                          }
                          InputProps={{
                            inputProps: {
                              step: 'any', // Allow any numeric input
                              min: 0,
                            },
                            startAdornment: (
                              <InputAdornment position="start">
                                $
                              </InputAdornment>
                            ),
                          }}
                          onChange={(e) =>
                            setEditPayload({
                              ...editPayload,
                              fiat_per_node: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="flex mt-4">
                      <div className="w-1/2">
                        <p className="text-center my-0">Rev Share</p>
                      </div>
                      <div className="w-1/2">
                        <TextField
                          size="small"
                          className="bg-white"
                          fullWidth
                          disabled={editPayload?.model_id !== model?.model_id}
                          InputLabelProps={{
                            shrink: true,
                          }}
                          value={
                            editPayload?.model_id === model.model_id
                              ? editPayload.rev_share_rate
                              : currency(model.rev_share_rate * 100, {
                                  symbol: '',
                                  precision: 2,
                                }).format()
                          }
                          InputProps={{
                            inputProps: {
                              step: 'any', // Allow any numeric input
                              min: 0,
                            },
                            endAdornment: '%',
                          }}
                          onChange={(e) =>
                            setEditPayload({
                              ...editPayload,
                              rev_share_rate: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="flex mt-4">
                      <div className="w-1/2">
                        <p className="text-center my-0">Tokens per Node</p>
                      </div>
                      <div className="w-1/2">
                        <TextField
                          size="small"
                          className="bg-white"
                          fullWidth
                          disabled={editPayload?.model_id !== model?.model_id}
                          InputLabelProps={{
                            shrink: true,
                          }}
                          value={
                            editPayload?.model_id === model.model_id
                              ? Number(editPayload.tokens_per_node)
                              : currency(model.tokens_per_node, {
                                  symbol: '',
                                  precision: 2,
                                }).format()
                          }
                          InputProps={{
                            inputProps: {
                              step: 'any', // Allow any numeric input
                              min: 0,
                            },
                          }}
                          onChange={(e) =>
                            setEditPayload({
                              ...editPayload,
                              tokens_per_node: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="flex justify-end mt-4">
                      {editPayload?.model_id === model.model_id ? (
                        <div className="flex sm:block">
                          <IconButton
                            className="rounded-md p-2 border-solid bg-green-500 text-white hover:bg-green-600 hover:text-white"
                            onClick={updatePricingModel}
                          >
                            <SaveIcon />
                          </IconButton>
                          <IconButton
                            className="rounded-md p-2 border-solid bg-gray-300 text-white hover:bg-gray-400 ml-2"
                            onClick={() => setEditPayload(undefined)}
                          >
                            <CloseIcon />
                          </IconButton>
                        </div>
                      ) : (
                        <IconButton
                          className="rounded-md p-2 border border-gray-400 border-solid hover:bg-brand-blue-dark hover:border-brand-blue-dark hover:text-white"
                          onClick={() =>
                            setEditPayload({
                              ...model,
                              rev_share_rate: currency(
                                model.rev_share_rate * 100,
                                {
                                  symbol: '',
                                  precision: 2,
                                }
                              ).format(),
                            })
                          }
                        >
                          <ModeEditIcon />
                        </IconButton>
                      )}
                    </div>
                  </div>
                )
              })
            : 'Model Not found!'}
        </div>
      </section>

      <Dialog
        open={showModal}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Add New Pricing Model</DialogTitle>
        <DialogContent className="w-full md:w-[500px]">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mt-4 flex">
              <div className="w-1/2">
                <p className="text-center my-0">Pricing Model Title</p>
              </div>
              <div className="w-1/2">
                <TextField
                  size="small"
                  className="bg-white"
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                  {...register('model_name', {
                    required: true,
                  })}
                />
              </div>
            </div>
            <div className="flex mt-4">
              <div className="w-1/2">
                <p className="text-center my-0">$ per Node</p>
              </div>
              <div className="w-1/2">
                <TextField
                  size="small"
                  className="bg-white"
                  fullWidth
                  type="number"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  InputProps={{
                    inputProps: {
                      step: 'any', // Allow any numeric input
                      min: 0,
                    },
                    startAdornment: (
                      <InputAdornment position="start">$</InputAdornment>
                    ),
                  }}
                  {...register('fiat_per_node', {
                    required: true,
                  })}
                />
              </div>
            </div>
            <div className="flex mt-4">
              <div className="w-1/2">
                <p className="text-center my-0">Rev Share</p>
              </div>
              <div className="w-1/2">
                <TextField
                  size="small"
                  className="bg-white"
                  type="number"
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                  InputProps={{
                    inputProps: {
                      step: 'any', // Allow any numeric input
                      min: 0,
                    },
                    endAdornment: '%',
                  }}
                  {...register('rev_share_rate', {
                    required: true,
                  })}
                />
              </div>
            </div>
            <div className="flex mt-4">
              <div className="w-1/2">
                <p className="text-center my-0">Tokens per Node</p>
              </div>
              <div className="w-1/2">
                <TextField
                  size="small"
                  className="bg-white"
                  type="number"
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                  InputProps={{
                    inputProps: {
                      step: 'any', // Allow any numeric input
                      min: 0,
                    },
                  }}
                  {...register('tokens_per_node', {
                    required: true,
                  })}
                />
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Button variant="outlined" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="contained" type="submit" className="ml-4">
                Add
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showDeleteModal}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title" className="text-center w-[300px]">
          Are you sure you want to delete the model?
        </DialogTitle>
        <DialogContent>
          <div className="flex justify-center gap-4 mt-4">
            <Button
              variant="outlined"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button variant="contained" onClick={confirmDeleteModel}>
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useMutation, useQuery } from 'react-query'
import { useRouter } from 'next/router'
import useAccessToken from '../../../../hooks/useAccessToken'
import { Typography, Box, TextField, Stack } from '@mui/material'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import { signIn, useSession } from 'next-auth/react'

interface PoolList {
  pool_id: number
  pool_name: string
}

interface VendorList {
  vendor_id: number
  vendor_name: string
}

interface SearchObj {
  nodeAddresses: string[]
  poolId: number
  vendorId: number
}

interface MutateObjType {
  searchObj: SearchObj
}

export const NodeAddress = () => {
  const accessToken = useAccessToken()
  const router = useRouter()
  const { status, data: sessionData } = useSession()
  const [showSuccess, setShowSuccess] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [showError, setShowError] = useState(false)
  const [error, setErrorObj] = useState<{ error: string; message: string[] }>()
  const [state, setState] = useState({
    searchObj: {
      nodeAddresses: [],
      poolId: 0,
      vendorId: 0,
    },
  } as MutateObjType)

  const { data: poolList, isLoading: poolListLoading } = useQuery(
    'nodes/poolList',
    () =>
      axios
        .get('nodes/pools', {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        })
        .then((res) => res.data),
    {
      enabled: !!accessToken,
    }
  )

  const { data: vendorList, isLoading: vendorListLoading } = useQuery(
    'nodes/vendorList',
    () =>
      axios
        .get('nodes/vendors', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((res) => res.data),
    {
      enabled: !!accessToken,
    }
  )

  const { mutate: submitNodeAddress, isLoading: mutateLoading } = useMutation(
    ({ searchObj }: { searchObj: SearchObj }) =>
      axios.post('nodes/nodes', searchObj, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }),
    {
      onSuccess: (res) => {
        const data = res.data

        setState({ searchObj: { nodeAddresses: [], poolId: 0, vendorId: 0 } })

        if (data.length > 0) {
          setShowSuccess(true)
        } else if (data.length === 0) {
          setShowInfo(true)
        } else {
          setShowError(true)
        }
      },
      onError: (error: any) => {
        setShowError(true)
        setErrorObj(error?.response?.data)
      },
    }
  )

  const handleChange = (field: keyof SearchObj, value: any) => {
    const searchObj: SearchObj = state.searchObj
    searchObj[field] = value
    setState({ ...state, searchObj: searchObj })
  }

  useEffect(() => {
    const session: any = sessionData

    if (session?.permissions && !session?.permissions?.includes(2)) {
      router.push('manage/dashboard')
    }
  }, [sessionData])

  if (status === 'unauthenticated') signIn()

  return (
    <div>
      <section className="max-w-3xl mx-auto">
        <div className="my-8">
          <Typography className="text-xl">Node Address Entry</Typography>
        </div>
        <Box component="main" className="mt-10" sx={{ flexGrow: 1 }}>
          <div className="md:flex full-w gap-4">
            <FormControl fullWidth size="medium">
              <Select
                className="bg-white"
                labelId="demo-select-small"
                id="poolId"
                value={state.searchObj.poolId}
                displayEmpty
                renderValue={() => {
                  if (!state.searchObj.poolId) {
                    return <span>Select a pool</span>
                  }
                  return (
                    poolList &&
                    poolList.find(
                      (p: PoolList) => p.pool_id === state.searchObj.poolId
                    ).pool_name
                  )
                }}
                onChange={(e) => handleChange('poolId', e.target.value)}
              >
                {poolList &&
                  poolList.map((pool: PoolList) => (
                    <MenuItem key={pool.pool_id} value={pool.pool_id}>
                      {pool.pool_name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            <FormControl fullWidth size="medium" className="mt-4 md:mt-0">
              <Select
                className="bg-white"
                labelId="demo-select-small"
                id="vendorId"
                value={state.searchObj.vendorId}
                displayEmpty
                renderValue={() => {
                  if (!state.searchObj.vendorId) {
                    return <span>Select a provider</span>
                  }
                  return (
                    vendorList &&
                    vendorList.find(
                      (v: VendorList) =>
                        v.vendor_id === state.searchObj.vendorId
                    ).vendor_name
                  )
                }}
                onChange={(e) => handleChange('vendorId', e.target.value)}
              >
                {vendorList &&
                  vendorList.map((vendor: VendorList) => (
                    <MenuItem key={vendor.vendor_id} value={vendor.vendor_id}>
                      {vendor.vendor_name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </div>
          <TextField
            fullWidth
            label="Node Address"
            size="medium"
            type="text"
            multiline
            rows={3}
            className="bg-white mr-8 mt-4"
            required
            inputProps={{
              style: {
                padding: 10,
              },
            }}
            value={state.searchObj.nodeAddresses.filter((i) => i).join(',')}
            onChange={(e) =>
              handleChange(
                'nodeAddresses',
                e.target.value
                  .replace(/ /g, '')
                  .replace(/(\n\r|\n|\r)/gm, '')
                  .split(',')
                  .filter((i) => i)
              )
            }
          />
          <Button
            variant="contained"
            size="large"
            className="bg-brand-blue-dark text-white hover:bg-brand-blue-dark py-2 px-10 mt-4"
            disabled={mutateLoading}
            onClick={() => submitNodeAddress({ searchObj: state.searchObj })}
          >
            {mutateLoading ? (
              <CircularProgress size={28} color="inherit" />
            ) : (
              'ADD'
            )}
          </Button>
        </Box>
        {showSuccess && (
          <Alert
            className="mt-8"
            severity="success"
            onClose={() => setShowSuccess(false)}
          >
            <AlertTitle>Success</AlertTitle>
            Node addresses added successfully!
          </Alert>
        )}
        {showInfo && (
          <Alert
            className="mt-8 drop-shadow-lg info-alert-style text-brand-blue-dark"
            severity="info"
            onClose={() => setShowInfo(false)}
          >
            <AlertTitle>Info</AlertTitle>
            Node addresses already exist.
          </Alert>
        )}
        {showError && (
          <Stack className="mb-8 mt-8">
            {error?.error && (
              <Alert
                onClose={() => {
                  setErrorObj({ error: '', message: [] })
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
      </section>
    </div>
  )
}

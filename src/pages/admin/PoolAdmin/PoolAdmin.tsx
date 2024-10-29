import { useEffect, useState } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useQuery, useMutation } from 'react-query'
import axios from 'axios'
import {
  Typography,
  Button,
  Box,
  FormControl,
  Select,
  MenuItem,
  TextField,
  Alert,
  Snackbar,
  InputAdornment,
} from '@mui/material'
import useAccessToken from '../../../../hooks/useAccessToken'

interface Payload {
  segment_id: number
  infra_rate: number
  ppinc_commission_rate: number
}

export const PoolAdmin = () => {
  const router = useRouter()
  const accessToken = useAccessToken()
  const { status, data: sessionData } = useSession()
  const [poolId, setPoolId] = useState<string>('')
  const [showSuccessMsg, setShowSuccessMsg] = useState(false)
  const [hasPatchError, setHasPatchError] = useState(false)
  const [patchError, setPatchError] = useState<string[]>([])
  const [payload, setPayload] = useState<Payload[]>([])

  const { data: adminSegmentPools } = useQuery(
    'admin-segment/pools',
    () =>
      axios
        .get('admin-segment/pools', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((res) => res.data),
    {
      enabled: !!accessToken,
    }
  )

  const { data: adminSegmentsData } = useQuery(
    ['admin-segment/segments', poolId],
    () =>
      axios
        .get(`admin-segment/segments?pool_id=${poolId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((res) => res.data),
    {
      enabled: !!accessToken && !!poolId,
    }
  )

  const { mutate: updateSegmentSettings } = useMutation(
    (payload: any[]) =>
      axios.patch(
        `admin-segment/segments`,
        { updates: payload },
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
        setShowSuccessMsg(true)
      },
      onError: (error: any) => {
        setHasPatchError(true)
        setPatchError([error.response.data.message])
      },
    }
  )

  useEffect(() => {
    if (adminSegmentsData) {
      setPayload(
        adminSegmentsData.map((item: Payload) => ({
          segment_id: Number(item.segment_id),
          infra_rate: Number(item.infra_rate),
          ppinc_commission_rate: Number(item.ppinc_commission_rate),
        }))
      )
    }
  }, [adminSegmentsData])

  useEffect(() => {
    const session: any = sessionData

    if (session?.permissions && !session?.permissions?.includes(13)) {
      router.push('manage/dashboard')
    }
  }, [sessionData, router])

  if (status === 'unauthenticated') signIn()

  return (
    <div>
      {showSuccessMsg && (
        <div className="max-w-4xl my-4 mx-auto">
          <Alert
            severity="success"
            className="rounded-md"
            onClose={() => setShowSuccessMsg(false)}
          >
            Segment settings have been updated successfully!
          </Alert>
        </div>
      )}

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

      <div className="max-w-4xl mx-auto">
        <Typography className="text-xl mt-8">Pool Administration</Typography>
        <div className="md:grid grid-cols-3 gap-8 my-8">
          <h2 className="text-[18px] font-semibold mr-4">Select Pool</h2>
          <Box className="w-full md:w-56 mr-8">
            <FormControl fullWidth size="small">
              <Select
                className="bg-white"
                labelId="demo-select-small"
                id="poolId"
                value={poolId}
                renderValue={() => {
                  if (!poolId) {
                    return <span>Select Pool</span>
                  }
                  return adminSegmentPools?.find(
                    (item: any) => item.pool_id === poolId
                  )?.pool_name
                }}
                displayEmpty
                onChange={(e) => setPoolId(e.target.value)}
              >
                {adminSegmentPools?.map((pool: any, index: number) => (
                  <MenuItem key={index} value={pool.pool_id}>
                    {pool.pool_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </div>
        <div>
          <h2 className="text-[18px] font-semibold mr-4">
            Segments {'&'} Pricing
          </h2>
          <div className="grid grid-cols-3 gap-2 md:gap-8">
            <div></div>
            <div className="text-center">Infrastructure Fee</div>
            <div className="text-center">Revenue Share</div>
          </div>
          <div>
            {adminSegmentsData?.length > 0 ? (
              adminSegmentsData?.map((segment: any, index: number) => (
                <div
                  key={index}
                  className="grid grid-cols-3 gap-2 md:gap-8 my-8"
                >
                  <p className="my-0 md:pl-24">{segment?.segment_desc}</p>
                  {payload?.[index] !== undefined && (
                    <>
                      <TextField
                        label="Infra Fee"
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
                        defaultValue={
                          payload?.[index]?.infra_rate.toFixed(2) ?? ''
                        }
                        onChange={(e) => {
                          const updatedPayload = [...payload]
                          updatedPayload[index] = {
                            ...updatedPayload[index],
                            infra_rate: Number(e.target.value),
                          }
                          setPayload(updatedPayload)
                        }}
                      />
                      <TextField
                        label="Revenue Share"
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
                        defaultValue={
                          (
                            payload?.[index]?.ppinc_commission_rate * 100
                          ).toFixed(2) ?? ''
                        }
                        onChange={(e) => {
                          const updatedPayload = [...payload]
                          updatedPayload[index] = {
                            ...updatedPayload[index],
                            ppinc_commission_rate: Number(e.target.value) / 100,
                          }
                          setPayload(updatedPayload)
                        }}
                      />
                    </>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center mt-8">No Segments Found!</div>
            )}
          </div>
          <div className="flex justify-end mb-16 md:mb-0">
            <div className="flex">
              <Button
                variant="contained"
                disabled={adminSegmentsData?.length === 0}
                onClick={() => updateSegmentSettings(payload)}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

import { useMemo, useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { signIn, useSession } from 'next-auth/react'
import { useMutation, useQuery } from 'react-query'
import {
  Typography,
  Box,
  Alert,
  TextField,
  FormControl,
  Select,
  Button,
  MenuItem,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Stack,
  AlertTitle,
  Tooltip,
} from '@mui/material'
import axios from 'axios'
import currency from 'currency.js'
import { sanitize } from 'dompurify'
import VisibilityIcon from '@mui/icons-material/Visibility'
import useAccessToken from '../../../../hooks/useAccessToken'

const searchOptions = [
  {
    id: 0,
    title: 'Search by email',
    value: 'email',
  },
  {
    id: 1,
    title: 'Search by username',
    value: 'username',
  },
  {
    id: 2,
    title: 'Search by wallet',
    value: 'wallet',
  },
  {
    id: 3,
    title: 'Search by discord',
    value: 'discord',
  },
]

export const MemberLookUp = () => {
  const { status, data: sessionData } = useSession()
  const accessToken = useAccessToken()
  const router = useRouter()
  const [searchOption, setSearchOption] = useState('')
  const [searchKey, setSearchKey] = useState('')
  const [memberData, setMemberData] = useState([])
  const [error, setError] = useState(false)
  const [noMemberBanner, setNoDataBanner] = useState(false)
  const [tryAgainBanner, setTryAgainBanner] = useState(false)
  const [showResetSuccess, setShowResetSuccess] = useState(false)
  const [showError, setShowError] = useState(false)
  const [errorObj, setErrorObj] =
    useState<{ error: string; message: string[] }>()

  const handleSearchKeyChange = (searchInput: string) => {
    if (searchInput.length < 3) {
      setError(true)
    } else {
      setError(false)
    }
    setSearchKey(searchInput)
  }

  const { mutate: getMemberDetails, isLoading } = useMutation(
    ({
      searchOption,
      searchKey,
    }: {
      searchOption: string
      searchKey: string
    }) =>
      axios.get(`admin-member/lookup?${searchOption}=${searchKey}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }),
    {
      onSuccess: (res) => {
        const data = res.data
        setMemberData(data)
        // setSearchOption('')
        // setSearchKey('')
        if (data.length === 0) {
          setNoDataBanner(true)
        } else {
          setNoDataBanner(false)
        }

        if (data.length > 10) {
          setTryAgainBanner(true)
        }
      },
    }
  )

  const { mutate: resetTwoFactor, isLoading: resettingTwoFA } = useMutation(
    ({ email }: { email: string }) =>
      axios.post(
        `admin-member/reset-2fa`,
        { email },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      ),
    {
      onSuccess: (res) => {
        const data = res.data

        setShowResetSuccess(true)
      },
      onError: (error: any) => {
        setShowError(true)
        setErrorObj(error?.response?.data)
      },
    }
  )

  const formatMemberData = useMemo(() => {
    return memberData && memberData.length
      ? memberData.slice(0, 10).map((item: any) => {
          return {
            ...item,
            staked_balance: currency(item.staked_balance, {
              symbol: '',
              precision: 2,
            }).format(),
          }
        })
      : []
  }, [memberData])

  useEffect(() => {
    const session: any = sessionData

    if (session?.permissions && !session?.permissions?.includes(3)) {
      router.push('manage/dashboard')
    }
  }, [sessionData, router])

  if (status === 'unauthenticated') signIn()

  return (
    <div>
      <div className="my-8">
        <Typography className="text-xl">Member Details Lookup</Typography>
      </div>
      {tryAgainBanner && (
        <div className="max-w-4xl mt-4 mb-8 mx-auto">
          <Alert
            severity="info"
            className="rounded-md info-alert-style text-brand-blue-dark"
            onClose={() => setTryAgainBanner(false)}
          >
            Your search has returned more than 10 records. If the member you are
            looking for is not shown below, please refine and resubmit your
            query.
          </Alert>
        </div>
      )}
      {showResetSuccess && (
        <Stack className="mb-8 mt-8">
          <Alert onClose={() => setShowResetSuccess(false)} severity="success">
            <AlertTitle>Success</AlertTitle>
            <p>2FA has been reset successfully.</p>
          </Alert>
        </Stack>
      )}
      {showError && (
        <Stack className="mb-8 mt-8">
          {errorObj?.error && (
            <Alert
              onClose={() => {
                setErrorObj({ error: '', message: [] })
                setShowError(false)
              }}
              severity="error"
            >
              <AlertTitle>{errorObj?.error}</AlertTitle>
              {typeof errorObj.message === 'string' && (
                <p>{errorObj.message}</p>
              )}
              {Array.isArray(errorObj.message) && (
                <ul className="pl-4">
                  {errorObj.message?.map((message, i) => (
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
      <Box className="md:flex items-center">
        <Box className="w-full md:w-56 md:mr-8">
          <FormControl fullWidth size="small">
            <Select
              className="bg-white"
              labelId="demo-select-small"
              id="vendorId"
              value={searchOption}
              renderValue={() => {
                if (!searchOption) {
                  return <span>Select search option</span>
                }
                return searchOptions.find((so) => so.value === searchOption)
                  ?.title
              }}
              displayEmpty
              onChange={(e) => setSearchOption(e.target.value)}
            >
              {searchOptions.map((sop) => (
                <MenuItem key={sop.id} value={sop.value}>
                  {sop.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <TextField
          label="Enter search key"
          size="small"
          type="text"
          className="w-full md:w-56 mt-4 md:mt-0 bg-white mr-8"
          required
          inputProps={{
            style: {
              padding: 10,
            },
          }}
          value={searchKey}
          onChange={(e) => handleSearchKeyChange(e.target.value)}
        />
        <Button
          className="bg-brand-blue-dark text-white hover:bg-brand-blue-dark w-28 py-2 mt-4 md:mt-0"
          onClick={() =>
            getMemberDetails({
              searchOption: sanitize(searchOption),
              searchKey: sanitize(searchKey),
            })
          }
          disabled={!(searchOption && searchKey) || isLoading || error}
          variant="contained"
        >
          Search
        </Button>
      </Box>
      <Box sx={{ overflow: 'auto', marginTop: '40px' }}>
        <Box sx={{ width: '100%', display: 'table', tableLayout: 'fixed' }}>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead className="bg-brand-blue-dark">
                <TableRow>
                  <TableCell
                    align="center"
                    className="text-white hover:text-white"
                  >
                    Username
                  </TableCell>
                  <TableCell
                    align="center"
                    className="text-white hover:text-white"
                  >
                    Email
                  </TableCell>
                  <TableCell
                    align="center"
                    className="text-white hover:text-white"
                  >
                    Wallet ID
                  </TableCell>
                  <TableCell
                    align="right"
                    className="text-white hover:text-white"
                  >
                    Current Staked Balance
                  </TableCell>
                  <TableCell
                    align="center"
                    className="text-white hover:text-white"
                  >
                    Discord Handle
                  </TableCell>
                  <TableCell
                    align="center"
                    className="text-white hover:text-white"
                  >
                    Reset 2FA
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {formatMemberData.map((mb: any, index: number) => (
                  <TableRow
                    key={index}
                    sx={{
                      '&:last-child td, &:last-child th': { border: 0 },
                    }}
                  >
                    <TableCell align="center">{mb?.username}</TableCell>
                    <TableCell align="center">{mb?.email}</TableCell>
                    <TableCell align="center">{mb?.p_wallet_id}</TableCell>
                    <TableCell align="right">{mb?.staked_balance}</TableCell>
                    <TableCell align="center">{mb?.discord_handle}</TableCell>
                    <TableCell align="center">
                      {mb?.isTwoFactorEnabled && (
                        <Button
                          variant="contained"
                          disabled={resettingTwoFA}
                          onClick={() => resetTwoFactor({ email: mb?.email })}
                        >
                          Reset
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="View Details" placement="top" arrow>
                        <Button
                          className="p-2 bg-brand-blue-dark border-b-0 mx-0 hover:bg-brand-blue-dark"
                          startIcon={
                            <VisibilityIcon className="text-white ml-[10px]" />
                          }
                          onClick={() =>
                            router.push(
                              `/admin/members/member-details?email=${mb?.email}`
                            )
                          }
                        ></Button>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
      <Box className="flex justify-center">
        {noMemberBanner && <p>No member data found!</p>}
      </Box>
    </div>
  )
}

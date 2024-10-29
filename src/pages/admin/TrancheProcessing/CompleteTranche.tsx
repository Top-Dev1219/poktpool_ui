import { useState, useEffect } from 'react'
import { useQuery, useMutation } from 'react-query'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import currency from 'currency.js'
import axios from 'axios'
import {
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  Alert,
  AlertTitle,
  CircularProgress,
} from '@mui/material'
import useUser from '../../../../hooks/useUser'
import { useAuthQuery } from '../../../../hooks/useApi'
import useAccessToken from '../../../../hooks/useAccessToken'
import Button from '../../../../components/Button'
import { StepIndicator } from './StepIndicator'

export const CompleteTranche = () => {
  const accessToken = useAccessToken()
  const { user } = useUser()
  const { status, data: sessionData } = useSession()
  const [error, setErrorObj] = useState<{ error: string; message: string[] }>()
  const [showError, setShowError] = useState(false)
  const [isOnAdmin, setIsOnAdmin] = useState(false)
  const router = useRouter()
  const { refetch: refetchOpenTranche, isRefetching } = useAuthQuery(
    'admin/tranche/current-open'
  )
  const trancheId = router.query.slug

  const { data: trancheTx, isLoading: dataLoading } = useQuery(
    'admin/tranche-transactions',
    () =>
      axios
        .get(`admin/tranche-txs/${trancheId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((res) => res.data),
    {
      enabled: !!accessToken && !!trancheId,
    }
  )

  const { mutate: completeTranche, isLoading: isCompleting } = useMutation(
    ({ trancheId }: { trancheId: number }) =>
      axios.post(
        `admin/complete-tranche`,
        { trancheId },
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
        refetchOpenTranche().then(() => router.push(`/admin/tranche`))
      },
      onError: (error: any) => {
        setShowError(true)
        setErrorObj(error?.response?.data)
      },
    }
  )

  useEffect(() => {
    const session: any = sessionData

    if (session?.permissions && !session?.permissions?.includes(1)) {
      router.push('manage/dashboard')
    }
  }, [sessionData, router])

  if (status === 'unauthenticated') signIn()

  useEffect(() => {
    if (user.permissions && !user.permissions?.includes(5)) {
      router.push('manage/dashboard')
    } else {
      setIsOnAdmin(true)
    }
  }, [user, router])

  return (
    <>
      {showError && (
        <Stack className="my-8">
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
      <div className="flex max-w-5xl mx-auto">
        <StepIndicator />
      </div>
      <div className="my-4 flex justify-between">
        <Typography className="text-xl">Complete Tranche</Typography>
      </div>
      <Box component="main" className="my-10" sx={{ flexGrow: 1 }}>
        {dataLoading ? (
          <CircularProgress />
        ) : (
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead className="bg-brand-blue-dark">
                <TableRow>
                  <TableCell
                    align="center"
                    className="text-white hover:text-white"
                  >
                    From Wallet
                  </TableCell>
                  <TableCell
                    align="center"
                    className="text-white hover:text-white"
                  >
                    To Wallet
                  </TableCell>
                  <TableCell
                    align="center"
                    className="text-white hover:text-white"
                  >
                    Tx Hash
                  </TableCell>
                  <TableCell
                    align="center"
                    className="text-white hover:text-white"
                  >
                    POKT Amount
                  </TableCell>
                  <TableCell
                    align="center"
                    className="text-white hover:text-white"
                  >
                    Transfer Status
                  </TableCell>
                  <TableCell
                    align="center"
                    className="text-white hover:text-white"
                  >
                    Memo
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {trancheTx?.transactions.length ? (
                  trancheTx?.transactions.map((tx: any, index: number) => (
                    <TableRow
                      key={index}
                      sx={{
                        '&:last-child td, &:last-child th': { border: 0 },
                      }}
                    >
                      <TableCell align="center">
                        {tx?.from_wallet?.wallet_name}
                      </TableCell>
                      <TableCell align="center">
                        {tx?.to_wallet?.wallet_name ||
                          tx?.recipient_wallet_address}
                      </TableCell>
                      <TableCell align="center">
                        {tx?.network_txn_hash}
                      </TableCell>
                      <TableCell align="center">
                        {tx?.amount &&
                          currency(Number(tx?.amount) / 1000000, {
                            symbol: '',
                            precision: 2,
                          }).format()}
                      </TableCell>
                      <TableCell
                        align="center"
                        className={
                          tx?.network_txn_status?.toLowerCase() === 'pending'
                            ? 'text-brand-blue-dark'
                            : tx?.network_txn_status?.toLowerCase() ===
                              'success'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }
                      >
                        {tx?.network_txn_status}
                      </TableCell>
                      <TableCell align="center">{tx?.memo}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <div className="text-center flex justify-center">
                    <p>No transaction found!</p>
                  </div>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
      <div>
        <Button
          variant="contained"
          size="large"
          onClick={() => completeTranche({ trancheId: Number(trancheId) })}
          className="flex-shrink-0 py-3 w-8"
          isLoading={isCompleting || isRefetching}
        >
          Complete
        </Button>
      </div>
    </>
  )
}

import { useState, useEffect } from 'react'
import { useQuery } from 'react-query'
import currency from 'currency.js'
import { format } from 'date-fns'
import axios from 'axios'
import { Typography, Box, CircularProgress } from '@mui/material'
import useAccessToken from '../../../../hooks/useAccessToken'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import useUser from '../../../../hooks/useUser'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'

export const WalletDetails = () => {
  const accessToken = useAccessToken()
  const { user, loading: userLoading } = useUser()
  const { status, data: sessionData } = useSession()
  const [date, setDate] = useState(new Date())
  const [isOnAdmin, setIsOnAdmin] = useState(false)
  const [showFullTx, setShowFullTx] = useState(false)
  const excelDate = format(date, 'yyyy-MM-dd HH:mm:ss')
  const router = useRouter()

  const { data: adminWalletDetails, isLoading: dataLoading } = useQuery(
    'admin/wallet-details',
    () =>
      axios
        .get(`admin-wallets/details/${router.query.slug}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((res) => res.data),
    {
      enabled: !!accessToken,
    }
  )

  useEffect(() => {
    const session: any = sessionData

    if (session?.permissions && !session?.permissions?.includes(7)) {
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
      <div className="container mx-auto">
        <div className="my-4 flex justify-between">
          <Typography className="text-xl">Wallet Details</Typography>
          <h3 className="my-0 break-words">
            {adminWalletDetails?.wallet?.wallet_address}
          </h3>
        </div>
        <div className="md:grid grid-cols-4 gap-8 mb-8">
          <div className="p-4 bg-white rounded-md shadow-md">
            <p className="my-1">Wallet Name</p>
            <h4 className="my-0 break-words">
              {adminWalletDetails?.wallet?.wallet_name}
            </h4>
          </div>
          <div className="p-4 mt-4 md:mt-0 bg-white rounded-md shadow-md">
            <p className="my-1">Balance</p>
            <h2 className="my-0">
              {adminWalletDetails?.wallet?.balance &&
                currency(
                  Number(adminWalletDetails?.wallet?.balance) / 1000000,
                  {
                    symbol: '',
                    precision: 2,
                  }
                ).format()}
            </h2>
          </div>
          <div className="p-4 mt-4 md:mt-0 bg-white rounded-md shadow-md">
            <p className="my-1">Number of Tx</p>
            <h2 className="my-0">{adminWalletDetails?.total_txs}</h2>
          </div>
          <div className="p-4 mt-4 md:mt-0 bg-white rounded-md shadow-md">
            <p className="my-1">Block Last Updated</p>
            <h2 className="my-0">{adminWalletDetails?.blockId}</h2>
          </div>
        </div>
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
                    Tx Hash
                  </TableCell>
                  <TableCell
                    align="center"
                    className="text-white hover:text-white"
                  >
                    Block
                  </TableCell>
                  <TableCell
                    align="center"
                    className="text-white hover:text-white"
                  >
                    Memo
                  </TableCell>
                  <TableCell
                    align="center"
                    className="text-white hover:text-white"
                  >
                    From Wallet
                  </TableCell>
                  <TableCell
                    align="right"
                    className="text-white hover:text-white"
                  >
                    Fee (only for Outs)
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
                    In/Out
                  </TableCell>
                  <TableCell
                    align="center"
                    className="text-white hover:text-white"
                  >
                    Tx Result
                  </TableCell>
                  <TableCell
                    align="right"
                    className="text-white hover:text-white"
                  >
                    Amount
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {adminWalletDetails?.txs.length ? (
                  adminWalletDetails?.txs.map((tx: any, index: number) => (
                    <TableRow
                      key={index}
                      sx={{
                        '&:last-child td, &:last-child th': { border: 0 },
                      }}
                    >
                      <TableCell
                        align="center"
                        onClick={() => setShowFullTx(!showFullTx)}
                      >
                        {showFullTx
                          ? tx?.hash
                          : `...${(tx?.hash ? tx?.hash : '')?.slice(-8)}`}
                      </TableCell>
                      <TableCell align="center">{tx?.block_height}</TableCell>
                      <TableCell align="center">{tx?.memo}</TableCell>
                      <TableCell align="right">
                        {tx?.from_wallet_address}
                      </TableCell>
                      <TableCell align="right">
                        {tx?.fee_amount &&
                          currency(Number(tx?.fee_amount) / 1000000, {
                            symbol: '',
                            precision: 2,
                          }).format()}
                      </TableCell>
                      <TableCell align="right">
                        {tx?.to_wallet_address}
                      </TableCell>
                      <TableCell align="right">
                        {tx?.received ? 'In' : 'Out'}
                      </TableCell>
                      <TableCell
                        align="right"
                        className={
                          tx?.result === 'SUCCESS'
                            ? 'text-green-700'
                            : tx?.result === 'FAILED'
                            ? 'text-red-700'
                            : 'text-brand-blue-dark'
                        }
                      >
                        {tx?.result}
                      </TableCell>
                      <TableCell align="right">
                        {tx?.amount &&
                          currency(Number(tx?.amount) / 1000000, {
                            symbol: '',
                            precision: 2,
                          }).format()}
                      </TableCell>
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
      </div>
    </>
  )
}

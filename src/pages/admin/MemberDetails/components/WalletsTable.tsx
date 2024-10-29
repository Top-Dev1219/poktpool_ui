import { useMemo } from 'react'
import { useQuery } from 'react-query'
import axios from 'axios'
import currency from 'currency.js'
import {
  Table,
  TableContainer,
  Paper,
  TableRow,
  TableBody,
  TableHead,
  TableCell,
  CircularProgress,
} from '@mui/material'
import { getUnixTime, format } from 'date-fns'
import { formatUTCDate } from '../../../../utils/time'
import useAccessToken from '../../../../../hooks/useAccessToken'
import { MemberDetailTable } from './MemberDetailTable'

const activeHeaders = [
  {
    id: 1,
    label: 'Wallet Address',
    key: 'p_wallet_id',
  },
  {
    id: 2,
    label: 'Nickname',
    key: 'wallet_nickname',
  },
  {
    id: 3,
    label: 'Active Balance',
    key: 'staked_amount',
  },
]

const pendingHeaders = [
  {
    id: 1,
    label: 'Wallet Address',
    key: 'wallet_address',
  },
  {
    id: 2,
    label: 'Nickname',
    key: 'wallet_nickname',
  },
  {
    id: 3,
    label: 'Status',
    key: 'req_status',
  },
]

export const WalletsTable = ({ email }: { email?: string }) => {
  const accessToken = useAccessToken()

  const { data, refetch, isLoading } = useQuery(
    ['admin-member/wallets', email],
    () =>
      axios
        .get(`admin-member/wallets?email=${email}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((res) => res.data),
    {
      enabled: !!accessToken && !!email,
    }
  )

  const formattedActiveData = useMemo(() => {
    return data?.active && data?.active.length
      ? data.active
          .sort((a: any, b: any) => {
            return (
              getUnixTime(new Date(b.created_on)) -
              getUnixTime(new Date(a.created_on))
            )
          })
          .map((item: any) => {
            return {
              ...item,
              staked_amount: currency(item.staked_amount, {
                symbol: '',
                precision: 2,
              }).format(),
              pending_stakes: currency(item.pending_stakes, {
                symbol: '',
                precision: 2,
              }).format(),
            }
          })
      : []
  }, [data?.active])

  return (
    <>
      <div>
        <h3>Active Wallets</h3>
        {isLoading ? (
          <div className="flex justify-center">
            <CircularProgress />
          </div>
        ) : (
          <MemberDetailTable
            headers={activeHeaders}
            contentData={formattedActiveData ? formattedActiveData : []}
          />
        )}
      </div>
      <div>
        <h3>Pending Wallets</h3>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 700 }} aria-label="customized table">
            <TableHead className="bg-brand-blue-dark">
              <TableRow>
                <TableCell
                  className="text-white hover:text-white max-w-[100px]"
                  align="center"
                >
                  Wallet ID
                </TableCell>
                <TableCell
                  className="text-white hover:text-white max-w-[100px]"
                  align="center"
                >
                  Nickname
                </TableCell>
                <TableCell
                  className="text-white hover:text-white max-w-[100px]"
                  align="center"
                >
                  Status
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <div className="flex justify-center">
                  <CircularProgress />
                </div>
              ) : (
                data?.pending &&
                data?.pending.map((row: any) => (
                  <TableRow key={row.wallet_address}>
                    <TableCell align="center" component="th" scope="row">
                      {row.wallet_address}
                    </TableCell>
                    <TableCell align="center">{row.wallet_nickname}</TableCell>
                    <TableCell
                      align="center"
                      className={
                        row.req_status === 'Pending'
                          ? 'text-amber-500'
                          : 'text-red-600'
                      }
                    >
                      {row.req_status === 'Pending'
                        ? 'Pending Verification'
                        : 'Verification failed'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </>
  )
}

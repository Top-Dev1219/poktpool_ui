import { useMemo } from 'react'
import { useQuery } from 'react-query'
import axios from 'axios'
import currency from 'currency.js'
import { getUnixTime, format } from 'date-fns'
import { CircularProgress } from '@mui/material'
import { formatUTCDate } from '../../../../utils/time'
import useAccessToken from '../../../../../hooks/useAccessToken'
import { MemberDetailTable } from './MemberDetailTable'

const headers = [
  {
    id: 1,
    label: 'Date & Time',
    key: 'sweep_req_date',
  },
  {
    id: 2,
    label: 'Status',
    key: 'status',
  },
  {
    id: 3,
    label: 'Wallet Address',
    key: 'recipient_wallet_id',
  },
  {
    id: 4,
    label: 'Transaction Hash',
    key: 'network_txn_id',
  },
  {
    id: 5,
    label: 'POKT Amount',
    key: 'pokt_amount',
    type: 'number',
  },
]

export const SweepsTable = ({ searchWallet }: { searchWallet: string }) => {
  const accessToken = useAccessToken()

  const { data, refetch, isLoading } = useQuery(
    ['admin-member/sweeps', searchWallet],
    () =>
      axios
        .get(`admin-member/sweeps?customerId=${searchWallet}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((res) => res.data),
    {
      enabled: !!accessToken && !!searchWallet,
    }
  )

  const formattedData = useMemo(() => {
    return data && data.length
      ? data
          .sort((a: any, b: any) => {
            return (
              getUnixTime(new Date(b.sweep_req_date)) -
              getUnixTime(new Date(a.sweep_req_date))
            )
          })
          .map((item: any) => {
            return {
              ...item,
              sweep_req_date: format(
                formatUTCDate(item?.sweep_req_date),
                'yyyy-MM-dd HH:mm:ss'
              ),
              pokt_amount: currency(item.pokt_amount, {
                symbol: '',
                precision: 2,
              }).format(),
            }
          })
      : []
  }, [data])

  return (
    <>
      {isLoading ? (
        <div className="flex justify-center">
          <CircularProgress />
        </div>
      ) : (
        <MemberDetailTable
          headers={headers}
          contentData={formattedData ? formattedData : []}
        />
      )}
    </>
  )
}

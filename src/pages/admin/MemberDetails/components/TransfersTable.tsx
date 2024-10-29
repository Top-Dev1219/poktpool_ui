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
    key: 'transfer_timestamp',
  },
  {
    id: 2,
    label: 'In/Out',
    key: 'direction',
  },
  {
    id: 3,
    label: 'Wallet Address',
    key: 'to_wallet_id',
  },
  {
    id: 4,
    label: 'Memo',
    key: 'memo',
  },
  {
    id: 5,
    label: 'POKT Amount',
    key: 'pokt_amount',
    type: 'number',
  },
]

export const TransfersTable = ({ searchWallet }: { searchWallet: string }) => {
  const accessToken = useAccessToken()

  const { data, refetch, isLoading } = useQuery(
    ['admin-member/transfers', searchWallet],
    () =>
      axios
        .get(`admin-member/transfers?customerId=${searchWallet}`, {
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
      ? data.map((item: any) => {
          return {
            ...item,
            transfer_timestamp: format(
              formatUTCDate(item.transfer_timestamp),
              'yyyy-MM-dd HH:mm:ss'
            ),
            from_balance: item.from_balance,
            to_wallet_id: item.to_wallet_id,
            memo: item.memo,
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

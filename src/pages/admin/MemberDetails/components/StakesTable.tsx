import { useMemo } from 'react'
import { useQuery } from 'react-query'
import axios from 'axios'
import currency from 'currency.js'
import { CircularProgress } from '@mui/material'
import { getUnixTime, format } from 'date-fns'
import { formatUTCDate } from '../../../../utils/time'
import useAccessToken from '../../../../../hooks/useAccessToken'
import { MemberDetailTable } from './MemberDetailTable'

const headers = [
  {
    id: 1,
    label: 'Date & Time',
    key: 'txn_timestamp',
  },
  {
    id: 2,
    label: 'Status',
    key: 'verification_details',
  },
  {
    id: 3,
    label: 'Transaction Hash',
    key: 'network_txn_id',
  },
  {
    id: 4,
    label: 'POKT Amount',
    key: 'pokt_amount',
    type: 'number',
  },
]

export const StakesTable = ({ searchWallet }: { searchWallet: string }) => {
  const accessToken = useAccessToken()

  const { data, refetch, isLoading } = useQuery(
    ['admin-member/stakes', searchWallet],
    () =>
      axios
        .get(`admin-member/stakes?customerId=${searchWallet}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((res) => res.data),
    {
      enabled: !!accessToken && !!searchWallet,
    }
  )

  const formatStakeData = useMemo(() => {
    return data && data.length
      ? data
          .sort((a: any, b: any) => {
            return (
              getUnixTime(new Date(b.txn_timestamp)) -
              getUnixTime(new Date(a.txn_timestamp))
            )
          })
          .map((item: any) => {
            return {
              ...item,
              txn_timestamp: format(
                formatUTCDate(item?.txn_timestamp),
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
          contentData={formatStakeData ? formatStakeData : []}
        />
      )}
    </>
  )
}

import { useMemo, useState, useEffect } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useQuery } from 'react-query'
import axios from 'axios'
import { format } from 'date-fns'
import currency from 'currency.js'
import {
  Typography,
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Box,
} from '@mui/material'
import { CSVLink } from 'react-csv'
import { formatUTCDate } from '../../../utils/time'
import useAccessToken from '../../../../hooks/useAccessToken'

const SweepTxHeaders = [
  { label: 'From Wallet', key: 'from_wallet' },
  { label: 'To Wallet', key: 'to_wallet' },
  { label: 'Transaction Hash', key: 'network_txn_hash' },
  { label: 'POKT Amount', key: 'amount' },
  { label: 'Transfer Status', key: 'network_txn_status' },
]

const DistributionTxHeaders = [
  { label: 'From Wallet', key: 'from_wallet' },
  { label: 'To Wallet', key: 'to_wallet' },
  { label: 'Transaction Hash', key: 'network_txn_hash' },
  { label: 'POKT Amount', key: 'amount' },
  { label: 'Transfer Status', key: 'network_txn_status' },
  { label: 'Memo', key: 'memo' },
]

const poktCurrency = {
  precision: 2,
  symbol: '',
}

const formatPokt = (amount: number) => currency(amount, poktCurrency).format()

export const TrancheDetails = () => {
  const router = useRouter()
  const { status, data: sessionData } = useSession()
  const accessToken = useAccessToken()
  const trancheId = router.query.tranche_id
  const [date, setDate] = useState(new Date())
  const excelDate = format(date, 'yyyy-MM-dd HH:mm:ss')

  const { data: trancheData, isLoading: dataLoading } = useQuery(
    'admin-tranche/details',
    () =>
      axios
        .get(`admin-tranche/details/${trancheId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((res) => res.data),
    {
      enabled: !!accessToken && !!trancheId,
    }
  )

  const checkTxStatus = (transaction: any) => {
    if (!transaction?.txn_success) {
      return 'Failed'
    } else {
      if (transaction?.network_txn_hash) {
        return transaction?.network_txn_status
      }
    }
  }

  const formattedSweepTx = useMemo(() => {
    return trancheData?.transactions && trancheData?.transactions.length
      ? trancheData?.transactions
          .filter(
            (item: any) =>
              item?.chain_txn_type_code === 8 || item?.chain_txn_type_code === 9
          )
          .map((tx: any) => {
            return {
              ...tx,
              from_wallet: tx?.from_wallet?.wallet_name,
              to_wallet:
                tx?.to_wallet?.wallet_name || tx?.recipient_wallet_address,
              amount: currency(Number(tx?.amount) / 1000000, {
                precision: 2,
                symbol: '',
              }).format(),
            }
          })
      : []
  }, [trancheData])

  const formattedDistributionTx = useMemo(() => {
    return trancheData?.transactions && trancheData?.transactions.length
      ? trancheData?.transactions
          .filter(
            (item: any) =>
              item?.chain_txn_type_code !== 8 && item?.chain_txn_type_code !== 9
          )
          .map((tx: any) => {
            return {
              ...tx,
              from_wallet: tx?.from_wallet?.wallet_name,
              to_wallet:
                tx?.to_wallet?.wallet_name || tx?.recipient_wallet_address,
              amount: currency(Number(tx?.amount) / 1000000, {
                precision: 2,
                symbol: '',
              }).format(),
            }
          })
      : []
  }, [trancheData])

  useEffect(() => {
    const session: any = sessionData

    if (session?.permissions && !session?.permissions?.includes(8)) {
      router.push('manage/dashboard')
    }
  }, [sessionData])

  if (status === 'unauthenticated') signIn()

  return (
    <>
      <Typography className="text-xl">Closed Tranches</Typography>
      <div>
        <div className="my-4 flex justify-between">
          <h2 className="text-xl">Tranche Stats</h2>
        </div>
        <Box sx={{ overflow: 'auto' }}>
          <Box sx={{ width: '100%', display: 'table', tableLayout: 'fixed' }}>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead className="bg-brand-blue-dark text-white">
                  <TableRow>
                    <TableCell
                      align="center"
                      rowSpan={2}
                      className="py-0 text-white"
                    >
                      Tranche
                      <br />
                      End
                    </TableCell>
                    <TableCell
                      align="center"
                      rowSpan={2}
                      className="py-0 text-white"
                    >
                      Exchange
                      <br />
                      Rate
                    </TableCell>
                    <TableCell
                      align="center"
                      rowSpan={2}
                      className="py-0 text-white"
                    >
                      Infra
                      <br />
                      Fees
                    </TableCell>
                    <TableCell
                      align="center"
                      rowSpan={2}
                      className="py-0 text-white"
                    >
                      Gross
                      <br />
                      Rewards
                    </TableCell>
                    <TableCell
                      align="center"
                      colSpan={2}
                      className="border-b-0 pt-1 pb-0 text-white"
                    >
                      Incoming Unstakes
                    </TableCell>
                    <TableCell
                      align="center"
                      rowSpan={2}
                      className="py-0 text-white"
                    >
                      Sweeps
                    </TableCell>
                    <TableCell
                      align="center"
                      rowSpan={2}
                      className="py-0 text-white"
                    >
                      Unstakes
                      <br />
                      to send
                    </TableCell>
                    <TableCell
                      align="center"
                      rowSpan={2}
                      className="py-0 text-white"
                    >
                      Rollovers
                    </TableCell>
                    <TableCell
                      align="center"
                      rowSpan={2}
                      className="py-0 text-white"
                    >
                      Injections
                    </TableCell>
                    <TableCell
                      align="center"
                      rowSpan={2}
                      className="py-0 text-white"
                    >
                      Total Incoming POKT
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell align="center" className="pt-0 pb-1 text-white">
                      (from balance)
                    </TableCell>
                    <TableCell align="center" className="pt-0 pb-1 text-white">
                      (from rewards)
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell align="center" component="th" scope="row">
                      {trancheData?.tranche_stats?.tranche_end &&
                        format(
                          formatUTCDate(
                            trancheData?.tranche_stats?.tranche_end
                          ),
                          'yyyy-MM-dd HH:mm:ss'
                        )}
                    </TableCell>
                    <TableCell align="center">
                      ${trancheData?.tranche_stats?.exchange_rate}
                    </TableCell>
                    <TableCell align="center">
                      {trancheData?.tranche_stats?.infrastructure_fees &&
                        formatPokt(
                          trancheData?.tranche_stats?.infrastructure_fees
                        )}
                    </TableCell>
                    <TableCell align="center">
                      {trancheData?.tranche_stats?.gross_rewards &&
                        formatPokt(trancheData?.tranche_stats?.gross_rewards)}
                    </TableCell>
                    <TableCell align="center">
                      {trancheData?.tranche_stats?.commissions &&
                        formatPokt(trancheData?.tranche_stats?.commissions)}
                    </TableCell>
                    <TableCell align="center">
                      {trancheData?.tranche_stats?.balance_unstaked &&
                        formatPokt(
                          trancheData?.tranche_stats?.balance_unstaked
                        )}
                    </TableCell>
                    <TableCell align="center">
                      {trancheData?.tranche_stats?.sweeps_tosend &&
                        formatPokt(trancheData?.tranche_stats?.sweeps_tosend)}
                    </TableCell>
                    <TableCell align="center">
                      {trancheData?.tranche_stats?.unstakes_tosend &&
                        formatPokt(trancheData?.tranche_stats?.unstakes_tosend)}
                    </TableCell>
                    <TableCell align="center">
                      {trancheData?.tranche_stats?.rollovers &&
                        formatPokt(trancheData?.tranche_stats?.rollovers)}
                    </TableCell>
                    <TableCell align="center">
                      {trancheData?.tranche_stats?.new_equity_injected &&
                        formatPokt(
                          trancheData?.tranche_stats?.new_equity_injected
                        )}
                    </TableCell>
                    <TableCell align="center">
                      {trancheData?.tranche_stats?.total_incoming_equity &&
                        formatPokt(
                          trancheData?.tranche_stats?.total_incoming_equity
                        )}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
        {/* <TrancheTable /> */}
      </div>

      <div className="mt-16">
        <div className="my-4 md:flex justify-between items-center">
          <h2 className="text-xl">Provider Sweep Transactions</h2>
          <div className="my-4 md:my-0">
            <CSVLink
              data={formattedSweepTx}
              filename={`provider-sweeps-txs-${excelDate}.csv`}
              className="btn bg-brand-blue-dark text-white py-3 px-4 rounded"
              target="_blank"
              headers={SweepTxHeaders}
              onClick={() => setDate(new Date())}
            >
              Download CSV
            </CSVLink>
          </div>
        </div>
        <Box sx={{ overflow: 'auto' }}>
          <Box sx={{ width: '100%', display: 'table', tableLayout: 'fixed' }}>
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
                      Transaction Hash
                    </TableCell>
                    <TableCell
                      align="right"
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
                  </TableRow>
                </TableHead>
                <TableBody>
                  {trancheData?.transactions
                    .filter(
                      (item: any) =>
                        item?.chain_txn_type_code === 8 ||
                        item?.chain_txn_type_code === 9
                    )
                    .map((transaction: any, index: number) => (
                      <TableRow
                        key={index}
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                        }}
                      >
                        <TableCell align="center">
                          {transaction?.from_wallet?.wallet_name}
                        </TableCell>
                        <TableCell align="center">
                          {transaction?.to_wallet?.wallet_name ||
                            transaction?.recipient_wallet_address}
                        </TableCell>
                        <TableCell align="center">
                          {transaction?.network_txn_hash}
                        </TableCell>
                        <TableCell align="right">
                          {transaction?.amount &&
                            currency(Number(transaction?.amount) / 1000000, {
                              precision: 2,
                              symbol: '',
                            }).format()}
                        </TableCell>
                        <TableCell
                          align="center"
                          className={
                            transaction?.network_txn_status === 'SUCCESS'
                              ? 'text-green-700'
                              : 'text-brand-blue-dark'
                          }
                        >
                          {transaction?.network_txn_status}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
      </div>

      <div className="mt-16">
        <div className="my-4 md:flex justify-between items-center">
          <h2 className="text-xl">Tranche Distribution Transactions</h2>
          <div>
            <CSVLink
              data={formattedDistributionTx}
              filename={`tranche-distribution-txs-${excelDate}.csv`}
              className="btn bg-brand-blue-dark text-white py-3 px-4 rounded"
              target="_blank"
              headers={DistributionTxHeaders}
              onClick={() => setDate(new Date())}
            >
              Download CSV
            </CSVLink>
          </div>
        </div>
        <Box sx={{ overflow: 'auto' }}>
          <Box sx={{ width: '100%', display: 'table', tableLayout: 'fixed' }}>
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
                  {trancheData?.transactions
                    .filter(
                      (item: any) =>
                        item?.chain_txn_type_code !== 8 &&
                        item?.chain_txn_type_code !== 9
                    )
                    .map((tx: any, index: number) => (
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
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
      </div>
    </>
  )
}

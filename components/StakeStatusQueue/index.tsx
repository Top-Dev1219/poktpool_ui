import { FC, useState } from 'react'
import { format, getUnixTime } from 'date-fns'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material'
import currency from 'currency.js'
import { formatUTCDate } from '../../src/utils/time'

export type Stake = {
  bucket_desc: string
  txn_timestamp: string
  network_txn_id: string
  txn_type_code: number
  txn_type_desc: string
  amount: string
  pokt_amount: string
  verification_code: number
  verification_desc: string
}

export const StakeStatusQueue: FC<{ queue: Stake[] }> = ({ queue }) => {
  const [showFullTx, setShowFullTx] = useState(false)
  return (
    <>
      {queue.length > 0 ? (
        <TableContainer component={Paper} className="mb-16 not-prose">
          <Table sx={{ minWidth: 650 }} aria-label="Stake status queue table">
            <TableHead>
              <TableRow className="bg-brand-blue-dark">
                <TableCell align="center">
                  <span className="text-white">Date</span>
                </TableCell>
                <TableCell align="center">
                  <span className="text-white">Status</span>
                </TableCell>
                <TableCell align="center">
                  <span className="text-white">Transaction ID</span>
                </TableCell>
                <TableCell align="center">
                  <span className="text-white">POKT Amount</span>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {queue
                .sort(
                  (a, b) =>
                    getUnixTime(new Date(b.txn_timestamp)) -
                    getUnixTime(new Date(a.txn_timestamp))
                )
                .map(
                  ({
                    network_txn_id,
                    txn_type_desc,
                    txn_timestamp,
                    amount,
                    pokt_amount,
                    verification_code,
                    verification_desc,
                  }) => (
                    <TableRow
                      key={network_txn_id}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell align="center">
                        {txn_timestamp &&
                          format(
                            formatUTCDate(txn_timestamp),
                            'yyyy-MM-dd HH:mm:ss'
                          )}
                      </TableCell>
                      <TableCell align="center">{verification_desc}</TableCell>
                      <TableCell
                        align="center"
                        onClick={() => setShowFullTx(!showFullTx)}
                      >
                        {showFullTx
                          ? network_txn_id
                          : `...${(network_txn_id ? network_txn_id : '')?.slice(
                              -8
                            )}`}
                      </TableCell>
                      <TableCell align={amount ? 'right' : 'center'}>
                        {Number(pokt_amount) > 0 ? (
                          currency(pokt_amount, {
                            precision: 2,
                            symbol: '',
                          }).format()
                        ) : (
                          <span
                            dangerouslySetInnerHTML={{ __html: '&mdash;' }}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  )
                )}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <p className="text-center">No stakes requests found.</p>
      )}
    </>
  )
}

export default StakeStatusQueue

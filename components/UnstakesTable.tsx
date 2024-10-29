import { ChevronRight } from '@mui/icons-material'
import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import currency from 'currency.js'
import { format, parseISO } from 'date-fns'
import React, { useState } from 'react'
import { Unstake } from '../pages/manage/_unstake'
import { formatUTCDate } from '../src/utils/time'

export default function UnstakesTable({
  onCancelUnstake,
  data,
}: {
  onCancelUnstake: (unstake_req_id: number) => void
  data: Unstake[]
}) {
  const [showFullTx, setShowFullTx] = useState(false)
  const [expanded, setExpanded] = useState<number[]>([])
  const [selectedRequest, setSelectedRequest] = useState<number>()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleExpandClick = (id: number) =>
    setExpanded(
      expanded.includes(id)
        ? expanded.filter((i) => i !== id)
        : [...expanded, id]
    )

  return (
    <>
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <DialogTitle>Cancel Unstake Request</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel this unstake request?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setIsModalOpen(false)}>
            No
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              if (selectedRequest) {
                onCancelUnstake(selectedRequest)
                setIsModalOpen(false)
              }
            }}
          >
            Yes, Cancel My Unstake
          </Button>
        </DialogActions>
      </Dialog>
      {data?.length > 0 ? (
        <TableContainer component={Paper} className="mb-16 not-prose">
          <Table sx={{ minWidth: 650 }} aria-label="Stake status queue table">
            <TableHead>
              <TableRow className="bg-brand-blue-dark">
                <TableCell align="center">
                  <span className="text-white">Request Date</span>
                </TableCell>
                <TableCell align="center">
                  <span className="text-white">Status</span>
                </TableCell>
                <TableCell align="center">
                  <span className="text-white">Due</span>
                </TableCell>
                <TableCell align="center">
                  <span className="text-white">Transaction</span>
                </TableCell>
                <TableCell align="right">
                  <span className="text-white">Amount</span>
                </TableCell>
                <TableCell align="center">
                  <span className="text-white">Percent</span>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map(
                ({
                  perc_unstake,
                  unstake_cancelled,
                  unstake_complete,
                  unstake_due_date,
                  unstake_pokt_amount,
                  unstake_req_date,
                  unstake_req_id,
                  unstake_process_date,
                  txns = [],
                }) => {
                  const status = (() => {
                    switch (true) {
                      case !unstake_cancelled && !unstake_complete:
                        return 'pending'
                      case unstake_cancelled && unstake_complete:
                        return 'cancelled'
                      case !unstake_cancelled && unstake_complete:
                        return 'complete'
                      default:
                        return ''
                    }
                  })()

                  const statusChip = (() => {
                    switch (status) {
                      case 'pending':
                        return (
                          <Chip
                            color="info"
                            label="Pending"
                            size="small"
                            onDelete={() => {
                              setSelectedRequest(unstake_req_id)
                              setIsModalOpen(true)
                            }}
                          />
                        )
                      case 'cancelled':
                        return (
                          <Chip color="error" label="Cancelled" size="small" />
                        )
                      case 'complete':
                        return (
                          <Chip color="primary" label="Complete" size="small" />
                        )
                      default:
                        return ''
                    }
                  })()

                  return (
                    <React.Fragment key={unstake_req_id}>
                      <TableRow key={unstake_req_id}>
                        <TableCell align="center">
                          {unstake_req_date &&
                            format(
                              formatUTCDate(unstake_req_date),
                              'yyyy-MM-dd HH:mm'
                            )}
                        </TableCell>
                        <TableCell align="center">{statusChip}</TableCell>
                        <TableCell align="center">
                          {unstake_due_date &&
                            format(parseISO(unstake_due_date), 'yyyy-MM-dd')}
                        </TableCell>
                        <TableCell align="center">
                          {txns.length === 1 && (
                            <span onClick={() => setShowFullTx(!showFullTx)}>
                              {showFullTx
                                ? txns[0].network_txn_id
                                : `...${(txns[0].network_txn_id
                                    ? txns[0].network_txn_id
                                    : ''
                                  )?.slice(-8)}`}
                            </span>
                          )}
                          {txns.length > 1 && (
                            <Chip
                              deleteIcon={
                                <ChevronRight
                                  className="transition"
                                  style={{
                                    transform: `rotate(${
                                      expanded.includes(unstake_req_id)
                                        ? 270
                                        : 90
                                    }deg)`,
                                    transformOrigin: 'center',
                                  }}
                                />
                              }
                              label="Multiple"
                              onDelete={() => handleExpandClick(unstake_req_id)}
                            />
                          )}
                        </TableCell>
                        <TableCell align="right">
                          {unstake_pokt_amount && unstake_process_date
                            ? currency(unstake_pokt_amount).format({
                                symbol: '',
                              })
                            : 'Not Available Yet'}
                        </TableCell>
                        <TableCell align="right">
                          {`${+perc_unstake * 100}%`}
                        </TableCell>
                      </TableRow>
                      {txns.length > 1 &&
                        expanded.includes(unstake_req_id) &&
                        txns.map(({ network_txn_id, pokt_amount }) => {
                          return (
                            <TableRow key={network_txn_id}>
                              <TableCell align="center"></TableCell>
                              <TableCell align="center"></TableCell>
                              <TableCell align="center">
                                {unstake_due_date &&
                                  format(
                                    parseISO(unstake_due_date),
                                    'yyyy-MM-dd'
                                  )}
                              </TableCell>
                              <TableCell
                                align="center"
                                onClick={() => setShowFullTx(!showFullTx)}
                              >
                                {showFullTx
                                  ? network_txn_id
                                  : `...${(network_txn_id
                                      ? network_txn_id
                                      : ''
                                    )?.slice(-8)}`}
                              </TableCell>
                              <TableCell align="right">
                                {pokt_amount
                                  ? currency(pokt_amount).format({
                                      symbol: '',
                                    })
                                  : 'Not Available Yet'}
                              </TableCell>
                              <TableCell align="right"></TableCell>
                            </TableRow>
                          )
                        })}
                    </React.Fragment>
                  )
                }
              )}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <p>No unstakes found.</p>
      )}
    </>
  )
}

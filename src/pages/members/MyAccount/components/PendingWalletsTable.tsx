import * as React from 'react'
import { styled } from '@mui/material/styles'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell, { tableCellClasses } from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import { CircularProgress } from '@mui/material'
import Button from '../../../../../components/Button'

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: '#0465FF',
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}))

interface PendingWalletsType {
  isLoading: boolean
  pendingWallets: any[]
  retryAddWallet: ({ verf_req_id }: { verf_req_id: string }) => void
}

export const PendingWalletsTable = (props: PendingWalletsType) => {
  const { isLoading, pendingWallets, retryAddWallet } = props

  return (
    <>
      {isLoading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 700 }} aria-label="customized table">
            <TableHead>
              <TableRow>
                <StyledTableCell align="center">Wallet ID</StyledTableCell>
                <StyledTableCell align="center">Nickname</StyledTableCell>
                <StyledTableCell align="center">Status</StyledTableCell>
                <StyledTableCell align="center">Action</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pendingWallets &&
                pendingWallets.map((row: any) => (
                  <TableRow key={row.wallet_address}>
                    <StyledTableCell align="center" component="th" scope="row">
                      {row.wallet_address}
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      {row.wallet_nickname}
                    </StyledTableCell>
                    <StyledTableCell
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
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      <Button
                        variant="contained"
                        disabled={row.req_status === 'Pending'}
                        onClick={() =>
                          retryAddWallet({ verf_req_id: row.verf_req_id })
                        }
                      >
                        Retry
                      </Button>
                    </StyledTableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </>
  )
}

import * as React from 'react'
import Button from '@mui/material/Button'
import { useRouter } from 'next/router'
import { styled } from '@mui/material/styles'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import Typography from '@mui/material/Typography'
import { ScrollView } from '..'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableRow from '@mui/material/TableRow'
import { PoolItemModel } from './PoolItem'

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}))

export interface DialogTitleProps {
  id: string
  children?: React.ReactNode
  handleClose: () => void
  open: boolean
}

interface PoolDialogProps {
  poolItem: PoolItemModel
  handleClose: () => void
  open: boolean
}

const BootstrapDialogTitle = (props: DialogTitleProps) => {
  const { children, handleClose, ...other } = props

  return (
    <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
      {children}
      {handleClose ? (
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </DialogTitle>
  )
}

export const PoolDetailModal = (props: PoolDialogProps) => {
  const { poolItem, handleClose, open } = props
  const router = useRouter()

  const goToReport = (poolName: string) => {
    router.push({
      pathname: '/admin/node-report',
      query: { poolName: poolName },
    })
  }
  return (
    <div>
      <BootstrapDialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
      >
        <BootstrapDialogTitle
          id="customized-dialog-title"
          handleClose={handleClose}
          open={open}
        >
          {poolItem.pool_name} Details
        </BootstrapDialogTitle>
        <DialogContent dividers>
          <ScrollView>
            <TableContainer className="w-full min-w-full">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell>Pool name:</TableCell>
                    <TableCell>{poolItem.pool_name}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Performance:</TableCell>
                    <TableCell>{poolItem.performance}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell># of active nodes:</TableCell>
                    <TableCell>{poolItem.active_nodes}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell># of jailed nodes:</TableCell>
                    <TableCell>{poolItem.jailed_nodes}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Providers:</TableCell>
                    <TableCell>{poolItem.providers.join(', ')}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Accounts:</TableCell>
                    <TableCell>{poolItem.accounts}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Staked amounts:</TableCell>
                    <TableCell>{poolItem.staked_amount}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Supported chains:</TableCell>
                    <TableCell>{poolItem.supported_chains}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>POKT earned in 24 hrs:</TableCell>
                    <TableCell>{poolItem.pokt_earned_in_24}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Minted:</TableCell>
                    <TableCell>{poolItem.minted}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </ScrollView>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={() => goToReport(poolItem.pool_name)}>
            Go to details
          </Button>
        </DialogActions>
      </BootstrapDialog>
    </div>
  )
}

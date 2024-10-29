import { useState } from 'react'
import Typography from '@mui/material/Typography'
import Link from '@mui/material/Link'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import { PoolDetailModal } from './PoolDetailModal'

export interface PoolItemModel {
  id: string | number
  pool_name: string
  performance: string
  active_nodes: string | number
  jailed_nodes: string | number
  providers: string[]
  accounts: string
  staked_amount: string | number
  supported_chains: string
  pokt_earned_in_24: string | number
  minted: string | number
}

interface PoolItemProps {
  poolItem: PoolItemModel
}

export const PoolItem = (props: PoolItemProps) => {
  const { poolItem } = props
  const [open, setOpen] = useState(false)

  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  return (
    <>
      <Typography>
        Pool name: <strong>{poolItem.pool_name}</strong>
      </Typography>
      <Typography>Performance: {poolItem.performance}</Typography>
      <Typography># of active nodes: {poolItem.active_nodes}</Typography>
      <Typography># of jailed nodes: {poolItem.jailed_nodes}</Typography>
      <Box className="flex justify-end">
        <Box className="cursor-pointer text-blue-600" onClick={handleClickOpen}>
          Show Details
        </Box>
      </Box>
      <Divider className="my-3" />
      <PoolDetailModal
        poolItem={poolItem}
        handleClose={handleClose}
        open={open}
      />
    </>
  )
}

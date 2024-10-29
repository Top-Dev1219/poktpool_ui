import { useState, useEffect, useMemo } from 'react'
import { useQuery } from 'react-query'
import { useRouter } from 'next/router'
import { useSession, signIn } from 'next-auth/react'
import axios from 'axios'
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material'
import currency from 'currency.js'
import useAccessToken from '../../../../hooks/useAccessToken'

const formatPokt = (amount: string | number) => {
  return currency(amount, {
    precision: 2,
    symbol: '',
  }).format()
}

export const PoktPosition = () => {
  const accessToken = useAccessToken()
  const { status, data: sessionData } = useSession()
  const router = useRouter()

  const { data: poktPosition, isLoading: dataLoading } = useQuery(
    'admin/stake-position-report',
    () =>
      axios
        .get('admin/stake-position-report', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((res) => res.data),
    {
      enabled: !!accessToken,
    }
  )

  const { data: nodeProviders, isLoading: isProviderLoading } = useQuery(
    'admin-node/providers',
    () =>
      axios
        .get('admin-node/providers', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((res) => res.data),
    {
      enabled: !!accessToken,
    }
  )

  const calcStakeDiff = useMemo(() => {
    const { total_staked_member, total_staked_node } = poktPosition || {}
    if (total_staked_member && total_staked_node)
      return total_staked_member - total_staked_node
  }, [poktPosition])

  const calcUnstakeDiff = useMemo(() => {
    const {
      liquid_wallet_balance,
      total_unstaking_node,
      total_pending_unstakes,
    } = poktPosition || {}
    if (liquid_wallet_balance && total_unstaking_node && total_pending_unstakes)
      return (
        Number(liquid_wallet_balance) +
        Number(total_unstaking_node) -
        Number(total_pending_unstakes)
      )
  }, [poktPosition])

  useEffect(() => {
    const session: any = sessionData

    if (session?.permissions && !session?.permissions?.includes(11)) {
      router.push('manage/dashboard')
    }
  }, [sessionData, router])

  if (status === 'unauthenticated') signIn()

  return (
    <div>
      <Typography className="text-xl mt-8">POKT Position</Typography>
      <div className="max-w-4xl mx-auto mt-4 md:mt-12">
        {dataLoading ? (
          <div className="flex justify-center items-center">
            <CircularProgress />
          </div>
        ) : (
          <div>
            <div className="md:flex gap-4">
              <div className="py-8 md:py-0 md:w-1/3 bg-brand-blue-dark text-white rounded-md">
                <div className="flex h-full justify-center items-center text-center">
                  <div className="flex flex-col">
                    <p className="mt-0 font-bold">
                      POKT to{' '}
                      {Number(calcStakeDiff) + Number(calcUnstakeDiff) > 0
                        ? 'Stake'
                        : 'Unstake'}
                    </p>
                    <p className="my-0">
                      {calcStakeDiff &&
                        calcUnstakeDiff &&
                        formatPokt(
                          Number(calcStakeDiff) + Number(calcUnstakeDiff)
                        )}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4 md:mt-0 md:w-2/3 flex text-center flex-col gap-4">
                <div className="drop-shadow-xl rounded-md border border-solid border-slate-200 bg-white p-4">
                  <p className="my-1">
                    <strong>Member Stakes:</strong>&nbsp;&nbsp;
                    {poktPosition?.total_staked_member &&
                      formatPokt(poktPosition?.total_staked_member)}
                  </p>
                  <p className="my-2">
                    <strong>Staked with Vendors:</strong>&nbsp;&nbsp;
                    {poktPosition?.total_staked_node &&
                      formatPokt(poktPosition?.total_staked_node)}
                  </p>
                  <p className="my-1">
                    <strong>Difference:</strong>&nbsp;&nbsp;
                    {calcStakeDiff && formatPokt(calcStakeDiff)}
                  </p>
                </div>
                <div className="drop-shadow-xl rounded-md border border-solid border-slate-200 bg-white p-4">
                  <p className="my-1">
                    <strong>Pending Unstakes:</strong>&nbsp;&nbsp;
                    {poktPosition?.total_pending_unstakes &&
                      formatPokt(poktPosition?.total_pending_unstakes)}
                  </p>
                  <p className="my-2">
                    <strong>Balance in Liquid Wallet:</strong>&nbsp;&nbsp;
                    {poktPosition?.liquid_wallet_balance &&
                      formatPokt(poktPosition?.liquid_wallet_balance)}
                  </p>
                  <p className="my-2">
                    <strong>Nodes Unstaking:</strong>&nbsp;&nbsp;
                    {poktPosition?.total_unstaking_node &&
                      formatPokt(poktPosition?.total_unstaking_node)}
                  </p>
                  <p className="my-1">
                    <strong>Difference:</strong>&nbsp;&nbsp;
                    {calcUnstakeDiff && formatPokt(calcUnstakeDiff)}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <Box sx={{ overflow: 'auto' }}>
                <Box
                  sx={{
                    width: '100%',
                    display: 'table',
                    tableLayout: 'fixed',
                  }}
                >
                  <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                      <TableHead className="bg-brand-blue-dark">
                        <TableRow>
                          <TableCell
                            align="center"
                            className="text-white hover:text-white"
                          >
                            Provider Name
                          </TableCell>
                          <TableCell
                            align="center"
                            className="text-white hover:text-white"
                          >
                            Stake Balance
                          </TableCell>
                          <TableCell
                            align="center"
                            className="text-white hover:text-white"
                          >
                            Amount Unstaking
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {nodeProviders?.providers &&
                          nodeProviders?.providers?.length &&
                          nodeProviders?.providers.map(
                            (provider: any, index: number) => (
                              <TableRow
                                key={index}
                                sx={{
                                  '&:last-child td, &:last-child th': {
                                    border: 0,
                                  },
                                }}
                              >
                                <TableCell align="center">
                                  {provider?.vendor_name}
                                </TableCell>
                                <TableCell align="center">
                                  {provider?.staked_pokt &&
                                    currency(provider?.staked_pokt, {
                                      precision: 2,
                                      symbol: '',
                                    }).format()}
                                </TableCell>
                                <TableCell align="center">
                                  {provider?.unstaking_pokt &&
                                    currency(provider?.unstaking_pokt, {
                                      precision: 2,
                                      symbol: '',
                                    }).format()}
                                </TableCell>
                              </TableRow>
                            )
                          )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </Box>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

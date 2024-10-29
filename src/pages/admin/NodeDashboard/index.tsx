import { useEffect } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useQuery } from 'react-query'
import axios from 'axios'
import {
  Box,
  Typography,
  Grid,
  Divider,
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { Card } from './components'
import useAccessToken from '../../../../hooks/useAccessToken'
import currency from 'currency.js'

export const ScrollView = styled('div')(() => ({
  overflowY: 'auto',
  maxHeight: '500px',
  paddingTop: '12px',
  paddingLeft: '20px',
  paddingRight: '20px',
  '&::-webkit-scrollbar': {
    width: '10px',
  },
  '&::-webkit-scrollbar-track': {
    boxShadow: 'inset 0 0 5px rgba(0, 0, 0, 0.3)',
    borderRadius: '5px',
    width: '50px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: '#888',
    borderRadius: '5px',
  },
  '&::-webkit-scrollbar-thumb:hover': {
    background: '#555',
  },
}))

export const NodeDashboard = () => {
  const { status, data: sessionData } = useSession()
  const accessToken = useAccessToken()
  const router = useRouter()

  const { data: nodeProviders, isLoading: dataLoading } = useQuery(
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

  const calcProviderDetails = () => {
    return nodeProviders?.providers?.reduce(
      (a: any, b: any) => {
        for (let item in a) {
          if (b[item]) {
            a[item] += Number(b[item])
          }
        }

        return a
      },
      {
        active_nodes: 0,
        jailed_nodes: 0,
        staked_pokt: 0,
        unstaking_nodes: 0,
        unstaking_pokt: 0,
      }
    )
  }

  if (status === 'unauthenticated') signIn()

  useEffect(() => {
    const session: any = sessionData

    if (session?.permissions && !session?.permissions?.includes(6)) {
      router.push('manage/dashboard')
    }
  }, [sessionData])

  return (
    <>
      <div>
        <Box className="my-8">
          <Typography className="text-xl">Node Dashboard</Typography>
        </Box>
        <Grid container spacing={3}>
          <Card
            labelColor="#000"
            label="Active nodes"
            dataValue={
              calcProviderDetails()?.active_nodes &&
              currency(calcProviderDetails()?.active_nodes, {
                symbol: '',
                precision: 0,
              }).format()
            }
          />
          <Card
            labelColor="#000"
            label="Staked POKT"
            dataValue={
              calcProviderDetails()?.active_nodes &&
              currency(calcProviderDetails()?.staked_pokt, {
                symbol: '',
                precision: 2,
              }).format()
            }
          />
          <Card
            labelColor="#000"
            label="Jailed Nodes"
            dataValue={
              calcProviderDetails()?.jailed_nodes &&
              currency(calcProviderDetails()?.jailed_nodes, {
                symbol: '',
                precision: 0,
              }).format()
            }
          />
          <Card
            labelColor="#000"
            label="Block Last Updated"
            dataValue={nodeProviders?.blockId}
          />
          <Card
            labelColor="#000"
            label="Nodes Unstaking"
            dataValue={
              calcProviderDetails()?.unstaking_nodes &&
              currency(calcProviderDetails()?.unstaking_nodes, {
                symbol: '',
                precision: 0,
              }).format()
            }
          />
          <Card
            labelColor="#000"
            label="Amount Unstaking"
            dataValue={
              calcProviderDetails()?.unstaking_pokt &&
              currency(calcProviderDetails()?.unstaking_pokt, {
                symbol: '',
                precision: 2,
              }).format()
            }
          />
        </Grid>
        <Grid container spacing={3} className="mt-6">
          <Grid item xs={12}>
            <Box className="bg-white rounded-lg">
              <Typography className="text-2xl p-4 pb-0 border-b-2 border-black">
                Providers
              </Typography>
              <Divider className="mt-3 mb-1" />
              <ScrollView>
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
                              # of Nodes
                            </TableCell>
                            <TableCell
                              align="right"
                              className="text-white hover:text-white"
                            >
                              # of Jailed Nodes
                            </TableCell>
                            <TableCell
                              align="center"
                              className="text-white hover:text-white"
                            >
                              Nodes Unstaking
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
                                    {provider?.active_nodes}
                                  </TableCell>
                                  <TableCell align="center">
                                    {provider?.jailed_nodes}
                                  </TableCell>
                                  <TableCell align="center">
                                    {provider?.unstaking_nodes}
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
              </ScrollView>
            </Box>
          </Grid>
        </Grid>
      </div>
    </>
  )
}

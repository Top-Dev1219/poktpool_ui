import React, { useEffect, useState } from 'react'
import { useMutation } from 'react-query'
import { useRouter } from 'next/router'
import { useSession, signIn } from 'next-auth/react'
import axios from 'axios'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button'
import { format } from 'date-fns'
import currency from 'currency.js'
import { ReactSortable } from 'react-sortablejs'
import { useAuthQuery } from '../../../../hooks/useApi'
import useAccessToken from '../../../../hooks/useAccessToken'
import { formatUTCDate } from '../../../utils/time'
import { StepIndicator } from './StepIndicator'

export const ProviderSweepBalance = () => {
  const accessToken = useAccessToken()
  const router = useRouter()
  const { status, data: sessionData } = useSession()
  const [error, setErrorObj] = useState<{ error: string; message: string[] }>()
  const [vendors, setVendors] = React.useState<any[]>([])
  const [submitted, setSubmitted] = useState(false)

  const trancheId = Number(router.query.slug)

  const { data: sweepBalances } = useAuthQuery(
    `admin/vendor-wallet-balances/${trancheId}`,
    undefined,
    { enabled: !!trancheId }
  )

  const calcGrandTotalBalance = () => {
    let grandTotal = 0

    if (sweepBalances?.vendors && sweepBalances?.vendors?.length) {
      for (let i = 0; i < sweepBalances?.vendors?.length; i++) {
        grandTotal +=
          Number(sweepBalances?.vendors?.[i].balance?.value) / 1000000
      }
    }

    return currency(grandTotal, {
      symbol: '',
      precision: 2,
    }).format()
  }

  const { mutate: submitTransfer, isLoading: isMutating } = useMutation(
    ({ blockId, trancheId }: { blockId: string; trancheId: number }) =>
      axios
        .post(
          `admin/vendor-to-aggregated`,
          { blockId, trancheId },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        )
        .then((res) => {
          router.push(`/admin/tranche/tranche-sweeps/${trancheId}`)
        })
        .catch((e) => {
          setErrorObj(e?.response?.data)
        })
  )

  const handleTransfer = () => {
    setSubmitted(true)
    submitTransfer({
      blockId: sweepBalances?.blockId,
      trancheId: trancheId,
    })
  }

  useEffect(() => {
    if (sweepBalances && sweepBalances?.vendors?.length) {
      setVendors(sweepBalances.vendors)
    }
  }, [sweepBalances])

  useEffect(() => {
    const session: any = sessionData

    if (session?.permissions && !session?.permissions?.includes(1)) {
      router.push('manage/dashboard')
    }
  }, [sessionData, router])

  if (status === 'unauthenticated') signIn()

  return (
    <>
      <div className="container mx-auto">
        <div className="flex max-w-5xl mx-auto">
          <StepIndicator />
        </div>
        <h2>Provider Sweep Wallet Balances</h2>
        <h3>Grand Total Balance: {calcGrandTotalBalance()}</h3>
        <div className="flex gap-4">
          <div className="w-2/3">
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 450 }} aria-label="simple table">
                <TableHead className="bg-brand-blue-dark">
                  <TableRow>
                    <TableCell
                      align="center"
                      className="text-white hover:text-white"
                    >
                      Wallet Name
                    </TableCell>
                    <TableCell
                      align="center"
                      className="text-white hover:text-white"
                    >
                      Inbound Transaction Time
                    </TableCell>
                    <TableCell
                      align="center"
                      className="text-white hover:text-white"
                    >
                      Custodial
                    </TableCell>
                    <TableCell
                      align="center"
                      className="text-white hover:text-white"
                    >
                      Rev Share
                    </TableCell>
                    <TableCell
                      align="center"
                      className="text-white hover:text-white"
                    >
                      Earnings per 15k
                    </TableCell>
                    <TableCell
                      align="right"
                      className="text-white hover:text-white"
                    >
                      POKT Amount
                    </TableCell>
                  </TableRow>
                </TableHead>
                {sweepBalances?.vendors?.length && (
                  <React.Fragment>
                    <ReactSortable
                      tag="tbody"
                      list={vendors}
                      setList={(newList) => setVendors(newList)}
                      className="cursor-pointer"
                    >
                      <>
                        {vendors.map((vendor: any) => (
                          <TableRow
                            key={vendor.reward_sweep_wallet?.wallet_id}
                            sx={{
                              '&:last-child td, &:last-child th': { border: 0 },
                            }}
                          >
                            <TableCell align="center">
                              {vendor.reward_sweep_wallet?.wallet_name}
                            </TableCell>
                            <TableCell align="center">
                              {format(
                                formatUTCDate(vendor?.balance?.inbound_time),
                                'yyyy-MM-dd HH:mm:ss'
                              )}
                            </TableCell>
                            <TableCell align="center">
                              {vendor?.vendor_pool_admin?.is_custodial
                                ? 'Yes'
                                : 'No'}
                            </TableCell>
                            <TableCell align="center">
                              {vendor?.vendor_pool_admin?.rev_share_rate &&
                                currency(
                                  vendor?.vendor_pool_admin?.rev_share_rate *
                                    100,
                                  {
                                    symbol: '',
                                    precision: 2,
                                  }
                                ).format()}
                              %
                            </TableCell>
                            <TableCell align="right">
                              {vendor?.earned_per_15k}
                            </TableCell>
                            <TableCell align="right">
                              {currency(
                                Number(vendor?.balance?.value) / 1000000,
                                {
                                  symbol: '',
                                  precision: 2,
                                }
                              ).format()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </>
                    </ReactSortable>
                  </React.Fragment>
                )}
              </Table>
            </TableContainer>
          </div>

          <div className="w-1/3">
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 450 }} aria-label="simple table">
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
                      align="right"
                      className="text-white hover:text-white"
                    >
                      POKT Amount
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sweepBalances?.transactions.length &&
                    sweepBalances?.transactions.map(
                      (transaction: any, index: number) => (
                        <TableRow
                          key={index}
                          sx={{
                            '&:last-child td, &:last-child th': { border: 0 },
                          }}
                        >
                          <TableCell align="center">
                            {transaction?.from}
                          </TableCell>
                          <TableCell align="center">
                            {transaction?.to}
                          </TableCell>
                          <TableCell align="right">
                            {currency(Number(transaction?.amount) / 1000000, {
                              symbol: '',
                              precision: 2,
                            }).format()}
                          </TableCell>
                        </TableRow>
                      )
                    )}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        </div>

        <div className="mt-8">
          <Button
            variant="contained"
            size="large"
            onClick={handleTransfer}
            disabled={!sweepBalances?.enableTransferButton || isMutating || submitted}
          >
            Transfer
          </Button>
        </div>
      </div>
    </>
  )
}

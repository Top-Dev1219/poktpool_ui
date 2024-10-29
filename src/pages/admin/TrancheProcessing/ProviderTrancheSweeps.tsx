import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useSession, signIn } from 'next-auth/react'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button'
import { useAuthQuery } from '../../../../hooks/useApi'
import currency from 'currency.js'
import { StepIndicator } from './StepIndicator'

export const ProviderTrancheSweeps = () => {
  const router = useRouter()
  const { status, data: sessionData } = useSession()

  const trancheId = Number(router.query.slug)

  const { data: providerTrancheSweeps, refetch } = useAuthQuery(
    `admin/vendor-to-aggregated/${trancheId}`,
    undefined,
    { enabled: !!trancheId }
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

  const calcTotalPOKTSwept = () => {
    let totalSwept = 0

    if (
      providerTrancheSweeps?.transactions &&
      providerTrancheSweeps?.transactions.length
    ) {
      for (let i = 0; i < providerTrancheSweeps?.transactions.length; i++) {
        totalSwept +=
          Number(providerTrancheSweeps?.transactions?.[i].amount) / 1000000
      }
    }

    return totalSwept
  }

  const handleGoToTranche = () => {
    router.push(`/admin/tranche/tranche-close/${trancheId}`)
  }

  useEffect(() => {
    if (!providerTrancheSweeps?.enableProceedButton) {
      setInterval(() => {
        refetch()
      }, 60 * 1000)
    } else {
      clearInterval()
    }

    return () => {
      clearInterval()
    }
  }, [providerTrancheSweeps?.enableProceedButton, refetch])

  useEffect(() => {
    const session: any = sessionData

    if (session?.permissions && !session?.permissions?.includes(1)) {
      router.push('manage/dashboard')
    }
  }, [sessionData, router])

  if (status === 'unauthenticated') signIn()

  return (
    <>
      <div className="max-w-7xl mx-auto">
        <div className="flex max-w-5xl mx-auto">
          <StepIndicator />
        </div>
        <h2>Provider Tranche Sweeps</h2>
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
              {providerTrancheSweeps?.transactions.length &&
                providerTrancheSweeps?.transactions.map(
                  (transaction: any, index: number) => (
                    <TableRow
                      key={index}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
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
                          providerTrancheSweeps?.enableProceedButton
                            ? 'text-green-700'
                            : 'text-brand-blue-dark'
                        }
                      >
                        {checkTxStatus(transaction)}
                      </TableCell>
                    </TableRow>
                  )
                )}
            </TableBody>
          </Table>
        </TableContainer>
        <div className="flex justify-between">
          <h3 className="mt-8">
            Aggregated Wallet Balance :{' '}
            {providerTrancheSweeps?.aggregated_wallet_balance &&
              currency(
                Number(providerTrancheSweeps?.aggregated_wallet_balance) /
                  1000000,
                {
                  precision: 2,
                  symbol: '',
                }
              ).format()}
          </h3>
          <h3 className="mt-8">
            Total POKT Swept:{' '}
            {calcTotalPOKTSwept() &&
              currency(calcTotalPOKTSwept(), {
                symbol: '',
                precision: 2,
              }).format()}
          </h3>
        </div>

        <div className="mt-4">
          <Button
            variant="contained"
            size="large"
            onClick={handleGoToTranche}
            className="mr-4"
            disabled={!providerTrancheSweeps?.enableProceedButton}
          >
            Proceed to tranche processing
          </Button>
        </div>
      </div>
    </>
  )
}

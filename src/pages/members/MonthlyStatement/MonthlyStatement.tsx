import { useState, useEffect } from 'react'
import { useQuery } from 'react-query'
import {
  Box,
  Select,
  FormControl,
  MenuItem,
  Button,
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
} from '@mui/material'
import axios from 'axios'
import { format } from 'date-fns'
import currency from 'currency.js'
import { CSVLink } from 'react-csv'
import { formatUTCDate } from '../../../utils/time'
import useAccessToken from '../../../../hooks/useAccessToken'
import useCustomerId from '../../../../hooks/useCustomerId'

const headers = [
  {
    key: 'starting_stake',
    label: 'Beginning Balance',
  },
  {
    key: 'injections',
    label: 'Injections',
  },
  {
    key: 'gross_rewards',
    label: 'Gross Rewards',
  },
  {
    key: 'fees_paid',
    label: 'Fees Paid',
  },
  {
    key: 'net_rewards',
    label: 'Net Rewards',
  },
  {
    key: 'sweeps',
    label: 'Sweeps Deducted',
  },
  {
    key: 'unstakes',
    label: 'Unstakes',
  },
  {
    key: 'transfers',
    label: 'Transfers',
  },
  {
    key: 'ending_stake',
    label: 'Ending Balance',
  },
]

const xlxHeaders = [
  { label: '', key: 'label' },
  { label: 'Tokens', key: 'token' },
  { label: 'USD', key: 'usd' },
]

export const MonthlyStatement = () => {
  const accessToken = useAccessToken()
  const { customerId } = useCustomerId()
  const [month, setMonth] = useState('')

  const { data: monthlyStatements, isLoading } = useQuery(
    ['user/monthly-statement', customerId],
    () =>
      axios
        .get(`user/monthly-statement?customerId=${customerId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((res) => res.data),
    {
      enabled: !!accessToken && !!customerId,
    }
  )

  const options =
    monthlyStatements &&
    monthlyStatements?.map((statement: any) =>
      format(formatUTCDate(statement.as_of_date), 'MMMM yyyy')
    )

  const formattedData =
    monthlyStatements &&
    monthlyStatements
      ?.filter(
        (item: any) =>
          format(formatUTCDate(item?.as_of_date), 'MMMM yyyy') === month
      )
      ?.reduce((a: any[], statement: any) => {
        return [
          ...a,
          ...headers.map((header) => ({
            label: header.label,
            token: statement?.[header.key + '_tokens']
              ? currency(statement?.[header.key + '_tokens'], {
                  symbol: '',
                  precision: 2,
                }).format()
              : '',
            usd: statement?.[header.key + '_usd']
              ? currency(statement?.[header.key + '_usd'], {
                  symbol: '',
                  precision: 2,
                }).format()
              : '',
          })),
        ]
      }, [])

  useEffect(() => {
    if (options && options.length > 0 && !month) setMonth(options[0])
  }, [options, month])

  return (
    <div className="max-w-4xl mx-auto">
      <header className="flex flex-col gap-1 mb-6">
        <h1 className="mt-0 mb-0">Monthly Statement</h1>
      </header>
      <div className="md:flex items-center gap-8 mt-8">
        <p className="text-lg my-0">Select Month</p>
        <Box className="w-full md:w-56 mr-8">
          <FormControl fullWidth size="small">
            <Select
              className="bg-white"
              labelId="demo-select-small"
              id="poolId"
              value={month}
              displayEmpty
              onChange={(e) => setMonth(e.target.value)}
            >
              {options?.map((option: any, index: number) => (
                <MenuItem value={option} key={index}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </div>

      <div className="mt-8">
        <div className="flex justify-between items-center">
          <h2 className="text-lg">Statement for {month}</h2>
          <CSVLink
            data={formattedData ?? []}
            filename={`monthly-statement-${month}.csv`}
            className="btn bg-brand-blue-dark text-white py-3 px-4 rounded"
            target="_blank"
            headers={xlxHeaders}
          >
            Download CSV
          </CSVLink>
        </div>

        <Box sx={{ overflow: 'auto' }}>
          <Box sx={{ width: '100%', display: 'table', tableLayout: 'fixed' }}>
            <TableContainer component={Paper} className="not-prose">
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead className="bg-brand-blue-dark text-white">
                  <TableRow>
                    <TableCell
                      align="center"
                      rowSpan={2}
                      className=" text-white"
                    ></TableCell>
                    <TableCell
                      align="center"
                      rowSpan={2}
                      className=" text-white"
                    >
                      Tokens
                    </TableCell>
                    <TableCell
                      align="center"
                      rowSpan={2}
                      className="py-0 text-white"
                    >
                      Total Staked
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {monthlyStatements && monthlyStatements.length ? (
                    monthlyStatements
                      .filter(
                        (item: any) =>
                          format(
                            formatUTCDate(item?.as_of_date),
                            'MMMM yyyy'
                          ) === month
                      )
                      .map((statement: any, index: number) => (
                        <>
                          {headers.map((header) => (
                            <TableRow
                              sx={{
                                '&:last-child td, &:last-child th': {
                                  border: 0,
                                },
                              }}
                              key={index}
                            >
                              <TableCell
                                align="center"
                                component="th"
                                scope="row"
                              >
                                {header.label}
                              </TableCell>
                              <TableCell align="center">
                                {statement?.[header.key + '_tokens'] &&
                                  currency(
                                    statement?.[header.key + '_tokens'],
                                    {
                                      symbol: '',
                                      precision: 2,
                                    }
                                  ).format()}
                              </TableCell>
                              <TableCell align="center">
                                {statement?.[header.key + '_usd'] &&
                                  currency(statement?.[header.key + '_usd'], {
                                    precision: 2,
                                  }).format()}
                              </TableCell>
                            </TableRow>
                          ))}
                        </>
                      ))
                  ) : (
                    <>Monthly Statement Not Found!</>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
      </div>
    </div>
  )
}

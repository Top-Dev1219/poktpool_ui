import * as React from 'react'
import Box from '@mui/material/Box'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TablePagination from '@mui/material/TablePagination'
import TableRow from '@mui/material/TableRow'
import TableSortLabel from '@mui/material/TableSortLabel'
import Paper from '@mui/material/Paper'
import { visuallyHidden } from '@mui/utils'
import CircularProgress from '@mui/material/CircularProgress'
import currency from 'currency.js'

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1
  }
  if (b[orderBy] > a[orderBy]) {
    return 1
  }
  return 0
}

type Order = 'asc' | 'desc'

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key
): (
  a: { [key in Key]: number | string },
  b: { [key in Key]: number | string }
) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy)
}

// This method is created for cross-browser compatibility, if you don't
// need to support IE11, you can use Array.prototype.sort() directly
function stableSort<T>(
  array: readonly T[],
  comparator: (a: T, b: T) => number
) {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number])
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0])
    if (order !== 0) {
      return order
    }
    return a[1] - b[1]
  })
  return stabilizedThis.map((el) => el[0])
}

export interface HeadCell {
  disablePadding: boolean
  id: string
  label: string
  numeric: boolean
  percent?: boolean
  number?: boolean
  price?: boolean
  smallText?: boolean
}

interface EnhancedTableProps {
  onRequestSort: (event: React.MouseEvent<unknown>, property: string) => void
  order: Order
  orderBy: string
  rowCount: number
  headCells: readonly HeadCell[]
}

interface BasicTableProps {
  headCells: readonly HeadCell[]
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const { order, orderBy, headCells, onRequestSort } = props
  const createSortHandler =
    (property: string) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property)
    }

  return (
    <TableHead className="bg-brand-blue-dark">
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'center' : 'right'}
            sortDirection={orderBy === headCell.id ? order : false}
            className="text-white hover:text-white"
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
              className={`text-white hover:text-white active:text-white ${
                headCell.smallText && 'text-xs'
              }`}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted ascending' : 'sorted descending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  )
}

function BasicTableHead(props: BasicTableProps) {
  const { headCells } = props

  return (
    <TableHead className="bg-brand-blue-dark">
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'center' : 'right'}
            className="text-white hover:text-white"
          >
            {headCell.label}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  )
}

export const ReportTable = ({
  resultData,
  headCells,
  useEnhancedHead,
  showPager,
}: {
  resultData: any[]
  headCells: readonly HeadCell[]
  useEnhancedHead: boolean
  showPager?: boolean
}) => {
  const [order, setOrder] = React.useState<Order>('asc')
  const [orderBy, setOrderBy] = React.useState<any>('provider')
  const [page, setPage] = React.useState(0)
  const [rowsPerPage, setRowsPerPage] = React.useState(10)

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: string
  ) => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  }

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - resultData.length) : 0

  return (
    <Box sx={{ overflow: 'auto' }}>
      <Box sx={{ width: '100%', display: 'table', tableLayout: 'fixed' }}>
        <TableContainer component={Paper}>
          <Table
            sx={{ width: '100%', overflowX: 'auto' }}
            aria-labelledby="tableTitle"
            size="medium"
          >
            {useEnhancedHead ? (
              <EnhancedTableHead
                order={order}
                orderBy={orderBy}
                onRequestSort={handleRequestSort}
                rowCount={resultData.length}
                headCells={headCells}
              />
            ) : (
              <BasicTableHead headCells={headCells} />
            )}

            <TableBody>
              {/* if you don't need to support IE11, you can replace the `stableSort` call with:
              rows.slice().sort(getComparator(order, orderBy)) */}
              {stableSort(resultData, getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
                  const labelId = `enhanced-table-checkbox-${index}`

                  return (
                    <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                      {headCells.map((item) => (
                        <TableCell
                          component="th"
                          id={labelId}
                          scope="row"
                          key={item.id}
                          className={`${
                            Number.isNaN(
                              row[item.id] &&
                                Number(
                                  row[item.id].toString().split(',').join('')
                                )
                            )
                              ? 'text-center'
                              : 'text-right'
                          }
                            ${item.smallText && 'text-xs'}`}
                        >
                          {item.price && '$'}
                          {item.number
                            ? currency(row[item.id], {
                                precision: 2,
                                symbol: '',
                              }).format()
                            : row[item.id]}
                          {item.percent && '%'}
                        </TableCell>
                      ))}
                    </TableRow>
                  )
                })}
              {emptyRows > 0 && (
                <TableRow
                  style={{
                    height: 53 * emptyRows,
                  }}
                >
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {showPager && (
          <TablePagination
            rowsPerPageOptions={[
              { value: 10, label: '10' },
              { value: 20, label: '20' },
              { value: 30, label: '30' },
              { value: resultData.length, label: 'Show All' },
            ]}
            component="div"
            count={resultData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        )}
      </Box>
    </Box>
  )
}

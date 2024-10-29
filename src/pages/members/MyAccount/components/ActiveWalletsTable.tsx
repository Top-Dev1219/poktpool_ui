import { useState, useEffect, useRef } from 'react'
import { styled } from '@mui/material/styles'
import {
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  tableCellClasses,
  Tooltip,
  TextField,
  Radio,
  Alert,
  Snackbar,
  IconButton,
} from '@mui/material'
import ModeEditIcon from '@mui/icons-material/ModeEdit'
import SaveIcon from '@mui/icons-material/Save'
import CloseIcon from '@mui/icons-material/Close'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import { useMutation } from 'react-query'
import axios from 'axios'
import currency from 'currency.js'
import { CSVLink } from 'react-csv'
import { format } from 'date-fns'
import DOMPurify from 'dompurify'
import useAccessToken from '../../../../../hooks/useAccessToken'
import useUser from '../../../../../hooks/useUser'
import useCustomerId from '../../../../../hooks/useCustomerId'
import { formatUTCDate } from '../../../../utils/time'

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: '#0465FF',
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    paddingTop: 8,
    paddingBottom: 8,
  },
}))

const headers = [
  { label: 'Date', key: 'timestamp' },
  { label: 'POKT Price', key: 'pokt_price' },
  { label: 'Transaction Type', key: 'txn_type' },
  { label: 'Amount', key: 'pokt_amt' },
  { label: 'Percent', key: 'percent' },
  { label: 'Transaction Hash', key: 'txn_hash' },
  { label: 'Wallet ID', key: 'wallet_address' },
]
interface WalletDataType {
  isLoading: boolean
  activeWallets: any[]
  refetchWallets: () => void
  isFetching: boolean
}

const config = {
  ALLOWED_TAGS: ['b', 'i', 'em'],
  ALLOWED_ATTR: ['href'],
  ALLOW_DATA_ATTR: false,
  ALLOWED_URI_REGEXP:
    /^(?:(?:https?|mailto):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
}

export const ActiveWalletsTable = (props: WalletDataType) => {
  const { isLoading, activeWallets, refetchWallets, isFetching } = props
  const [customerId, setCustomerId] = useState<string | null | undefined>(null)
  const [csvData, setCSVData] = useState([])
  const [loading, setLoading] = useState(false)
  const accessToken = useAccessToken()
  const [date, setDate] = useState(new Date())
  const excelDate = format(date, 'yyyy-MM-dd HH:mm:ss')
  const csvLinkEl = useRef<any>(null)
  const [editNickname, setEditNickname] = useState<number>(-1)
  const [newNickname, setNewNickname] = useState('')
  const [patchError, setPatchError] = useState('')
  const [hasPatchError, setHasPatchError] = useState(false)
  const { customerId: defaultCustomerId } = useCustomerId()

  const handleCSVDownload = (csvId: any) => {
    if (!loading) {
      setLoading(true)
      axios
        .get(`user/download-history?customerId=${csvId}`, {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        })
        .then((res) => {
          const data = res.data
          setCSVData(data)
          setLoading(false)
          setTimeout(() => {
            csvLinkEl?.current?.link?.click()
          }, 2000)
        })
        .catch(() => {
          setLoading(false)
        })
    }
  }

  const formatCsvData = csvData
    ? csvData.map((item: any) => {
        return {
          ...item,
          timestamp: item?.timestamp
            ? format(formatUTCDate(item?.timestamp), 'yyyy-MM-dd HH:mm:ss')
            : '',
          pokt_price: currency(item?.pokt_price, {
            precision: 4,
          }).format(),
          txn_type: item?.txn_type,
          pokt_amt: currency(item?.pokt_amt, {
            precision: 2,
            symbol: '',
          }).format(),
          percent: item?.percent,
          txn_hash: item?.txn_hash,
          wallet_address: item?.wallet_address,
        }
      })
    : []

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    localStorage.setItem('customerId', event.target.value)
    setCustomerId(event.target.value)
  }

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedNickname = DOMPurify.sanitize(e.target.value, config)
    setNewNickname(sanitizedNickname)
  }

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault()
    const pastedText = event.clipboardData.getData('text/plain')
    const sanitizedInput = DOMPurify.sanitize(pastedText, config)
    setNewNickname(sanitizedInput)
  }

  const { mutate: updateNickname } = useMutation(
    ({ nickname, customer }: { nickname: string; customer: string }) =>
      axios.patch(
        `wallet/edit/${customer}`,
        { nickname: DOMPurify.sanitize(nickname) },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      ),
    {
      onSuccess: async (res) => {
        const data = await res.data
        refetchWallets()
        setEditNickname(-1)
      },
      onError: (error: any) => {
        setHasPatchError(true)
        setPatchError(error.response.data.message)
      },
    }
  )

  return (
    <>
      {isLoading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 700 }} aria-label="customized table">
            <TableHead>
              <TableRow>
                <StyledTableCell align="center">Select</StyledTableCell>
                <StyledTableCell align="center">Wallet ID</StyledTableCell>
                <StyledTableCell align="center">Nickname</StyledTableCell>
                <StyledTableCell align="right">Active Balance</StyledTableCell>
                <StyledTableCell align="right">Pending Balance</StyledTableCell>
                <StyledTableCell align="right">Action</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {activeWallets.length > 0 &&
                activeWallets
                  .sort(
                    (a: any, b: any) =>
                      Number(a.customer_id) - Number(b.customer_id)
                  )
                  .map((row: any, index: number) => (
                    <TableRow key={row.p_wallet_id}>
                      <StyledTableCell align="center">
                        <Radio
                          checked={
                            (customerId === null
                              ? defaultCustomerId
                              : customerId) === row.customer_id
                          }
                          onChange={handleChange}
                          value={row.customer_id}
                          name="radio-buttons"
                          inputProps={{ 'aria-label': 'A' }}
                        />
                      </StyledTableCell>
                      <StyledTableCell
                        align="center"
                        component="th"
                        scope="row"
                      >
                        {row.p_wallet_id}
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        <div className="flex gap-2 items-center justify-center">
                          {editNickname === index ? (
                            <TextField
                              size="small"
                              className="w-full"
                              label="Nickname"
                              value={newNickname}
                              onChange={handleNicknameChange}
                              onPaste={handlePaste}
                            />
                          ) : (
                            <>{row.wallet_nickname}</>
                          )}

                          {editNickname === index ? (
                            <div className="flex">
                              <IconButton
                                className="rounded-md p-2 border-none border-solid bg-green-500 text-white hover:bg-green-600 hover:text-white"
                                onClick={() =>
                                  updateNickname({
                                    nickname: newNickname,
                                    customer: row.customer_id,
                                  })
                                }
                              >
                                <SaveIcon />
                              </IconButton>
                              <IconButton
                                className="rounded-md p-2 border-none border-solid bg-gray-300 text-white hover:bg-gray-400 ml-2"
                                onClick={() => setEditNickname(-1)}
                              >
                                <CloseIcon />
                              </IconButton>
                            </div>
                          ) : (
                            <IconButton
                              className="rounded-md p-2 border border-gray-400 border-solid hover:bg-brand-blue-dark hover:border-brand-blue-dark hover:text-white"
                              onClick={() => {
                                setEditNickname(index)
                                setNewNickname(row.wallet_nickname)
                              }}
                            >
                              <ModeEditIcon />
                            </IconButton>
                          )}
                        </div>
                      </StyledTableCell>
                      <StyledTableCell align="right">
                        {row.staked_amount
                          ? currency(row.staked_amount, {
                              symbol: '',
                              precision: 2,
                            }).format()
                          : '-'}
                      </StyledTableCell>
                      <StyledTableCell align="right">
                        {row.pending_stakes
                          ? currency(row.pending_stakes, {
                              symbol: '',
                              precision: 2,
                            }).format()
                          : '-'}
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        <Tooltip title="Download CSV" placement="right" arrow>
                          <IconButton
                            aria-label="download"
                            size="large"
                            onClick={() => handleCSVDownload(row.customer_id)}
                            disabled={loading}
                          >
                            <FileDownloadIcon />
                          </IconButton>
                        </Tooltip>

                        <CSVLink
                          data={formatCsvData}
                          filename={`my-report-${excelDate}.csv`}
                          target="_blank"
                          headers={headers}
                          asyncOnClick={true}
                          ref={csvLinkEl}
                          onClick={() => setDate(new Date())}
                        />
                      </StyledTableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={hasPatchError}
        autoHideDuration={3000}
        onClose={() => setHasPatchError(false)}
      >
        <Alert className="capitalize" severity="error" sx={{ width: '100%' }}>
          {patchError}
        </Alert>
      </Snackbar>
    </>
  )
}

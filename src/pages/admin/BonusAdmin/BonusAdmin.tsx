import { useEffect, useState, useMemo, useCallback } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useQuery, useMutation } from 'react-query'
import { FieldValues, useForm } from 'react-hook-form'
import axios from 'axios'
import {
  Typography,
  Button,
  Box,
  FormControl,
  Select,
  MenuItem,
  TextField,
  Alert,
  AlertTitle,
  Snackbar,
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material'
import { CSVLink } from 'react-csv'
import { format, getUnixTime } from 'date-fns'
import currency from 'currency.js'
import useAccessToken from '../../../../hooks/useAccessToken'
import { formatUTCDate } from '../../../utils/time'
import { faLaptopHouse } from '@fortawesome/free-solid-svg-icons'

interface BonusPayload {
  pool_id: number
  txn_type_code: number
  amount: number
  memo: string
  wallets: string[]
}

const headers = [
  {
    key: 'pool_name',
    label: 'Pool',
  },
  {
    key: 'txn_type_category',
    label: 'Category',
  },
  {
    key: 'p_wallet_id',
    label: 'Wallet Address',
  },
  {
    key: 'txn_type_desc',
    label: 'Distribution Type',
  },
  {
    key: 'amount',
    label: 'Amount',
  },
  {
    key: 'memo',
    label: 'Memo',
  },
  {
    key: 'txn_timestamp',
    label: 'Date',
  },
]

export const BonusAdmin = () => {
  const router = useRouter()
  const accessToken = useAccessToken()
  const { status, data: sessionData } = useSession()
  const [poolId, setPoolId] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [txTypeCode, setTxTypeCode] = useState(0)
  const [distributionType, setDistributionType] = useState<string>('')
  const [showDialog, setShowDialog] = useState(false)
  const [newBonusType, setNewBonusType] = useState<string>('')
  const [showSuccessMsg, setShowSuccessMsg] = useState(false)
  const [sendBonusSuccess, setSendBonusSuccess] = useState(false)
  const [hasPatchError, setHasPatchError] = useState(false)
  const [errorMsg, setErrorMsg] = useState(false)
  const [patchError, setPatchError] = useState<string[]>([])
  const [date, setDate] = useState(new Date())
  const excelDate = format(date, 'yyyy-MM-dd HH:mm:ss')
  const { handleSubmit, register, setValue, watch } = useForm()
  const watchWallets = watch('walletList')
  const watchAmount = watch('amount')

  const {
    data: bonusCategories,
    isLoading: isFetchingCategories,
    refetch,
  } = useQuery(
    'admin-bonus/categories',
    () =>
      axios
        .get('admin-bonus/categories', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((res) => res.data),
    {
      enabled: !!accessToken,
    }
  )

  const {
    data: transferTxs,
    isLoading: isFetchingTransactions,
    refetch: refetchTx,
  } = useQuery(
    ['admin-bonus/transactions', txTypeCode],
    () =>
      axios
        .get(`admin-bonus/transactions?txn_type_code=${txTypeCode}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((res) => res.data),
    {
      enabled: !!accessToken && !!txTypeCode,
    }
  )

  const { mutate: addNewBonusType } = useMutation(
    ({
      txn_type_category,
      txn_type_desc,
    }: {
      txn_type_category: string
      txn_type_desc: string
    }) =>
      axios.post(
        `admin-bonus/distribution-type`,
        { txn_type_category, txn_type_desc },
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
        setShowSuccessMsg(true)
        refetch()
      },
      onError: (error: any) => {
        setHasPatchError(true)
        setErrorMsg(error.response.data.error)
        setPatchError([error.response.data.message])
      },
    }
  )

  const onSubmit = (data: FieldValues) => {
    const wallets = data.walletList
      .replace(/ /g, '')
      .replace(/\n/g, '')
      .split(',')
      .filter((i: string) => i)

    const payload = {
      pool_id: Number(poolId),
      txn_type_code: Number(txTypeCode),
      amount: Number(data.amount),
      memo: data.memo,
      wallets: wallets,
    } as BonusPayload

    sendBonus({ payload: payload })
  }

  const { mutate: sendBonus, isLoading } = useMutation(
    ({ payload }: { payload: BonusPayload }) =>
      axios.post(
        `admin-bonus/bonus`,
        { ...payload },
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
        setValue('walletList', '')
        setValue('amount', '')
        setValue('memo', '')
        setSendBonusSuccess(true)
        refetchTx()
      },
      onError: (error: any) => {
        setHasPatchError(true)
        setErrorMsg(error.response.data.error)
        setPatchError([error.response.data.message])
      },
    }
  )

  const categories = useMemo(() => {
    return (
      bonusCategories?.categories?.reduce((a: string[], b: any) => {
        if (!a.includes(b.txn_type_category)) {
          return [b.txn_type_category, ...a]
        } else {
          return a
        }
      }, []) ?? []
    )
  }, [bonusCategories])

  const formattedData = useMemo(() => {
    return transferTxs && transferTxs.length
      ? transferTxs
          .sort(
            (a: any, b: any) =>
              getUnixTime(new Date(b.txn_timestamp)) -
              getUnixTime(new Date(a.txn_timestamp))
          )
          .map((item: any) => {
            return {
              ...item,
              txn_timestamp:
                item?.txn_timestamp &&
                format(formatUTCDate(item?.txn_timestamp), 'yyyy-MM-dd'),
              amount:
                item?.amount &&
                currency(item?.amount / 1000000, {
                  precision: 2,
                  symbol: '',
                }).format(),
            }
          })
      : []
  }, [transferTxs])

  const totalToSend = () => {
    if (watchWallets) {
      const totalWalletsNum = watchWallets
        .replace(/ /g, '')
        .replace(/\n/g, '')
        .split(',')
        .filter((i: string) => i)

      return Number(totalWalletsNum.length * watchAmount)
    }
    return 0
  }

  useEffect(() => {
    const session: any = sessionData

    if (session?.permissions && !session?.permissions?.includes(14)) {
      router.push('manage/dashboard')
    }
  }, [sessionData, router])

  if (status === 'unauthenticated') signIn()

  return (
    <div>
      {showSuccessMsg && (
        <div className="max-w-4xl my-4 mx-auto">
          <Alert
            severity="success"
            className="rounded-md"
            onClose={() => setShowSuccessMsg(false)}
          >
            A new distribution type has been created successfully!
          </Alert>
        </div>
      )}

      {sendBonusSuccess && (
        <div className="max-w-4xl my-4 mx-auto">
          <Alert
            severity="success"
            className="rounded-md"
            onClose={() => setSendBonusSuccess(false)}
          >
            Bonus has been successfully sent out!
          </Alert>
        </div>
      )}

      {hasPatchError && (
        <Snackbar
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          open={hasPatchError}
          autoHideDuration={3000}
          onClose={() => setHasPatchError(false)}
        >
          <Alert className="capitalize" severity="error" sx={{ width: '100%' }}>
            <AlertTitle>Error</AlertTitle>
            <>
              <p>{errorMsg}</p>
              <ul>
                {patchError.map((error: string, index: number) => (
                  <li key={index} className="list-disc">
                    {error}
                  </li>
                ))}
              </ul>
            </>
          </Alert>
        </Snackbar>
      )}

      <div className="max-w-4xl mx-auto">
        <Typography className="text-xl mt-8">Bonus Administration</Typography>
        <div className="md:flex justify-between">
          <div className="md:flex items-center gap-4 my-8">
            <h2 className="text-[18px] font-semibold mr-4">Select Pool</h2>
            <Box className="w-full md:w-56 mr-8">
              <FormControl fullWidth size="small">
                <Select
                  className="bg-white"
                  labelId="demo-select-small"
                  id="poolId"
                  value={poolId}
                  renderValue={() => {
                    if (!poolId) {
                      return <span>Select Pool</span>
                    }
                    return bonusCategories?.pools?.find(
                      (item: any) => item.pool_id === poolId
                    )?.pool_name
                  }}
                  displayEmpty
                  onChange={(e) => setPoolId(e.target.value)}
                >
                  {bonusCategories?.pools?.map((pool: any, index: number) => (
                    <MenuItem key={index} value={pool.pool_id}>
                      {pool.pool_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </div>
          <div className="md:flex items-center gap-4 my-8">
            <h2 className="text-[18px] font-semibold mr-4">Select Category</h2>
            <Box className="w-full md:w-56 mr-8">
              <FormControl fullWidth size="small">
                <Select
                  className="bg-white"
                  labelId="demo-select-small"
                  id="txTypeCode"
                  value={selectedCategory}
                  renderValue={() => {
                    if (!selectedCategory) {
                      return <span>Select Category</span>
                    }
                    return selectedCategory
                  }}
                  displayEmpty
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories?.map((category: string, index: number) => (
                    <MenuItem key={index} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </div>
        </div>

        <div className="md:flex gap-8">
          <div className="md:flex items-center gap-4">
            <h2 className="text-[18px] font-semibold mr-4">
              Select Distribution Type
            </h2>
            <Box className="w-full md:w-56 mr-8">
              <FormControl fullWidth size="small">
                <Select
                  className="bg-white"
                  labelId="demo-select-small"
                  id="txTypeCode"
                  value={txTypeCode}
                  renderValue={() => {
                    if (!txTypeCode) {
                      return <span>Select Category</span>
                    }
                    return bonusCategories?.categories?.find(
                      (item: any) => item.txn_type_code === txTypeCode
                    )?.txn_type_desc
                  }}
                  displayEmpty
                  onChange={(e) => setTxTypeCode(Number(e.target.value))}
                >
                  {bonusCategories?.categories
                    ?.filter(
                      (item: any) => item.txn_type_category === selectedCategory
                    )
                    .map((category: any, index: number) => (
                      <MenuItem key={index} value={category.txn_type_code}>
                        {category.txn_type_desc}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Box>
          </div>
          <div className="mt-4 md:mt-0 md:flex items-center">
            <Button
              variant="contained"
              disabled={selectedCategory == ''}
              onClick={() => setShowDialog(true)}
            >
              Create New Type
            </Button>
          </div>
        </div>

        <div>
          <p>List of Wallet Addresses</p>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="md:flex gap-8">
              <div className="w-full md:w-3/5">
                <TextField
                  fullWidth
                  size="medium"
                  type="text"
                  multiline
                  rows={5}
                  className="bg-white mr-8"
                  required
                  inputProps={{
                    style: {
                      padding: 10,
                    },
                  }}
                  {...register('walletList', {
                    required: true,
                  })}
                />
                <p className="my-0 text-sm">
                  Note: Multiple wallet addresses should be separated by comma.
                </p>
              </div>
              <div className="md:flex flex-col md:w-2/5">
                <TextField
                  label="Bonus Amount"
                  type="text"
                  size="small"
                  fullWidth
                  className="mt-4 md:mt-0 bg-white mr-8"
                  required
                  {...register('amount', {
                    required: true,
                  })}
                />
                <TextField
                  label="Memo (Optional)"
                  type="text"
                  size="small"
                  multiline
                  rows={4}
                  fullWidth
                  className="mt-4 bg-white mr-8"
                  {...register('memo')}
                />
              </div>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <Button variant="contained" disabled={isLoading} type="submit">
                {isLoading ? 'Sending' : 'Send'}
              </Button>
              <p className="text-right font-bold my-0">
                Total to Send:{' '}
                {currency(totalToSend(), {
                  precision: 2,
                  symbol: '',
                }).format()}
              </p>
            </div>
          </form>
        </div>
      </div>

      <div className="max-w-6xl mx-auto my-12">
        <div className="md:flex justify-between items-center">
          <h3>Transfer History</h3>
          <div className="my-6 md:my-0">
            <CSVLink
              data={formattedData}
              filename={`bonus-transfer-history-${excelDate}.csv`}
              className="btn bg-brand-blue-dark text-white py-3 px-4 rounded"
              target="_blank"
              headers={headers}
              onClick={() => setDate(new Date())}
            >
              Download CSV
            </CSVLink>
          </div>
        </div>
        <Box sx={{ overflow: 'auto' }}>
          <Box sx={{ width: '100%', display: 'table', tableLayout: 'fixed' }}>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead className="bg-brand-blue-dark">
                  <TableRow>
                    <TableCell
                      align="center"
                      className="text-white hover:text-white"
                    >
                      Pool
                    </TableCell>
                    <TableCell
                      align="center"
                      className="text-white hover:text-white"
                    >
                      Category
                    </TableCell>
                    <TableCell
                      align="center"
                      className="text-white hover:text-white"
                    >
                      Wallet Address
                    </TableCell>
                    <TableCell
                      align="center"
                      className="text-white hover:text-white"
                    >
                      Distribution Type
                    </TableCell>
                    <TableCell
                      align="center"
                      className="text-white hover:text-white"
                    >
                      Amount
                    </TableCell>
                    <TableCell
                      align="center"
                      className="text-white hover:text-white"
                    >
                      Memo
                    </TableCell>
                    <TableCell
                      align="center"
                      className="text-white hover:text-white"
                    >
                      Date
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transferTxs ? (
                    transferTxs.map((tx: any, index: number) => (
                      <TableRow
                        key={index}
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                        }}
                      >
                        <TableCell align="center">{tx?.pool_name}</TableCell>
                        <TableCell align="center">
                          {tx?.txn_type_category}
                        </TableCell>
                        <TableCell align="center">{tx?.p_wallet_id}</TableCell>
                        <TableCell align="center">
                          {tx?.txn_type_desc}
                        </TableCell>
                        <TableCell align="center">
                          {tx?.amount &&
                            currency(Number(tx?.amount) / 1000000, {
                              symbol: '',
                              precision: 2,
                            }).format()}
                        </TableCell>
                        <TableCell align="center">{tx?.memo}</TableCell>
                        <TableCell align="center">
                          {tx?.txn_timestamp &&
                            format(
                              formatUTCDate(tx?.txn_timestamp),
                              'yyyy-MM-dd'
                            )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <div className="text-center">No transactions found!</div>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
      </div>

      <Dialog
        open={showDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Create New Type</DialogTitle>
        <DialogContent className="w-full md:w-[400px]">
          <TextField
            label="Bonus Name"
            type="text"
            fullWidth
            className="mt-2 bg-white"
            required
            value={newBonusType}
            onChange={(e) => setNewBonusType(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setShowDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={!newBonusType}
            onClick={() => {
              addNewBonusType({
                txn_type_category: selectedCategory,
                txn_type_desc: newBonusType,
              })
              setShowDialog(false)
            }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

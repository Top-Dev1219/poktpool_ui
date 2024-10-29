import { useState } from 'react'
import {
  TextField,
  Button,
  Box,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  Alert,
} from '@mui/material'
import { useQuery, useMutation } from 'react-query'
import axios from 'axios'
import useAccessToken from '../../../../../hooks/useAccessToken'

export const PromoCode = () => {
  const accessToken = useAccessToken()
  const [promoCode, setPromoCode] = useState('')
  const [success, setSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [hasError, setHasError] = useState(false)

  const { data: userPromoData, refetch } = useQuery(
    'User Promotion Data',
    () =>
      axios
        .get(`user/promotions`, {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        })
        .then((res) => res.data),
    { enabled: !!accessToken }
  )

  const { mutate: submitPromoCode, isLoading } = useMutation(
    ({ code }: { code: string }) =>
      axios.post(
        'user/promo-code',
        { code },
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
        refetch()
        setSuccess(true)
      },
      onError: (error: any) => {
        setHasError(true)
        setErrorMsg(error.response.data.message)
      },
    }
  )

  return (
    <>
      <h2>Promotion Code</h2>

      {success && (
        <div className="my-8">
          <Alert severity="success" onClose={() => setSuccess(false)}>
            A confirmation email sent. Please check your mailbox and confirm the
            change.
          </Alert>
        </div>
      )}

      {hasError && (
        <div className="my-8">
          <Alert severity="error" onClose={() => setHasError(false)}>
            {errorMsg}
          </Alert>
        </div>
      )}

      <div className="w-full md:w-3/5 flex gap-8">
        <TextField
          label="Enter Promotion Code"
          size="medium"
          type="text"
          fullWidth
          value={promoCode}
          InputLabelProps={{
            shrink: true,
          }}
          onChange={(e) => setPromoCode(e.target.value)}
        />
        <Button
          variant="contained"
          size="large"
          className="px-8"
          disabled={!promoCode || isLoading}
          onClick={() => submitPromoCode({ code: promoCode })}
        >
          Submit
        </Button>
      </div>
      <div className="mt-8">
        <h3>Your Active Promotions</h3>
        <Box sx={{ overflow: 'auto' }}>
          <Box sx={{ width: '100%', display: 'table', tableLayout: 'fixed' }}>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 450 }} aria-label="simple table">
                <TableHead className="bg-brand-blue-dark">
                  <TableRow>
                    <TableCell
                      align="center"
                      className="text-white hover:text-white"
                    >
                      Promo Code
                    </TableCell>
                    <TableCell
                      align="center"
                      className="text-white hover:text-white"
                    >
                      Promo Name
                    </TableCell>
                    <TableCell
                      align="center"
                      className="text-white hover:text-white"
                    >
                      Promo Description
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {userPromoData && userPromoData.length
                    ? userPromoData.map((promo: any, index: number) => (
                        <TableRow
                          key={index}
                          sx={{
                            '&:last-child td, &:last-child th': { border: 0 },
                          }}
                        >
                          <TableCell align="center">
                            {promo?.promo_code}
                          </TableCell>
                          <TableCell align="center">
                            {promo?.promo_name}
                          </TableCell>
                          <TableCell align="center">
                            {promo?.promo_desc}
                          </TableCell>
                        </TableRow>
                      ))
                    : 'No Promo Code Found!'}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
      </div>
    </>
  )
}

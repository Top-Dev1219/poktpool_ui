import {
  Alert,
  AlertTitle,
  Button,
  TextField,
  FormControl,
  OutlinedInput,
  InputAdornment,
  InputLabel,
  IconButton,
} from '@mui/material'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { FieldValues, useForm } from 'react-hook-form'
import axios from 'axios'
import { sanitize } from 'dompurify'
import PageLayout from '../components/PageLayout'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'

export default function ResetPassword() {
  const {
    query: { token },
  } = useRouter()
  const { handleSubmit, register } = useForm()
  const [showSuccess, setShowSuccess] = useState(false)
  const [errors, setErrors] = useState([])
  const [errorTitle, setErrorTitle] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleClickShowPassword = () => setShowPassword((show) => !show)

  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault()
  }

  const onSubmit = ({ password }: FieldValues) => {
    axios
      .post(
        'auth/reset-password',
        { password: sanitize(password) },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        const { data } = res
        if (res.status === 200 || res.status === 201) {
          setShowSuccess(data.message)
        }

        return data
      })
      .catch(({ response }) => {
        const message = response?.data?.message
        setErrorTitle(response.data.error)
        setErrors(typeof message === 'string' ? [message] : message)
      })
  }

  return (
    <PageLayout title="Reset Password">
      <section>
        <div className="container mx-auto px-4 prose">
          <form onSubmit={handleSubmit(onSubmit)}>
            <h1>Reset Password</h1>
            {showSuccess ? (
              <p>{showSuccess}</p>
            ) : (
              <>
                <div className="grid gap-8 mb-8">
                  {errors.length > 0 && (
                    <Alert severity="error">
                      {errorTitle && <AlertTitle>{errorTitle}</AlertTitle>}
                      <ul className="not-prose">
                        {errors.map((error: string) => (
                          <li key={error} className="list-none">
                            {error}
                          </li>
                        ))}
                      </ul>
                    </Alert>
                  )}
                  <FormControl variant="outlined">
                    <InputLabel htmlFor="outlined-adornment-password">
                      Password
                    </InputLabel>
                    <OutlinedInput
                      id="outlined-adornment-password"
                      type={showPassword ? 'text' : 'password'}
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
                            onMouseDown={handleMouseDownPassword}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      }
                      label="Password"
                      {...register('password', { required: true })}
                    />
                  </FormControl>
                </div>
                <div className="inline-grid grid-flow-col gap-2">
                  <Button variant="contained" type="submit">
                    Reset Password
                  </Button>
                </div>
              </>
            )}
          </form>
        </div>
      </section>
    </PageLayout>
  )
}

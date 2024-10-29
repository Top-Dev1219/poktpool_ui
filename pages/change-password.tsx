import {
  Alert,
  AlertTitle,
  Button,
  TextField,
  FormControl,
  OutlinedInput,
  InputAdornment,
  IconButton,
  InputLabel,
  FormHelperText,
} from '@mui/material'
import { signIn, useSession } from 'next-auth/react'
import { useState } from 'react'
import { FieldValues, useForm } from 'react-hook-form'
import axios from 'axios'
import { sanitize } from 'dompurify'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import PageLayout from '../components/PageLayout'

export default function ChangePassword() {
  const {
    formState: { errors },
    handleSubmit,
    register,
    getValues,
  } = useForm()
  const [showSuccess, setShowSuccess] = useState(false)
  const [errMsgs, setErrors] = useState([])
  const [errorTitle, setErrorTitle] = useState('')
  const { status, data: session } = useSession()
  const [showPassword, setShowPassword] = useState<boolean[]>([
    false,
    false,
    false,
  ])

  const handleClickShowPassword = (index: number) => {
    const updatedShowPassword = [...showPassword]
    updatedShowPassword[index] = !updatedShowPassword[index]
    setShowPassword(updatedShowPassword)
  }

  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault()
  }

  const onSubmit = ({ email, password, newPassword }: FieldValues) => {
    axios
      .post(
        'auth/change-password',
        {
          email: sanitize(email),
          password: sanitize(password),
          newPassword: sanitize(newPassword),
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.accessToken}`,
          },
        }
      )
      .then((res) => {
        const data = res.data
        if (res.status === 200 || res.status === 201) {
          setShowSuccess(data.message)
        } else if (data.statusCode >= 400) {
          setErrorTitle(data.error)
          setErrors(
            typeof data.message === 'string' ? [data.message] : data.message
          )
        }
        return data
      })
      .catch((error) => {
        setErrorTitle(error?.response?.data?.error)
        const errorMsg =
          typeof error?.response?.data?.message === 'string'
            ? [error?.response?.data?.message]
            : error?.response?.data?.message
        setErrors(errorMsg)
      })
  }

  if (status === 'unauthenticated') {
    signIn()
  }

  return (
    <PageLayout title="Change Password">
      {status === 'authenticated' && (
        <section className="">
          <div className="container mx-auto px-4 prose">
            <form onSubmit={handleSubmit(onSubmit)}>
              <h1>Change Password</h1>
              {showSuccess ? (
                <p>{showSuccess}</p>
              ) : (
                <>
                  <div className="grid gap-8 mb-8">
                    {errMsgs.length > 0 && (
                      <Alert severity="error">
                        {errorTitle && <AlertTitle>{errorTitle}</AlertTitle>}
                        <ul className="not-prose">
                          {errMsgs.map((error: string) => (
                            <li key={error} className="list-none">
                              {error}
                            </li>
                          ))}
                        </ul>
                      </Alert>
                    )}
                    <TextField
                      label="Email"
                      type="text"
                      {...register('email', { required: true })}
                    />
                    <FormControl variant="outlined">
                      <InputLabel htmlFor="outlined-adornment-password">
                        Password
                      </InputLabel>
                      <OutlinedInput
                        id="outlined-adornment-password"
                        type={showPassword[0] ? 'text' : 'password'}
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={() => handleClickShowPassword(0)}
                              onMouseDown={handleMouseDownPassword}
                              edge="end"
                            >
                              {showPassword[0] ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        }
                        label="Password"
                        {...register('password', { required: true })}
                      />
                    </FormControl>
                    <FormControl variant="outlined">
                      <InputLabel htmlFor="outlined-adornment-password">
                        New Password
                      </InputLabel>
                      <OutlinedInput
                        id="outlined-adornment-password"
                        type={showPassword[1] ? 'text' : 'password'}
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={() => handleClickShowPassword(1)}
                              onMouseDown={handleMouseDownPassword}
                              edge="end"
                            >
                              {showPassword[1] ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        }
                        label="New Password"
                        error={!!errors.newPassword}
                        {...register('newPassword', {
                          required: true,
                          validate: {
                            hasUpper: (v) => /[A-Z]/.test(v),
                            hasLower: (v) => /[a-z]/.test(v),
                            hasLength: (v) => v.length >= 8 && v.length <= 63,
                            hasSymbol: (v) => /\W/.test(v),
                          },
                        })}
                      />
                      <FormHelperText id="my-helper-text">
                        Password must be between 8 and 63 characters including
                        at least one symbol, capital letter, lowercase letter,
                        and number.
                      </FormHelperText>
                    </FormControl>
                    <FormControl variant="outlined">
                      <InputLabel htmlFor="outlined-adornment-password">
                        Confirm New Password
                      </InputLabel>
                      <OutlinedInput
                        id="outlined-adornment-password"
                        type={showPassword[2] ? 'text' : 'password'}
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={() => handleClickShowPassword(2)}
                              onMouseDown={handleMouseDownPassword}
                              edge="end"
                            >
                              {showPassword[2] ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        }
                        label="Confirm New Password?"
                        error={!!errors.confirmNewPassword}
                        {...register('confirmNewPassword', {
                          validate: (value) =>
                            value === getValues('newPassword'),
                        })}
                      />
                      <FormHelperText id="my-helper-text">
                        {errors.confirmNewPassword && 'Passwords must match.'}
                      </FormHelperText>
                    </FormControl>
                  </div>
                  <div className="inline-grid grid-flow-col gap-2">
                    <Button variant="contained" type="submit">
                      Change Password
                    </Button>
                  </div>
                </>
              )}
            </form>
          </div>
        </section>
      )}
    </PageLayout>
  )
}

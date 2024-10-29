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
  FormHelperText,
} from '@mui/material'
import { signIn, useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import qs from 'qs'
import { sanitize } from 'dompurify'
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import PageLayout from '../components/PageLayout'
import ForgotPasswordModal from '../components/modals/ForgotPasswordModal'

export default function Login() {
  const { handleSubmit, register } = useForm()
  const { data: session, status } = useSession()
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] =
    useState(false)
  const router = useRouter()
  const { executeRecaptcha } = useGoogleReCaptcha()
  const redirectOnLogin = '/my-portfolio'

  const [showPassword, setShowPassword] = useState(false)

  const handleClickShowPassword = () => setShowPassword((show) => !show)

  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault()
  }

  useEffect(() => {
    if (status === 'authenticated') {
      router.push(redirectOnLogin)
    }
  }, [router, status])

  const onSubmit = (data: any) => {
    const callbackUrl = `${
      qs.parse(router.asPath.split('?')[1]).callbackUrl ?? redirectOnLogin
    }`

    executeRecaptcha?.('enquiryFormSubmit').then((gReCaptchaToken) => {
      if (data.twoFactorCode) {
        signIn('2fa-username-login', {
          username: sanitize(data.username),
          password: sanitize(data.password),
          twoFactorCode: sanitize(data.twoFactorCode),
          recaptcha: gReCaptchaToken,
          callbackUrl,
        })
      } else {
        signIn('username-login', {
          username: sanitize(data.username),
          password: sanitize(data.password),
          recaptcha: gReCaptchaToken,
          callbackUrl,
        })
      }
    })
  }

  const errorMessages =
    typeof router.query.errorMsg === 'string'
      ? router.query.errorMsg.split(';')
      : []

  return (
    <PageLayout title="Login">
      <ForgotPasswordModal
        open={isForgotPasswordModalOpen}
        onClose={() => setIsForgotPasswordModalOpen(false)}
      />
      {status === 'unauthenticated' && (
        <section className="">
          <div className="container mx-auto px-4 prose">
            <form onSubmit={handleSubmit(onSubmit)}>
              <h1>Login</h1>
              <div className="grid gap-8 mb-8">
                {router.query.errorMsg && (
                  <Alert severity="error">
                    <AlertTitle>Error</AlertTitle>
                    {errorMessages.length > 1 ? (
                      <ul>
                        {errorMessages.map((message: string) => (
                          <li key={message}>{message}</li>
                        ))}
                      </ul>
                    ) : (
                      <span>
                        Login failed. Please ensure that the username and
                        password are correct. If you have set up two-factor
                        authentication, you must provide the code along with
                        your credentials to sign in.
                      </span>
                    )}
                  </Alert>
                )}
                {router.query.error === '2faEnabled' && (
                  <Alert severity="error">
                    You have two-factor authentication enabled. Please provide
                    an authenticator code.
                  </Alert>
                )}
                {router.query.error && router.query.error !== '2faEnabled' && (
                  <Alert severity="error">
                    Login failed. Please ensure that the username and password
                    are correct. If you have set up two-factor authentication,
                    you must provide the code along with your credentials to
                    sign in.
                  </Alert>
                )}
                <TextField
                  label="Username"
                  type="text"
                  {...register('username', { required: true })}
                />
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
                  <FormHelperText id="my-helper-text">
                    <span>
                      Forgot your username or password?{' '}
                      <span
                        role="button"
                        className="underline cursor-pointer"
                        onClick={() => setIsForgotPasswordModalOpen(true)}
                      >
                        Reset username or password
                      </span>
                    </span>
                  </FormHelperText>
                </FormControl>
                <TextField
                  label="Authenticator Code"
                  type="text"
                  helperText="Only required if you have two-factor authentication enabled"
                  {...register('twoFactorCode')}
                />
              </div>
              <div className="inline-grid grid-flow-col gap-2">
                <Button variant="contained" type="submit">
                  Login
                </Button>
                <Link passHref href="/join">
                  <Button>Create Account</Button>
                </Link>
              </div>
            </form>
          </div>
        </section>
      )}
    </PageLayout>
  )
}

import {
  Alert,
  AlertTitle,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Tab,
  Tabs,
  TextField,
  FormControl,
  OutlinedInput,
  InputAdornment,
  InputLabel,
  IconButton,
  FormHelperText,
} from '@mui/material'
import { AnimatePresence, motion } from 'framer-motion'
import fs from 'fs'
import { GetStaticProps } from 'next'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import { MDXRemoteSerializeResult } from 'next-mdx-remote'
import { serialize } from 'next-mdx-remote/serialize'
import path from 'path'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import PageLayout from '../components/PageLayout'
import Button from '../components/Button'
import { useQuery } from 'react-query'
import parse from 'html-react-parser'
import CircularProgress from '@mui/material/CircularProgress'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3'

export default function CreateAccount({
  termsOfServiceSource,
}: {
  termsOfServiceSource: MDXRemoteSerializeResult
}) {
  const [accountCreated, setAccountCreated] = useState(false)
  const {
    formState: { errors },
    getValues,
    handleSubmit,
    register,
    watch,
  } = useForm()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isExistingUser, setIsExistingUser] = useState(false)
  const [blogData, setBlogData] = useState<any>()
  const [error, setError] = useState('')
  const watchTerms = watch('terms')
  const { executeRecaptcha } = useGoogleReCaptcha()

  const [showPassword, setShowPassword] = useState<boolean[]>([false, false])

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

  const { isLoading, data, refetch } = useQuery(
    'wp/terms-of-service',
    () =>
      fetch(
        `${process.env.NEXT_PUBLIC_WORDPRESS_BASE_URL}/wp-json/wp/v2/pages`
      ).then((res) => res.json()),
    { enabled: true }
  )

  useEffect(() => {
    if (status === 'authenticated') router.push('/')
  }, [accountCreated, router, status])

  useEffect(() => {
    if (router.query.existing_user) {
      setIsExistingUser(true)
    } else {
      setIsExistingUser(false)
    }
  }, [router.query.existing_user])

  useEffect(() => {
    setBlogData(
      data?.filter(
        (item: any) => item.slug === 'terms-of-serviceofpoktpool-inc'
      )?.[0]
    )
  }, [data])

  const onSubmit = async (data: object) => {
    executeRecaptcha?.('enquiryFormSubmit').then((gReCaptchaToken) => {
      axios
        .post(
          `${isExistingUser ? 'auth/match-user' : 'auth/signup-recaptcha'}`,
          data,
          {
            headers: {
              'Content-Type': 'application/json',
              recaptcha: gReCaptchaToken,
            },
          }
        )
        .then((res) => {
          setError('')
          setAccountCreated(true)
          return res.data
        })
        .catch(({ response }) => {
          if (typeof window !== 'undefined') {
            window.scrollTo(0, 0)
          }
          setError(response?.data.message)
        })
    })
  }

  return (
    <PageLayout title="Create Account">
      <AnimatePresence>
        {error && (
          <Alert severity="error" className="mb-8">
            <AlertTitle>{error}</AlertTitle>
          </Alert>
        )}
        {status === 'unauthenticated' && (
          <div className="container mx-auto px-4 prose">
            {!accountCreated && (
              <Tabs
                className="mb-8"
                value={isExistingUser ? 'existing' : 'new'}
                onChange={(event, value) =>
                  setIsExistingUser(value === 'existing')
                }
                aria-label="User sign-up forms"
              >
                <Tab label="New User" value="new" />
                <Tab label="Existing Staked Member" value="existing" />
              </Tabs>
            )}
            <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {isExistingUser ? `Existing Member Sign-Up` : `Create Account`}
            </motion.h1>
            {accountCreated && !session?.user ? (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                An activation link will be sent to your e-mail.
              </motion.p>
            ) : (
              <motion.form
                onSubmit={handleSubmit(onSubmit)}
                className="not-prose"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Alert
                  severity="info"
                  className="rounded-md info-alert-style mb-4 text-brand-blue-dark"
                >
                  If you signed up during the website beta in 2022, visit the
                  Login page and use the credentials you made during beta to
                  access your account.
                </Alert>
                <div className="grid gap-8 mb-8">
                  <TextField
                    error={!!errors.username}
                    helperText={errors?.username?.message}
                    label="Username"
                    {...register('username', {
                      required: true,
                      minLength: {
                        value: 5,
                        message: 'Must be at least 5 characters long.',
                      },
                    })}
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
                      error={!!errors.password}
                      {...register('password', {
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
                      Password must be between 8 and 63 characters including at
                      least one symbol, capital letter, lowercase letter, and
                      number.
                    </FormHelperText>
                  </FormControl>
                  <FormControl variant="outlined">
                    <InputLabel htmlFor="outlined-adornment-password">
                      Confirm Password
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
                      label="Confirm Password?"
                      error={!!errors.confirmPassword}
                      {...register('confirmPassword', {
                        validate: (value) => value === getValues('password'),
                      })}
                    />
                    <FormHelperText id="my-helper-text">
                      {errors.confirmPassword && 'Passwords must match.'}
                    </FormHelperText>
                  </FormControl>
                  <TextField
                    helperText={errors?.firstName?.message}
                    error={!!errors.firstName}
                    label="First Name"
                    {...register('firstName', {
                      required: true,
                    })}
                  />
                  <TextField
                    helperText={errors?.lastName?.message}
                    error={!!errors.lastName}
                    label="Last Name"
                    {...register('lastName', {
                      required: true,
                    })}
                  />
                  <TextField
                    helperText={errors?.email?.message}
                    error={!!errors.email}
                    label="Email Address"
                    type="email"
                    {...register('email', {
                      required: true,
                      minLength: {
                        value: 1,
                        message: 'Must be at least 1 character long.',
                      },
                    })}
                  />
                  {isExistingUser && (
                    <TextField
                      helperText={errors?.primaryWalletId?.message}
                      error={!!errors.primaryWalletId}
                      label="POKT Wallet Address"
                      {...register('primaryWalletId', {
                        required: true,
                        minLength: {
                          value: 40,
                          message: 'Must be at least 40 characters long.',
                        },
                      })}
                    />
                  )}

                  <FormGroup>
                    <div className="overflow-scroll shadow-inner p-4 mb-8 bg-gradient-to-t from-gray-100 to-white  max-h-96">
                      <h1 className="text-center text-2xl leading-tight">
                        Terms of Service
                        <br /> of
                        <br /> poktpool, inc.
                      </h1>
                      {isLoading ? (
                        <div className="flex justify-center items-center">
                          <CircularProgress />
                        </div>
                      ) : (
                        <>
                          {blogData?.content?.rendered &&
                            parse(blogData?.content?.rendered)}
                        </>
                      )}
                    </div>
                    <FormControlLabel
                      control={<Checkbox />}
                      label="I have read and agree to the terms and services."
                      {...register('terms', {
                        required: true,
                        validate: (value) => value === true,
                      })}
                    />
                  </FormGroup>
                </div>
                <Button
                  variant="contained"
                  type="submit"
                  disabled={!watchTerms}
                >
                  Create Your Account
                </Button>
              </motion.form>
            )}
          </div>
        )}
      </AnimatePresence>
    </PageLayout>
  )
}

export const getStaticProps: GetStaticProps<{
  termsOfServiceSource: MDXRemoteSerializeResult
}> = async () => {
  const source = fs.readFileSync(
    path.join(process.cwd(), 'src/terms-of-service.mdx'),
    'utf8'
  )
  const mdxSource = await serialize(source)

  return { props: { termsOfServiceSource: mdxSource } }
}

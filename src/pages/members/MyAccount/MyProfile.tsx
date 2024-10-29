import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Alert,
  AlertTitle,
  TextField,
  Button as MuiButton,
  IconButton,
  Grid,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  FormControl,
  OutlinedInput,
  InputAdornment,
  InputLabel,
} from '@mui/material'
import ModeEditIcon from '@mui/icons-material/ModeEdit'
import SaveIcon from '@mui/icons-material/Save'
import CloseIcon from '@mui/icons-material/Close'
import LockIcon from '@mui/icons-material/Lock'
import ImageIcon from '@mui/icons-material/Image'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import { useQuery, useMutation } from 'react-query'
import Resizer from 'react-image-file-resizer'
import useAccessToken from '../../../../hooks/useAccessToken'
import axios from 'axios'
import { sanitize } from 'dompurify'
import useApi from '../../../../hooks/useApi'
import Button from '../../../../components/Button'
import { ContactInfo } from './components/ContactInfo'
import { PromoCode } from './components/PromoCode'
import useCustomerId from '../../../../hooks/useCustomerId'

export const MyProfile = ({
  user,
  loading,
  refetchUser,
}: {
  user?: any
  loading: boolean
  refetchUser: () => void
}) => {
  const accessToken = useAccessToken()
  const [unameModalopen, setUnameModalOpen] = useState(false)
  const [emailModalOpen, setEmailModalOpen] = useState(false)
  const { customerId } = useCustomerId()
  const [isConfirmationResent, setIsConfirmationResent] = useState(false)
  const [username, setUsername] = useState(user?.username)
  const [patchError, setPatchError] = useState('')
  const [hasPatchError, setHasPatchError] = useState(false)
  const [patchSuccess, setPatchSuccess] = useState(false)
  const [emailUpdateSuccess, setEmailUpdateSuccess] = useState(false)
  const [imgUploadSuccess, setImgUploadSuccess] = useState(false)
  const [password, setPassword] = useState('')
  const [userEmail, setUserEmail] = useState(user?.email)
  const [editUsername, setEditUsername] = useState(false)
  const [editEmail, setEditEmail] = useState(false)
  const [imgInstance, setImgInstance] = useState<any>(undefined)
  const [imgUri, setImgUri] = useState('')
  const [imgDeleteSuccess, setImgDeleteSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleClickShowPassword = () => setShowPassword((show) => !show)

  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault()
  }

  const { post: resendConfirmEmail } = useApi('confirm-email/resend-confirm')

  const { data: userDataQuery } = useQuery(
    'userData',
    () =>
      axios
        .get(`user/data?customerId=${customerId}`, {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        })
        .then((res) => res.data),
    { enabled: !!accessToken && !!customerId }
  )

  const { mutate: updateUsername } = useMutation(
    ({ username, password }: { username: string; password: string }) =>
      axios.patch(
        'profile/username',
        { username: sanitize(username), password: sanitize(password) },
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

        refetchUser()

        if (data?.error) {
          setPatchError(data?.message)
        } else {
          setPatchSuccess(true)
        }
      },
      onError: (error: any) => {
        setHasPatchError(true)
        setPatchError(error.response.data.message)
        setUsername(user?.username)
      },
    }
  )

  const { mutate: updateUserEmail } = useMutation(
    ({ email, password }: { email: string; password: string }) =>
      axios.patch(
        'profile/email',
        { email: sanitize(email), password: sanitize(password) },
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

        refetchUser()

        if (data?.error) {
          setPatchError(data?.message)
        } else {
          setEmailUpdateSuccess(true)
        }
      },
      onError: (error: any) => {
        setHasPatchError(true)
        setPatchError(error.response.data.message)
        setUserEmail(user?.email)
      },
    }
  )

  const handleUpdateUsername = () => {
    setEditUsername(false)
    updateUsername({ username, password })
    setUnameModalOpen(false)
  }

  const handleUpdateEmail = () => {
    setEditEmail(false)
    updateUserEmail({ email: userEmail, password })
    setEmailModalOpen(false)
  }

  const resizeFile = (file: any) =>
    new Promise((resolve) => {
      Resizer.imageFileResizer(
        file,
        300,
        300,
        'jpg',
        50,
        0,
        (uri) => {
          resolve(uri)
        },
        'file'
      )
    })

  const handleSetImg = async (e: any) => {
    try {
      const file = e.target.files[0]
      const image = await resizeFile(file)
      setImgUri(URL.createObjectURL(image as any))
      const formData = new FormData()
      formData.append('file', file)

      setImgInstance(formData)
    } catch (err) {
      console.log(err)
    }
  }

  const { mutate: uploadAvatar } = useMutation(
    (formData) =>
      axios.put('profile/photo', formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data',
        },
      }),
    {
      onSuccess: async (res) => {
        const data = await res.data

        refetchUser()

        setImgUploadSuccess(true)
      },
      onError: (error: any) => {
        setHasPatchError(true)
        setPatchError(error.response.data.message)
      },
    }
  )

  const { mutate: deleteAvatar } = useMutation(
    () =>
      axios.delete('profile/photo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data',
        },
      }),
    {
      onSuccess: async (res) => {
        const data = await res.data

        refetchUser()
        setImgUri('')
        setImgDeleteSuccess(true)
      },
      onError: (error: any) => {
        setHasPatchError(true)
        setPatchError(error.response.data.message)
      },
    }
  )

  useEffect(() => {
    setUsername(user.username)
    setUserEmail(user.email)
  }, [user])

  return (
    <>
      <div className="max-w-5xl mx-auto">
        <header>
          {!loading && !user?.isEmailVerified && (
            <div className="mb-8">
              <Alert
                severity="warning"
                className="warning-alert-style text-brand-orange"
              >
                <AlertTitle>
                  <strong>Verify your email address.</strong>
                </AlertTitle>
                <p>
                  You won&apos;t be able to stake or withdraw until you&apos;ve
                  verified your email address by visiting the link sent to your
                  account&apos;s email.
                </p>
                <div className="inline-block">
                  {!isConfirmationResent && (
                    <Button
                      onClick={() =>
                        resendConfirmEmail()
                          .then(setIsConfirmationResent(true))
                          .catch(console.error)
                      }
                    >
                      Resend Verification Email
                    </Button>
                  )}
                </div>
              </Alert>
            </div>
          )}
        </header>
        {emailUpdateSuccess && (
          <div className="mb-12">
            <Alert
              severity="info"
              className="info-alert-style text-brand-blue-dark"
              onClose={() => setEmailUpdateSuccess(false)}
            >
              A confirmation email sent. Please check your mailbox and confirm
              the change.
            </Alert>
          </div>
        )}

        {imgUploadSuccess && (
          <div className="my-12">
            <Alert
              severity="info"
              className="info-alert-style text-brand-blue-dark"
              onClose={() => setImgUploadSuccess(false)}
            >
              Your profile avatar has been uploaded successfully.
            </Alert>
          </div>
        )}

        {imgDeleteSuccess && (
          <div className="my-12">
            <Alert
              severity="info"
              className="info-alert-style text-brand-blue-dark"
              onClose={() => setImgDeleteSuccess(false)}
            >
              Your profile avatar has been removed successfully.
            </Alert>
          </div>
        )}

        <Alert
          severity="info"
          className="info-alert-style text-brand-blue-dark mt-8"
        >
          Enter your promo codes in the section below to opt in.
        </Alert>

        <div className="sm:flex">
          <div className="w-4/5 sm:w-3/4">
            <h2 className="mt-8">Profile</h2>
            <Grid container spacing={3}>
              <Grid item xs={10} sm={9}>
                <TextField
                  label="Username"
                  disabled={!editUsername}
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </Grid>
              <Grid item xs={2} sm={3}>
                {editUsername ? (
                  <div className="flex sm:block">
                    <IconButton
                      className="rounded-md p-4 border-solid bg-green-500 text-white hover:bg-green-600 hover:text-white"
                      onClick={() => setUnameModalOpen(true)}
                    >
                      <SaveIcon />
                    </IconButton>
                    <IconButton
                      className="rounded-md p-4 border-solid bg-gray-300 text-white hover:bg-gray-400 ml-2"
                      onClick={() => setEditUsername(false)}
                    >
                      <CloseIcon />
                    </IconButton>
                  </div>
                ) : (
                  <IconButton
                    className="rounded-md p-4 border border-gray-400 border-solid hover:bg-brand-blue-dark hover:border-brand-blue-dark hover:text-white"
                    onClick={() => setEditUsername(true)}
                  >
                    <ModeEditIcon />
                  </IconButton>
                )}
              </Grid>
              <Grid item xs={10} sm={9}>
                <TextField
                  label="Email Address"
                  type="email"
                  disabled={!editEmail}
                  fullWidth
                  value={userEmail}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  onChange={(e) => setUserEmail(e.target.value)}
                />
              </Grid>
              <Grid item xs={2} sm={3}>
                {editEmail ? (
                  <div className="flex sm:block">
                    <IconButton
                      className="rounded-md p-4 border-solid bg-green-500 text-white hover:bg-green-600 hover:text-white"
                      onClick={() => setEmailModalOpen(true)}
                    >
                      <SaveIcon />
                    </IconButton>
                    <IconButton
                      className="rounded-md p-4 border-solid bg-gray-300 text-white hover:bg-gray-400 ml-2"
                      onClick={() => setEditEmail(false)}
                    >
                      <CloseIcon />
                    </IconButton>
                  </div>
                ) : (
                  <IconButton
                    className="rounded-md p-4 border border-gray-400 border-solid hover:bg-brand-blue-dark hover:border-brand-blue-dark hover:text-white"
                    onClick={() => setEditEmail(true)}
                  >
                    <ModeEditIcon />
                  </IconButton>
                )}
              </Grid>
              <Grid item xs={10} sm={9}>
                <TextField
                  label="POKT Wallet Address"
                  disabled
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                  value={userDataQuery?.wallet_address}
                />
              </Grid>
              <Grid item sm={9}>
                <Link passHref href="/change-password">
                  <MuiButton
                    variant="contained"
                    size="large"
                    startIcon={<LockIcon />}
                  >
                    Change Password
                  </MuiButton>
                </Link>
              </Grid>
            </Grid>
          </div>
          <div className="w-full sm:w-1/4 lg:pl-10">
            <h2 className="mt-8">User Avatar</h2>
            <MuiButton
              className="border border-solid border-slate-400 rounded-md p-8 flex justify-center items-center aspect-square"
              component="label"
            >
              <input
                hidden
                accept="image/jpeg, image/png"
                type="file"
                onChange={(e) => handleSetImg(e)}
              />
              {imgUri || user?.userIconUrl ? (
                <Image
                  className="rounded-md object-cover border-2 border-solid border-slate-400"
                  width="100%"
                  height="100%"
                  layout="fill"
                  src={imgUri ? imgUri : user?.userIconUrl}
                  alt="User Avatar"
                />
              ) : (
                <ImageIcon className="text-slate-400 text-8xl" />
              )}
            </MuiButton>
            <div className="w-full">
              <MuiButton
                variant="contained"
                size="large"
                className="w-full mt-4"
                onClick={() => uploadAvatar(imgInstance)}
              >
                Upload
              </MuiButton>
            </div>
            {(imgUri || user?.userIconUrl) && (
              <div className="w-full">
                <MuiButton
                  variant="contained"
                  size="large"
                  className="w-full mt-2 bg-brand-light-grey hover:bg-brand-light-grey"
                  onClick={() => deleteAvatar()}
                >
                  Delete
                </MuiButton>
              </div>
            )}
          </div>
        </div>

        <div className="mt-20">
          <ContactInfo />
        </div>

        <div className="mt-16">
          <PromoCode />
        </div>

        <Dialog
          open={unameModalopen}
          onClose={() => setUnameModalOpen(false)}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            {'Change username?'}
          </DialogTitle>
          <DialogContent>
            <p className="mt-0">
              Your new username is <span className="font-bold">{username}</span>
              .
            </p>
            <FormControl variant="outlined" fullWidth>
              <InputLabel htmlFor="outlined-adornment-password">
                Password
              </InputLabel>
              <OutlinedInput
                id="outlined-adornment-password"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                autoComplete="current-password"
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
                onChange={(e) => setPassword(e.target.value)}
              />
            </FormControl>
          </DialogContent>
          <DialogActions>
            <MuiButton variant="contained" onClick={handleUpdateUsername}>
              Change
            </MuiButton>
            <Button onClick={() => setUnameModalOpen(false)} autoFocus>
              Cancel
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={emailModalOpen}
          onClose={() => setEmailModalOpen(false)}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            Confirm your new email address
          </DialogTitle>
          <DialogContent>
            <p>{userEmail}</p>
            <p>
              Just to make sure you really want to change your email, please
              click the button below and confirm. You will receive a
              verification email to complete this process.
            </p>
            <FormControl variant="outlined" fullWidth>
              <InputLabel htmlFor="outlined-adornment-password">
                Password
              </InputLabel>
              <OutlinedInput
                id="outlined-adornment-password"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                autoComplete="current-password"
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
                onChange={(e) => setPassword(e.target.value)}
              />
            </FormControl>
          </DialogContent>
          <DialogActions>
            <MuiButton variant="contained" onClick={handleUpdateEmail}>
              Confirm
            </MuiButton>
            <Button onClick={() => setEmailModalOpen(false)} autoFocus>
              Cancel
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          open={patchSuccess}
          autoHideDuration={3000}
          onClose={() => setPatchSuccess(false)}
        >
          <Alert severity="success" sx={{ width: '100%' }}>
            Username has been updated successfully!
          </Alert>
        </Snackbar>

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
      </div>
    </>
  )
}

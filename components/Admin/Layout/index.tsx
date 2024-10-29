import { useEffect, useCallback, useState } from 'react'
import Box from '@mui/material/Box'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material'
import Head from 'next/head'
import { useQuery } from 'react-query'
import axios, { AxiosError } from 'axios'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import AdminHeader from '../Header'
import SideBar from '../SideBar'
import { POKTPOOL_STRING } from '../../../src/constants'
import { signOut } from 'next-auth/react'
import useAccessToken from '../../../hooks/useAccessToken'
import useApi from '../../../hooks/useApi'

let timer: any = null

const AdminLayout = ({ children, title, isOnAdmin }: any) => {
  const accessToken = useAccessToken()
  const [countDown, setCountDown] = useState(0)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const { post: logout } = useApi('auth/signout')
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  // API health check to catch 502/503 server error
  const { data: apiHealthCheck } = useQuery('api/health-check', () => {
    ;(async () => {
      try {
        await axios.get('health')
      } catch (error) {
        console.error(error)
      }
    })()
  })

  const handleTimer = useCallback(() => {
    timer = window.setTimeout(() => {
      //Show the logout popup in 29 mins if on idle
      setShowLogoutDialog(true)
    }, 29 * 60 * 1000)
  }, [])

  const extendSessionTimer = () => {
    if (timer) {
      window.clearTimeout(timer)
    }
    handleTimer()
    setShowLogoutDialog(false)
  }

  useEffect(() => {
    if (accessToken) {
      const timeHandler = () => {
        if (timer) {
          window.clearTimeout(timer)
        }
        handleTimer()
      }

      timeHandler()

      document.addEventListener('click', timeHandler)

      return () => {
        if (timer) {
          window.clearTimeout(timer)
        }

        document.removeEventListener('click', timeHandler)
      }
    }
  }, [accessToken, handleTimer])

  useEffect(() => {
    let interval: any = null
    if (showLogoutDialog) {
      let timer_interval = 10
      setCountDown(timer_interval)
      interval = window.setInterval(() => {
        timer_interval--
        setCountDown(Math.max(timer_interval, 0))

        if (timer_interval < 0) {
          logout()
          axios
            .post(
              'auth/signout',
              {},
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  'Content-Type': 'application/json',
                },
              }
            )
            .then((res) => {
              signOut({ callbackUrl: `/` })
            })
            .catch((error) => {
              console.log(error)
            })
        }
      }, 1000)
    }

    return () => {
      if (interval) {
        window.clearInterval(interval)
      }
    }
  }, [showLogoutDialog, accessToken])

  return (
    <Box className="flex">
      <Head>
        {title && (
          <title>
            {POKTPOOL_STRING} - {title}
          </title>
        )}
      </Head>
      {!isMobile && (
        <Box className="bg-gradient-to-t from-brand-blue-dark to-brand-blue-light">
          <SideBar />
        </Box>
      )}
      <Box className="w-full min-h-screen" sx={{ backgroundColor: '#F4F5FA' }}>
        <AdminHeader isOnAdmin={isOnAdmin} />
        <Box className="p-7">{children}</Box>
      </Box>
      {showLogoutDialog && (
        <Dialog
          open={showLogoutDialog}
          disableEscapeKeyDown
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            <div className="flex justify-between">
              <p>Your session has been expired!</p>

              <p>{countDown}</p>
            </div>
          </DialogTitle>
          <DialogContent>
            <p>
              You are about to be logged out automatically because of inactivity
              on the page.
            </p>
            <p>Click OK to extend your session.</p>
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              size="large"
              onClick={extendSessionTimer}
            >
              Ok
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  )
}

export default AdminLayout

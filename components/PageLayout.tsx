import { useEffect, useState, useCallback } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import axios, { AxiosError } from 'axios'
import { useQuery } from 'react-query'
import { signOut, useSession } from 'next-auth/react'
import { PropsWithChildren } from 'react'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import MainMenu from './MainMenu'
import { POKTPOOL_STRING } from '../src/constants'
import poktpoolColorfulLogo from '../public/images/poktpool-logo-color.png'
import Head from 'next/head'
import { PromoBanner } from './PromoBanner'
import { MobilePromoBanner } from './PromoBanner/MobilePromoBanner'
import useAccessToken from '../hooks/useAccessToken'
import useApi from '../hooks/useApi'
import { Footer } from './Footer'

export type PageLayoutProps = PropsWithChildren<{
  isHome?: boolean
  /** Head tag title */
  title?: string
  isPressKit?: boolean
}>

let timer: any = null

export default function PageLayout({
  children,
  isHome = false,
  title,
  isPressKit,
}: PageLayoutProps) {
  const accessToken = useAccessToken()
  const [countDown, setCountDown] = useState(0)
  const { post: logout } = useApi('auth/signout')
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [showPromoBanner, setShowPromoBanner] = useState(true)
  const theme = useTheme()
  const matches = useMediaQuery(theme.breakpoints.down('sm'))
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

  // axios.interceptors.response.use(
  //   (response) => response,
  //   (error: AxiosError) => {
  //     if (error?.response?.status === 401) {
  //       setShowLogoutDialog(true)
  //     }

  //     return Promise.reject(error)
  //   }
  // )

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
    <div className="min-h-screen flex flex-col justify-between">
      <Head>
        {title && (
          <title>
            {POKTPOOL_STRING} - {title}
          </title>
        )}
      </Head>
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

      {matches ? (
        showPromoBanner && (
          <MobilePromoBanner closeBanner={() => setShowPromoBanner(false)} />
        )
      ) : (
        <PromoBanner />
      )}

      <nav
        className={`flex justify-between items-center border border-[#d3d3d3] border-solid border-r-0 border-l-0 border-t-0 pb-2 px-4 mt-${
          showPromoBanner && matches ? '32' : matches ? '2' : '16'
        }`}
      >
        <div className="w-52">
          <Link passHref href="/">
            <div className="flex pt-2">
              <Image
                className="cursor-pointer"
                src={poktpoolColorfulLogo}
                alt={`${POKTPOOL_STRING} Logo`}
              />
            </div>
          </Link>
        </div>
        <MainMenu />
      </nav>
      <AnimatePresence>
        {isPressKit && (
          <div className="press-kit-bg py-16">
            <h2 className="text-center text-white my-0">Press Kit</h2>
            <p className="sm:w-[500px] text-center text-white mx-auto my-0">
              Here are some resources to use for press and media when referring
              to Pocket Network.
            </p>
          </div>
        )}
        <motion.div
          className={
            isHome ? 'w-full pt-4' : 'container mx-auto py-16 pb-24 px-4'
          }
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
      <div>
        <Footer />
      </div>
    </div>
  )
}

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'
import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import axios, { AxiosError } from 'axios'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { AppProps } from 'next/app'
import Head from 'next/head'
import { Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'
import { theme } from '../src/theme'
import MaintenanceMode from '../components/MaintenanceMode'
import Script from 'next/script'
import { POKTPOOL_STRING } from '../src/constants'
import LayoutContextProvider from '../src/context/layout-context'
import CookieConsent, { getCookieConsentValue } from 'react-cookie-consent'
import { initGA } from '../src/utils/ga-utils'
import '../styles/globals.css'
import Link from 'next/link'
import { CookieConsentSetting } from '../components/CookieConsentSetting'
import AdminLayout from '../components/Admin/Layout'
import useAccessToken from '../hooks/useAccessToken'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'

const cache = createCache({ key: 'css', prepend: true })
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  },
})

library.add(fas, fab)

axios.defaults.baseURL = process.env.POKTPOOL_API_URL

export default function MyApp({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps<{
  session: Session
}>) {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const [showRecaptcha, setShowRecaptcha] = useState(false)

  useEffect(() => {
    setShowRecaptcha(
      router.pathname === '/login' || router.pathname === '/join'
    )
  }, [router.pathname])

  const isAdmin = useMemo(() => {
    return router.pathname.includes('admin')
  }, [router.pathname])

  axios.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (
        error?.response?.status === 502 ||
        error?.response?.status === 503 ||
        error?.message === 'Network Error'
      ) {
        setIsMaintenanceMode(true)
      }

      return Promise.reject(error)
    }
  )

  const handleAcceptCookie = () => {
    setIsOpen(false)
    if (process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS) {
      initGA(process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS)
    }
  }

  const handleDeclineCookie = () => {
    //remove google analytics cookies
    setIsOpen(true)
    // Cookies.remove('_ga')
    // Cookies.remove('_gat')
    // Cookies.remove('_gid')
  }

  useEffect(() => {
    const isConsent = getCookieConsentValue()
    if (isConsent === 'true') {
      handleAcceptCookie()
    }
  }, [])

  return isMaintenanceMode || process.env.MAINTENANCE_MODE === 'true' ? (
    <MaintenanceMode />
  ) : (
    <LayoutContextProvider>
      <QueryClientProvider client={queryClient}>
        <SessionProvider session={session}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Script
              strategy="lazyOnload"
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}`}
            />
            <Script id="tagging-script" strategy="lazyOnload">
              {`window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}', {
              page_path: window.location.pathname,
              });`}
            </Script>
            <Script id="zfEmbed" strategy="lazyOnload">
              {`window._zfQueue = window._zfQueue || []; function _zf(){_zfQueue.push(arguments); }(function() { ZonkaFeedback = function (en, fb ){document.body.addEventListener(en, fb , false); }; var sc, w, d = document, ce = d.createElement, gi = d.getElementById, gt = d.getElementsByTagName, id = "zfEmbedScript"; if (!gi.call(d, id)) { sc = ce.call(d, "script"); sc.async=!0;sc.id = id; sc.src = "https://us-js.zonka.co/642f3197e2d4f800085a9895";w = gt.call(d, "script")[0]; w.parentNode.insertBefore(sc, w); }})();`}
            </Script>
            <Script id="hotjar-script" strategy="lazyOnload">
              {`
                (function(h, o, t, j, a, r) {
                  h.hj = h.hj || function() {
                    (h.hj.q = h.hj.q || []).push(arguments)
                  };
                  h._hjSettings = {
                    hjid: ${process.env.NEXT_PUBLIC_HOTJAR_ANALYTICS},
                    hjsv: 6
                  };
                  a = o.getElementsByTagName('head')[0];
                  r = o.createElement('script');
                  r.async = 1;
                  r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv;
                  a.appendChild(r);
                })(window, document, 'https://static.hotjar.com/c/hotjar-', '.js?sv=');
              `}
            </Script>
            <Head>
              <title>{POKTPOOL_STRING}</title>
              <link rel="icon" href="/favicon.ico" />
              <link
                rel="icon"
                type="image/png"
                sizes="32x32"
                href="/favicon-32x32.png"
              />
              <link
                rel="icon"
                type="image/png"
                sizes="16x16"
                href="/favicon-16x16.png"
              />
            </Head>
            <CacheProvider value={cache}>
              <ThemeProvider theme={theme}>
                <CssBaseline />
                {showRecaptcha ? (
                  <GoogleReCaptchaProvider
                    reCaptchaKey="6Lc1NromAAAAALNfHj0eyKY1TP3JSvzRHMHw-kz1"
                    scriptProps={{
                      async: false,
                      defer: false,
                      appendTo: 'head',
                      nonce: undefined,
                    }}
                  >
                    <Component {...pageProps} />
                    <CookieConsent
                      containerClasses="cookieConsentStyles"
                      enableDeclineButton
                      buttonText="Accept"
                      buttonClasses="cookieAcceptBtn"
                      declineButtonText="Settings"
                      declineButtonClasses="cookieDeclineBtn"
                      onAccept={handleAcceptCookie}
                      onDecline={handleDeclineCookie}
                    >
                      This website uses cookies to enhance the user experience.
                      To learn more, please refer to our{' '}
                      <Link passHref href="/privacy-policy">
                        Privacy Policy
                      </Link>
                    </CookieConsent>
                    <CookieConsentSetting
                      isOpen={isOpen}
                      handleAcceptAll={handleAcceptCookie}
                    />
                  </GoogleReCaptchaProvider>
                ) : (
                  <>
                    {isAdmin ? (
                      <AdminLayout>
                        <Component {...pageProps} />
                      </AdminLayout>
                    ) : (
                      <Component {...pageProps} />
                    )}

                    <CookieConsent
                      containerClasses="cookieConsentStyles"
                      enableDeclineButton
                      buttonText="Accept"
                      buttonClasses="cookieAcceptBtn"
                      declineButtonText="Settings"
                      declineButtonClasses="cookieDeclineBtn"
                      onAccept={handleAcceptCookie}
                      onDecline={handleDeclineCookie}
                    >
                      This website uses cookies to enhance the user experience.
                      To learn more, please refer to our{' '}
                      <Link passHref href="/privacy-policy">
                        Privacy Policy
                      </Link>
                    </CookieConsent>
                    <CookieConsentSetting
                      isOpen={isOpen}
                      handleAcceptAll={handleAcceptCookie}
                    />
                  </>
                )}
              </ThemeProvider>
            </CacheProvider>
          </LocalizationProvider>
        </SessionProvider>
      </QueryClientProvider>
    </LayoutContextProvider>
  )
}

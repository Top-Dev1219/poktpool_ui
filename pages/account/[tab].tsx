import { Alert, Tab, Tabs } from '@mui/material'
import clsx from 'clsx'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { signIn, useSession } from 'next-auth/react'
import MyProfile from './_profile'
import Kyc from './_verification'
import TwoFactorAuth from './_twoFactor'
import MultipleWallets from './_wallets'
import Notifications from './_notifications'
import PageLayout from '../../components/PageLayout'
import useUser from '../../hooks/useUser'

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  }
}

export default function Manage() {
  const { status, data: session } = useSession()
  const { push, query } = useRouter()
  const { user, loading, refetchUser } = useUser()
  const { tab = 'stake' } = query

  if (status === 'unauthenticated') signIn()

  const ActiveTab = () => {
    const tabs: any = {
      // sweeps: <Sweeps />,
      profile: (
        <MyProfile user={user} refetchUser={refetchUser} loading={loading} />
      ),
      verification: <Kyc user={user} refetchUser={refetchUser} />,
      twoFactor: <TwoFactorAuth user={user} refetchUser={refetchUser} />,
      wallets: <MultipleWallets />,
      notifications: <Notifications />,
    }

    return tabs[tab as string]
  }

  return (
    <PageLayout title="Manage">
      {status === 'authenticated' && (
        <section className="max-w-5xl mx-auto">
          <Tabs
            value={tab}
            onChange={(event, value) => push(value)}
            aria-label="basic tabs example"
          >
            <Tab label="Profile" value="profile" {...a11yProps(0)} />
            <Tab
              label="ID Verification"
              value="verification"
              {...a11yProps(1)}
            />
            <Tab label="Two Factor Auth" value="twoFactor" {...a11yProps(2)} />
            <Tab label="Wallets" value="wallets" {...a11yProps(3)} />
            <Tab
              label="Notifications"
              value="notifications"
              {...a11yProps(4)}
            />
          </Tabs>
          <div className="mx-auto px-2 py-0">{ActiveTab()}</div>
        </section>
      )}
    </PageLayout>
  )
}

import { Alert, Tab, Tabs, Skeleton } from '@mui/material'
import clsx from 'clsx'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { signIn, useSession } from 'next-auth/react'
import Stake from './_stake'
import Sweeps from './_sweeps'
import Unstake from './_unstake'
import Transfer from './_transfer'
import Dashboard from './_dashboard'
import _monthlyStatement from './_monthly-statement'
import PageLayout from '../../components/PageLayout'
import useUser from '../../hooks/useUser'
import { MonthlyStatement } from '../../src/pages/members/MonthlyStatement'

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  }
}

export default function Manage() {
  const { status, data: session } = useSession()
  const { push, query } = useRouter()
  const { user, loading } = useUser()
  const { tab = 'stake' } = query

  if (status === 'unauthenticated') signIn()

  const ActiveTab = () => {
    const tabs: any = {
      sweeps: <Sweeps />,
      stake: <Stake />,
      unstake: <Unstake />,
      transfer: <Transfer />,
      dashboard: <Dashboard />,
      'monthly-statement': <MonthlyStatement />,
    }

    return tabs[tab as string]
  }

  return (
    <PageLayout title="Manage">
      <section>
        <Tabs
          value={tab}
          onChange={(event, value) => push(value)}
          aria-label="Manage Pages"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Dashboard" value="dashboard" {...a11yProps(0)} />
          <Tab label="Stake" value="stake" {...a11yProps(1)} />
          <Tab label="Sweep" value="sweeps" {...a11yProps(2)} />
          <Tab label="Unstake" value="unstake" {...a11yProps(3)} />
          <Tab label="Transfer" value="transfer" {...a11yProps(4)} />
          <Tab label="Statements" value="monthly-statement" {...a11yProps(5)} />
        </Tabs>
        <div className="container mx-auto py-8 px-4">
          {loading ? (
            <>
              <Skeleton variant="rounded" height={45} />
            </>
          ) : (
            <>
              {user.jumioDecision !== 'PASSED' && (
                <Alert severity="warning" className="mb-8">
                  Complete the ID Verification in{' '}
                  <Link href="/account" passHref>
                    <span className="underline cursor-pointer">My Account</span>
                  </Link>{' '}
                  to unlock staking, sweeping, unstaking and transferring.
                </Alert>
              )}
            </>
          )}
          <div
            className={clsx(
              user.jumioDecision !== 'PASSED' &&
                'opacity-50 pointer-events-none'
            )}
          >
            {ActiveTab()}
          </div>
        </div>
      </section>
    </PageLayout>
  )
}

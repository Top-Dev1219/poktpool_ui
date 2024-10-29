import { Tab, Tabs } from '@mui/material'
import { useRouter } from 'next/router'
import { styled } from '@mui/system'
import { signIn, useSession } from 'next-auth/react'
import PoktPosition from './_pokt-position'
import ClosedTranches from './_closed-tranches'
import MonthlyReport from './_monthly-report'
import PoolAdmin from './_pool-admin'
import useUser from '../../../hooks/useUser'

const tabData = [
  {
    label: 'POKT Position',
    value: 'pokt-position',
    permission: [11],
  },
  {
    label: 'Closed Tranches',
    value: 'closed-tranches',
    permission: [8],
  },
  {
    label: 'Monthly Report',
    value: 'monthly-report',
    permission: [9],
  },
  {
    label: 'Pool Administration',
    value: 'pool-admin',
    permission: [13],
  },
]

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
      'pokt-position': <PoktPosition />,
      'closed-tranches': <ClosedTranches />,
      'monthly-report': <MonthlyReport />,
      'pool-admin': <PoolAdmin />,
    }

    return tabs[tab as string]
  }

  const RootTabs = styled(Tabs)(({ theme }) => ({
    flexGrow: 1,
    width: '100%',
    backgroundColor: theme.palette.background.paper,
    overflowX: 'auto', // Enable horizontal scrolling on mobile devices
    scrollbarWidth: 'none', // Remove scrollbar on mobile devices
    '-ms-overflow-style': 'none', // Remove scrollbar on mobile devices (IE/Edge)
    '&::-webkit-scrollbar': {
      display: 'none', // Remove scrollbar on mobile devices (Chrome/Safari)
    },
  }))

  return (
    <>
      {status === 'authenticated' && (
        <section className="mx-auto ">
          <Tabs
            value={tab}
            onChange={(event, value) => push(value)}
            aria-label="basic tabs example"
            variant="scrollable"
            scrollButtons="auto"
            className="border border-[#d3d3d3] border-solid border-r-0 border-l-0 border-t-0 overflow-x-auto"
          >
            {tabData
              .filter((td) => user?.permissions?.includes(td.permission[0]))
              .map((tab, index) => (
                <Tab
                  key={index}
                  label={tab.label}
                  value={tab.value}
                  {...a11yProps(index)}
                />
              ))}
          </Tabs>
          <div className="mx-auto px-2 py-0">{ActiveTab()}</div>
        </section>
      )}
    </>
  )
}

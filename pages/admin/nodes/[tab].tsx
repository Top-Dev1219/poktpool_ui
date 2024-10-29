import { Tab, Tabs } from '@mui/material'
import { useRouter } from 'next/router'
import { signIn, useSession } from 'next-auth/react'
import NodeDashboard from './_node-dashboard'
import VendorSettings from './_vendor-settings'
import NodeAddress from './_node-address'
import useUser from '../../../hooks/useUser'

const tabData = [
  {
    label: 'Node Address',
    value: 'node-address',
    permission: [2],
  },
  {
    label: 'Node Dashboard',
    value: 'node-dashboard',
    permission: [6],
  },
  {
    label: 'Vendor Settings',
    value: 'vendor-settings',
    permission: [10],
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
      'node-address': <NodeAddress />,
      'node-dashboard': <NodeDashboard />,
      'vendor-settings': <VendorSettings />,
    }

    return tabs[tab as string]
  }

  return (
    <>
      {status === 'authenticated' && (
        <section className="mx-auto">
          <Tabs
            value={tab}
            onChange={(event, value) => push(value)}
            aria-label="Scrollable Node Tabs"
            variant="scrollable"
            scrollButtons="auto"
            className="border border-[#d3d3d3] border-solid border-r-0 border-l-0 border-t-0"
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

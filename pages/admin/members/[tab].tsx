import { Tab, Tabs } from '@mui/material'
import { useRouter } from 'next/router'
import { signIn, useSession } from 'next-auth/react'
import MemberLookUp from './_member-lookup'
import UpcomingUnstakes from './_member-unstakes'
import UpcomingStakes from './_member-stakes'
import BonusAdmin from './_bonus-admin'
import useUser from '../../../hooks/useUser'

const tabData = [
  {
    label: 'Member Lookup',
    value: 'member-lookup',
    permission: [3],
  },
  {
    label: 'Upcoming Stakes',
    value: 'member-stakes',
    permission: [5],
  },
  {
    label: 'Upcoming Unstakes',
    value: 'member-unstakes',
    permission: [4],
  },
  {
    label: 'Bonus Admin',
    value: 'bonus-admin',
    permission: [14],
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
      'member-lookup': <MemberLookUp />,
      'member-stakes': <UpcomingStakes />,
      'member-unstakes': <UpcomingUnstakes />,
      'bonus-admin': <BonusAdmin />,
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
            aria-label="Member Page Tabs"
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

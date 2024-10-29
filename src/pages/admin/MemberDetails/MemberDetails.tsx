import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { signIn, useSession } from 'next-auth/react'
import { useQuery } from 'react-query'
import {
  Typography,
  Box,
  FormControl,
  Select,
  MenuItem,
  Tabs,
  Tab,
} from '@mui/material'
import axios from 'axios'
import useAccessToken from '../../../../hooks/useAccessToken'
import {
  StakesTable,
  SweepsTable,
  UnstakesTable,
  TransfersTable,
  WalletsTable,
} from './components'
import { KYCTable } from './components/KYCTable'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  }
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  )
}

export const MemberDetails = () => {
  const { status, data: sessionData } = useSession()
  const accessToken = useAccessToken()
  const router = useRouter()
  const [searchWallet, setSearchWallet] = useState('')
  const [tabValue, setTabValue] = useState(0)

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }
  const userEmail = router.query.email as string

  const { data: memberDetailData, refetch: refetchMemberDetails } = useQuery(
    'admin-member/details',
    () =>
      axios
        .get(`admin-member/details?email=${userEmail}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((res) => res.data),
    {
      enabled: !!accessToken,
    }
  )

  useEffect(() => {
    const session: any = sessionData

    if (session?.permissions && !session?.permissions?.includes(3)) {
      router.push('manage/dashboard')
    }
  }, [sessionData, router])

  if (status === 'unauthenticated') signIn()

  return (
    <>
      <div className="mb-8">
        <Typography className="text-xl">Member Details Lookup</Typography>
      </div>

      <div className="md:flex gap-12 items-center">
        <div>
          <h3 className="font-normal">
            Username:
            <span className="font-bold ml-4">
              {memberDetailData?.username ? memberDetailData?.username : 'N/A'}
            </span>{' '}
          </h3>
        </div>
        <div>
          <h3 className="font-normal">
            Email:
            <span className="font-bold ml-4">
              {memberDetailData?.email ? memberDetailData?.email : 'N/A'}
            </span>{' '}
          </h3>
        </div>
        <div>
          <h3 className="font-normal">
            Discord:
            <span className="font-bold ml-4">
              {memberDetailData?.discord_handle
                ? memberDetailData?.discord_handle
                : 'N/A'}
            </span>{' '}
          </h3>
        </div>
        <div className="w-56 mr-8">
          <FormControl fullWidth size="small">
            <Select
              className="bg-white"
              labelId="demo-select-small"
              id="customerWallet"
              value={searchWallet}
              renderValue={() => {
                if (!searchWallet) {
                  return <span>Select a wallet</span>
                }
                return (
                  memberDetailData?.wallets &&
                  memberDetailData?.wallets.length &&
                  memberDetailData?.wallets.find(
                    (so: any) => so.id === searchWallet
                  )?.primaryWalletId
                )
              }}
              displayEmpty
              disabled={tabValue === 4}
              onChange={(e) => setSearchWallet(e.target.value)}
            >
              {memberDetailData?.wallets &&
                memberDetailData?.wallets.length &&
                memberDetailData.wallets.map((wallet: any, index: number) => (
                  <MenuItem key={index} value={wallet.id}>
                    {wallet.primaryWalletId}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </div>
      </div>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="Member Detail Tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Stakes" {...a11yProps(0)} />
          <Tab label="Sweeps" {...a11yProps(1)} />
          <Tab label="Unstakes" {...a11yProps(2)} />
          <Tab label="Transfers" {...a11yProps(3)} />
          <Tab label="Wallets" {...a11yProps(4)} />
          <Tab label="KYC" {...a11yProps(5)} />
        </Tabs>
      </Box>

      <div>
        <TabPanel value={tabValue} index={0}>
          <StakesTable searchWallet={searchWallet} />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <SweepsTable searchWallet={searchWallet} />
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <UnstakesTable searchWallet={searchWallet} />
        </TabPanel>
        <TabPanel value={tabValue} index={3}>
          <TransfersTable searchWallet={searchWallet} />
        </TabPanel>
        <TabPanel value={tabValue} index={4}>
          <WalletsTable email={userEmail} />
        </TabPanel>
        <TabPanel value={tabValue} index={5}>
          <KYCTable memberDetailData={memberDetailData} refetchMemberDetails={refetchMemberDetails} />
        </TabPanel>
      </div>
    </>
  )
}

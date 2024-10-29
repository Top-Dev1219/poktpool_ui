import * as React from 'react'
import { useRouter } from 'next/router'
import { styled, useTheme, Theme, CSSObject } from '@mui/material/styles'
import Box from '@mui/material/Box'
import MuiDrawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import IconButton from '@mui/material/IconButton'
import MenuIcon from '@mui/icons-material/Menu'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import PeopleAltIcon from '@mui/icons-material/PeopleAlt'
import DonutSmall from '@mui/icons-material/DonutSmall'
import Tooltip from '@mui/material/Tooltip'
import useUser from '../../../hooks/useUser'
import StorefrontIcon from '@mui/icons-material/Storefront'
import AssessmentIcon from '@mui/icons-material/Assessment'
import CompareIcon from '@mui/icons-material/Compare'
import HubIcon from '@mui/icons-material/Hub'
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts'
import { LayoutContext } from '../../../src/context/layout-context'

const drawerWidth = 240

const MenuItems = [
  {
    icon: <AssessmentIcon />,
    text: 'Pool Details',
    path: '/admin/pool-details',
    permission: [9, 8, 11, 13],
  },
  {
    icon: <PeopleAltIcon />,
    text: 'Members',
    path: '/admin/members',
    permission: [3, 4, 5, 14],
  },
  {
    icon: <HubIcon />,
    text: 'Nodes',
    path: '/admin/nodes',
    permission: [2, 6, 10],
  },
  {
    icon: <AccountBalanceWalletIcon />,
    text: 'Wallets',
    path: '/admin/wallets',
    permission: [7],
  },
  {
    icon: <DonutSmall />,
    text: 'Tranche Processing',
    path: '/admin/tranche',
    permission: [1],
  },
  {
    icon: <CompareIcon />,
    text: 'Market Performance',
    path: '/admin/market-performance',
    permission: [15],
  },
  {
    icon: <ManageAccountsIcon />,
    text: 'Role Admin',
    path: '/admin/role-admin',
    permission: [16],
  },
  // {
  //   icon: <StorefrontIcon />,
  //   text: 'Sell POKT',
  //   path: '/admin/sell-pokt',
  //   permission: [12],
  // },
]

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
})

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
})

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}))

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  ...(open && {
    ...openedMixin(theme),
    '& .MuiDrawer-paper': openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    '& .MuiDrawer-paper': closedMixin(theme),
  }),
}))

export default function SideBar() {
  const theme = useTheme()
  const { open, setOpen } = React.useContext(LayoutContext)
  const { user } = useUser()

  const router = useRouter()

  const handleDrawerOpen = () => {
    setOpen(true)
  }

  const handleDrawerClose = () => {
    setOpen(false)
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer
        PaperProps={{
          sx: {
            backgroundImage: 'linear-gradient(to bottom, #0366FF, #09D7FE)',
            color: 'white',
            border: 'none',
            boxShadow: '2px 1px 3px 0px #cdcdcd',
          },
        }}
        variant="permanent"
        open={open}
      >
        <DrawerHeader>
          {open ? (
            <IconButton onClick={handleDrawerClose} className="text-white">
              {theme.direction === 'rtl' ? (
                <ChevronRightIcon />
              ) : (
                <ChevronLeftIcon />
              )}
            </IconButton>
          ) : (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              edge="start"
              className="mr-1"
              sx={{
                marginRight: 5,
              }}
            >
              <MenuIcon />
            </IconButton>
          )}
        </DrawerHeader>
        <List>
          {MenuItems.filter(
            (item) =>
              item.permission.find((permission) =>
                user?.permissions?.includes(permission)
              ) !== undefined
          ).map((item) => (
            <ListItem
              key={item.path}
              disablePadding
              sx={{ display: 'block' }}
              onClick={() => router.push(item.path)}
            >
              <Tooltip title={item.text} placement="right" arrow>
                <ListItemButton
                  className={
                    router.pathname === item.path
                      ? 'bg-white hover:bg-white'
                      : ''
                  }
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? 'initial' : 'center',
                    px: 2.5,
                  }}
                >
                  <ListItemIcon
                    className={
                      router.pathname === item.path
                        ? 'text-brand-blue-dark'
                        : ''
                    }
                    sx={{
                      minWidth: 0,
                      mr: open ? 3 : 'auto',
                      justifyContent: 'center',
                      color: 'white',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    className={
                      router.pathname === item.path
                        ? 'text-brand-blue-dark'
                        : ''
                    }
                    primary={item.text}
                    sx={{ opacity: open ? 1 : 0, color: 'white' }}
                  />
                </ListItemButton>
              </Tooltip>
            </ListItem>
          ))}
        </List>
      </Drawer>
    </Box>
  )
}

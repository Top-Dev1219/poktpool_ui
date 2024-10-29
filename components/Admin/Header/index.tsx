import React from 'react'
import { styled } from '@mui/material/styles'
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Image from 'next/image'
import Link from 'next/link'
import { POKTPOOL_STRING } from '../../../src/constants'
import poktpoolColorLogo from '../../../public/images/poktpool-logo-color.png'
import UserTooltipMenu from '../../UserTooltipMenu'
import { MobileSidebar } from '../SideBar/MobileSidebar'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

const drawerWidth = 240

interface AppBarProps extends MuiAppBarProps {
  open?: boolean
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}))

const AdminHeader = ({ isOnAdmin = true }: { isOnAdmin: boolean }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <AppBar className="relative bg-white shadow-md">
      <Toolbar className="flex justify-between items-center">
        <div>{isMobile && <MobileSidebar />}</div>
        <div className="flex items-center w-52">
          <Link passHref href="/">
            <div className="flex gap-0.5">
              <Image
                className="cursor-pointer"
                src={poktpoolColorLogo}
                alt={`${POKTPOOL_STRING} Logo`}
              />
            </div>
          </Link>
        </div>
        <UserTooltipMenu isOnAdmin={isOnAdmin} />
      </Toolbar>
    </AppBar>
  )
}

export default AdminHeader

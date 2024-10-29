import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { Logout } from '@mui/icons-material'
import {
  Avatar,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  Box,
} from '@mui/material'
import useApi from '../hooks/useApi'
import useUser from '../hooks/useUser'
import MyAccountIcon from '../public/images/menu-icons/menu-my-account.svg'
import AdminPortalIcon from '../public/images/menu-icons/menu-admin-portal.svg'
import LogOutIcon from '../public/images/menu-icons/menu-logout.svg'
import MyProfileIcon from '../public/images/menu-icons/menu-my-profile.svg'
import IDVerificationIcon from '../public/images/menu-icons/menu-id-verification.svg'
import FactorAuthIcon from '../public/images/menu-icons/menu-two-facctor.svg'
import WalletsIcon from '../public/images/menu-icons/menu-wallets.svg'

const roles = [
  {
    id: 1,
    url: 'admin/tranche',
    permissions: [1],
  },
  {
    id: 2,
    url: 'admin/nodes/node-address',
    permissions: [2],
  },
  {
    id: 3,
    url: 'admin/members/member-lookup',
    permissions: [3],
  },
  {
    id: 4,
    url: 'admin/members/member-unstakes',
    permissions: [4],
  },
  {
    id: 5,
    url: 'admin/members/member-stakes',
    permissions: [5],
  },
  {
    id: 6,
    url: 'admin/nodes/node-dashboard',
    permissions: [6],
  },
  {
    id: 7,
    url: 'admin/wallets',
    permissions: [7],
  },
  {
    id: 8,
    url: 'admin/pool-details/closed-tranches',
    permissions: [8],
  },
  {
    id: 9,
    url: 'admin/pool-details/monthly-report',
    permissions: [9],
  },
  {
    id: 10,
    url: 'admin/nodes/vendor-settings',
    permissions: [10],
  },
  {
    id: 11,
    url: 'admin/pool-details/pokt-position',
    permissions: [11],
  },
  // {
  //   id: 12,
  //   url: 'admin/sell-pokt',
  //   permissions: [12],
  // },
  {
    id: 13,
    url: 'admin/pool-details/pool-admin',
    permissions: [13],
  },
  {
    id: 14,
    url: 'admin/members/bonus-admin',
    permissions: [14],
  },
  {
    id: 15,
    url: 'admin/market-performance',
    permissions: [15],
  },
  {
    id: 16,
    url: 'admin/members/role-admin',
    permissions: [16],
  },
]

export default function UserTooltipMenu({
  isOnAdmin,
}: {
  isOnAdmin?: boolean
}) {
  const router = useRouter()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [moreMenuAnchorEl, setMoreMenuAnchorEl] =
    useState<null | HTMLElement>(null)
  const { post: logout } = useApi('auth/signout')
  const { data: session } = useSession()
  const { user } = useUser()

  const open = Boolean(anchorEl)
  const isMoreMenu = Boolean(moreMenuAnchorEl)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleAction = (href: string) => {
    setAnchorEl(null)
    setMoreMenuAnchorEl(null)
    if (href) {
      router.push(href)
    }
  }

  const handleMoreMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMoreMenuAnchorEl(event.currentTarget)
  }

  const handleMoreMenuClose = () => {
    setMoreMenuAnchorEl(null)
  }

  const handleLogout = () => {
    logout()
    localStorage.removeItem('customerId')
    signOut({
      callbackUrl: `/`,
    })
  }

  return (
    <>
      <Tooltip title="User Menu">
        <IconButton
          onClick={handleClick}
          size="small"
          aria-controls={open ? 'account-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
        >
          {user?.userIconUrl ? (
            <div className="w-8 h-8 rounded-full overflow-hidden">
              <Image
                src={user?.userIconUrl}
                width="100%"
                height="100%"
                layout="fill"
                alt="User Avatar"
                className="rounded-full"
              />
            </div>
          ) : (
            <Avatar
              sx={{ width: 32, height: 32 }}
              src={session?.user?.image!}
            ></Avatar>
          )}
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <List component="nav" className="min-w-[200px]">
          <ListItem button onClick={(e) => handleMoreMenuOpen(e)}>
            <ListItemIcon className="min-w-[45px]">
              <Image
                src={MyAccountIcon}
                width={34}
                height={34}
                alt="MyAccount Icon"
              />
            </ListItemIcon>
            <ListItemText>
              <Box position="relative" className="text-sm">
                My Account
              </Box>
            </ListItemText>
          </ListItem>
          <Divider className="mx-5" />
          {user.permissions && user.permissions.length ? (
            isOnAdmin ? (
              <>
                <ListItem
                  button
                  onClick={() => handleAction('/manage/dashboard')}
                >
                  <ListItemIcon className="min-w-[45px]">
                    <Image
                      src={AdminPortalIcon}
                      width={34}
                      height={34}
                      alt="MyAccount Icon"
                    />
                  </ListItemIcon>
                  <ListItemText>
                    <Box position="relative" className="text-sm">
                      User Dashboard
                    </Box>
                  </ListItemText>
                </ListItem>
                <Divider className="mx-5" />
              </>
            ) : (
              <>
                <ListItem
                  button
                  onClick={() =>
                    handleAction(
                      '/' +
                        (roles.find((item) =>
                          user.permissions?.includes(item.permissions?.[0] ?? 0)
                        )?.url ?? '')
                    )
                  }
                >
                  <ListItemIcon className="min-w-[45px]">
                    <Image
                      src={AdminPortalIcon}
                      width={34}
                      height={34}
                      alt="AdminPortal Icon"
                    />
                  </ListItemIcon>
                  <ListItemText>
                    <Box position="relative" className="text-sm">
                      Admin Portal
                    </Box>
                  </ListItemText>
                </ListItem>
                <Divider className="mx-5" />
              </>
            )
          ) : (
            ''
          )}
          <ListItem button onClick={() => handleLogout()}>
            <ListItemIcon className="min-w-[45px]">
              <Image
                src={LogOutIcon}
                width={34}
                height={34}
                alt="LogOut Icon"
              />
            </ListItemIcon>
            <ListItemText>
              <Box position="relative" className="text-sm">
                Log Out
              </Box>
            </ListItemText>
          </ListItem>
        </List>
      </Menu>

      <Menu
        anchorEl={moreMenuAnchorEl}
        id={`header-my-account-toggle-nav`}
        open={isMoreMenu || false}
        onClose={handleMoreMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 20,
              right: 0,
              marginRight: -0.7,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <List component="nav" className="min-w-[200px]">
          <ListItem button onClick={() => handleAction('/account/profile')}>
            <ListItemIcon className="min-w-[45px]">
              <Image
                src={MyProfileIcon}
                width={34}
                height={34}
                alt="MyProfile Icon"
              />
            </ListItemIcon>
            <ListItemText>
              <Box position="relative" className="text-sm">
                My Profile
              </Box>
            </ListItemText>
          </ListItem>
          <Divider className="mx-5" />
          <ListItem
            button
            onClick={() => handleAction('/account/verification')}
          >
            <ListItemIcon className="min-w-[45px]">
              <Image
                src={IDVerificationIcon}
                width={34}
                height={34}
                alt="IDVerification Icon"
              />
            </ListItemIcon>
            <ListItemText>
              <Box position="relative" className="text-sm">
                ID Verification
              </Box>
            </ListItemText>
          </ListItem>
          <Divider className="mx-5" />
          <ListItem button onClick={() => handleAction('/account/twoFactor')}>
            <ListItemIcon className="min-w-[45px]">
              <Image
                src={FactorAuthIcon}
                width={34}
                height={34}
                alt="2FactorAuth Icon"
              />
            </ListItemIcon>
            <ListItemText>
              <Box position="relative" className="text-sm">
                2-Factor Auth
              </Box>
            </ListItemText>
          </ListItem>
          <Divider className="mx-5" />
          <ListItem button onClick={() => handleAction('/account/wallets')}>
            <ListItemIcon className="min-w-[45px]">
              <Image
                src={WalletsIcon}
                width={34}
                height={34}
                alt="Wallets Icon"
              />
            </ListItemIcon>
            <ListItemText>
              <Box position="relative" className="text-sm">
                Wallets
              </Box>
            </ListItemText>
          </ListItem>
          <Divider className="mx-5" />
          <ListItem
            button
            onClick={() => handleAction('/account/notifications')}
          >
            <ListItemIcon className="min-w-[45px] pl-1">
              <Image
                src={'/images/menu-icons/notification-settings.png'}
                width={26}
                height={26}
                alt="Wallets Icon"
              />
            </ListItemIcon>
            <ListItemText>
              <Box position="relative" className="text-sm">
                Notifications
              </Box>
            </ListItemText>
          </ListItem>
        </List>
      </Menu>
    </>
  )
}

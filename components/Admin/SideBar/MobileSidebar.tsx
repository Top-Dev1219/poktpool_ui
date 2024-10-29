import * as React from 'react'
import {
  Drawer,
  Button,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Link from 'next/link'

const drawerWidth = 300

interface SubItem {
  label: string
  route: string
}

interface MenuItem {
  label: string
  subItems?: SubItem[]
  route?: string
}

const authenticatedMenus: MenuItem[] = [
  {
    label: 'Pool Details',
    subItems: [
      {
        label: 'POKT Position',
        route: '/admin/pool-details/pokt-position',
      },
      {
        label: 'Closed Tranches',
        route: '/admin/pool-details/closed-tranches',
      },
      {
        label: 'Monthly Report',
        route: '/admin/pool-details/monthly-report',
      },
      {
        label: 'Pool Administration',
        route: '/admin/pool-details/pool-admin',
      },
    ],
  },
  {
    label: 'Members',
    subItems: [
      {
        label: 'Member Lookup',
        route: '/admin/members/member-lookup',
      },
      {
        label: 'Upcoming Stakes',
        route: '/admin/members/member-stakes',
      },
      {
        label: 'Upcoming Unstakes',
        route: '/admin/members/member-unstakes',
      },
      {
        label: 'Bonus Admin',
        route: '/admin/members/bonus-admin',
      },
    ],
  },
  {
    label: 'Nodes',
    subItems: [
      {
        label: 'Node Address',
        route: '/admin/nodes/node-address',
      },
      {
        label: 'Node Dashboard',
        route: '/admin/nodes/node-dashboard',
      },
      {
        label: 'Vendor Settings',
        route: '/admin/nodes/vendor-settings',
      },
    ],
  },
  {
    label: 'Wallets',
    route: '/admin/wallets',
  },
  {
    label: 'Tranche Processing',
    route: '/admin/tranche',
  },
  {
    label: 'Market Performance',
    route: '/admin/market-performance',
  },
]

export const MobileSidebar = () => {
  const [open, setOpen] = React.useState(false)
  const [expandedIndex, setExpandedIndex] = React.useState<number>(-1)

  const handleAccordionChange =
    (index: number) => (event: React.ChangeEvent<{}>, isExpanded: boolean) => {
      setExpandedIndex(isExpanded ? index : -1)
    }

  const handleDrawerToggle = () => {
    setOpen(!open)
  }

  const list = () => (
    <>
      <div className="container mx-auto h-full px-8 pt-8 divide-y-0 bg-gradient-to-t from-brand-blue-dark to-brand-blue-light">
        {authenticatedMenus.map((item: MenuItem, index: number) => (
          <div className="border-none" key={index}>
            {item?.subItems && item?.subItems?.length > 0 ? (
              <Accordion
                expanded={expandedIndex === index}
                onChange={handleAccordionChange(index)}
                className="bg-transparent shadow-none text-lg"
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon className="text-white" />}
                >
                  <Typography className="text-white text-lg my-0">
                    {item.label}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails className="pl-8 py-0">
                  {item?.subItems?.map((subItem: SubItem, subIndex: number) => (
                    <div key={subIndex} className="py-3">
                      <Link passHref href={subItem.route}>
                        <a
                          className="text-white text-lg"
                          onClick={handleDrawerToggle}
                        >
                          {subItem.label}
                        </a>
                      </Link>
                    </div>
                  ))}
                </AccordionDetails>
              </Accordion>
            ) : (
              <div className="px-4 my-6">
                <Link passHref href={item.route ?? '#'} className="w-full">
                  <a className="text-white text-lg">{item.label}</a>
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  )

  return (
    <Box>
      <MenuIcon
        className="cursor-pointer text-black"
        onClick={handleDrawerToggle}
      />
      <Drawer
        open={open}
        onClose={handleDrawerToggle}
        PaperProps={{
          sx: {
            width: drawerWidth,
          },
        }}
        className="custom-drawer-z-index "
      >
        {list()}
      </Drawer>
    </Box>
  )
}

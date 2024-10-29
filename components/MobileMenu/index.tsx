import { useState } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

interface SubItem {
  label: string
  route: string
}

interface MenuItem {
  label: string
  subItems?: SubItem[]
  route?: string
  isLoggedIn?: boolean
}

const unauthenticatedMenus: MenuItem[] = [
  {
    label: 'Company',
    subItems: [
      {
        label: 'About',
        route: '/about',
      },
      {
        label: 'Careers',
        route: '/careers',
      },
      {
        label: 'Blog',
        route: '/blogs',
      },
      {
        label: 'Press Kit',
        route: '/press-kit',
      },
    ],
  },
  {
    label: 'Pool Analytics',
    route: '/analysis',
  },
  {
    label: 'Support',
    subItems: [
      {
        label: 'FAQs',
        route: '/faq',
      },
      {
        label: 'Contact Us',
        route: '/contact-us',
      },
    ],
  },
  {
    label: 'Login',
    route: '/login',
  },
  {
    label: 'Create Account',
    subItems: [
      {
        label: 'Existing Member',
        route: '/join?existing_user=existing_user',
      },
      {
        label: 'New Member',
        route: '/join',
      },
    ],
  },
]

const authenticatedMenus: MenuItem[] = [
  {
    label: 'Company',
    subItems: [
      {
        label: 'About',
        route: '/about',
      },
      {
        label: 'Careers',
        route: '/careers',
      },
      {
        label: 'Blog',
        route: '/blogs',
      },
      {
        label: 'Press Kit',
        route: '/press-kit',
      },
    ],
  },
  {
    label: 'Pool Analytics',
    route: '/analysis',
  },
  {
    label: 'Portfolio',
    route: '/my-portfolio',
  },
  {
    label: 'Support',
    subItems: [
      {
        label: 'FAQs',
        route: '/faq',
      },
      {
        label: 'Contact Us',
        route: '/contact-us',
      },
    ],
  },
  {
    label: 'Log Out',
    isLoggedIn: true,
  },
]

export const MobileMenu = ({ onClose }: { onClose: () => void }) => {
  const { data: session } = useSession()
  const isAccessToken = Boolean(session?.accessToken)

  const [expandedIndex, setExpandedIndex] = useState<number>(-1)

  const handleAccordionChange =
    (index: number) => (event: React.ChangeEvent<{}>, isExpanded: boolean) => {
      setExpandedIndex(isExpanded ? index : -1)
    }

  const handleLogout = () => {
    localStorage.removeItem('customerId')
    signOut({
      callbackUrl: `/`,
    })
  }

  return (
    <div className="container mx-auto px-8 divide-y-0">
      {(isAccessToken ? authenticatedMenus : unauthenticatedMenus).map(
        (item: MenuItem, index: number) => (
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
                  <Typography className="text-white text-lg">
                    {item.label}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails className="pl-8">
                  {item?.subItems?.map((subItem: SubItem, subIndex: number) => (
                    <div key={subIndex} className="py-2">
                      <Link passHref href={subItem.route}>
                        <a className="text-white text-lg" onClick={onClose}>
                          {subItem.label}
                        </a>
                      </Link>
                    </div>
                  ))}
                </AccordionDetails>
              </Accordion>
            ) : (
              <>
                {item.isLoggedIn ? (
                  <>
                    <p
                      className="text-white text-lg pl-4"
                      onClick={handleLogout}
                    >
                      {item.label}
                    </p>
                  </>
                ) : (
                  <div className="px-4 my-6">
                    <Link passHref href={item.route ?? '#'} className="w-full">
                      <a className="text-white text-lg">{item.label}</a>
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        )
      )}
    </div>
  )
}

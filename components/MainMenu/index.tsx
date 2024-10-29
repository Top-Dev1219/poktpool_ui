import React, { useState } from 'react'
import MenuIcon from '@mui/icons-material/Menu'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import { AnimatePresence, motion } from 'framer-motion'
import useWindowSize from '../../hooks/useWindowSize'
import UserTooltipMenu from '../UserTooltipMenu'
import UserNotificationMenu from '../UserNotificationMenu'
import Image from 'next/image'
import PopoverMenu, { MenuItemModel } from '../PopoverMenu'
import AboutIcon from '../../public/images/menu-icons/menu-about.svg'
import CareersIcon from '../../public/images/menu-icons/emnu-careers.svg'
import BlogsIcon from '../../public/images/menu-icons/menu-blogs.svg'
import SubmitAnIdeaIcon from '../../public/images/menu-icons/menu-submit-idea.svg'
import LoginIcon from '../../public/images/menu-icons/menu-login.svg'
import CreateAccountIcon from '../../public/images/menu-icons/menu-my-account.svg'
import NewMemberIcon from '../../public/images/menu-icons/menu-new-member.svg'
import ContactUsIcon from '../../public/images/menu-icons/menu-contact-us.svg'
import FAQsIcon from '../../public/images/menu-icons/menu-faqs.svg'
import StakeIcon from '../../public/images/menu-icons/menu-stake.svg'
import SweepIcon from '../../public/images/menu-icons/menu-sweep.svg'
import UnstakeIcon from '../../public/images/menu-icons/menu-unstake.svg'
import TransferIcon from '../../public/images/menu-icons/menu-transfer.svg'
import PressKitIcon from '../../public/images/menu-icons/press-kit.svg'
import { MobileMenu } from '../MobileMenu'

type MenuLink = {
  href?: string
  onClick?: () => void
  label: string
}

const unauthenticatedMenus = [
  {
    title: 'Company',
    isOpened: false,
    anchorEl: null,
    children: [
      {
        title: 'About',
        icon: <Image src={AboutIcon} width={34} height={34} alt="About Icon" />,
        href: '/about',
      },
      {
        title: 'Careers',
        icon: (
          <Image src={CareersIcon} width={34} height={34} alt="Careers Icon" />
        ),
        href: '/careers',
      },
      {
        title: 'Blog',
        icon: <Image src={BlogsIcon} width={34} height={34} alt="Blogs Icon" />,
        href: '/blogs',
      },
      {
        title: 'Press Kit',
        icon: (
          <Image src={PressKitIcon} width={34} height={34} alt="Blogs Icon" />
        ),
        href: '/press-kit',
      },
    ],
  },
  {
    title: 'Pool Analytics',
    isOpened: false,
    anchorEl: null,
    href: '/analysis',
  },
  {
    title: 'Support',
    isOpened: false,
    anchorEl: null,
    children: [
      {
        title: 'FAQs',
        icon: <Image src={FAQsIcon} width={34} height={34} alt="FAQs Icon" />,
        href: '/faq',
      },
      {
        title: 'Contact Us',
        icon: (
          <Image
            src={ContactUsIcon}
            width={34}
            height={34}
            alt="ContactUs Icon"
          />
        ),
        href: '/contact-us',
      },
    ],
  },
  {
    title: 'Sign In',
    isOpened: false,
    anchorEl: null,
    children: [
      {
        title: 'Login',
        icon: <Image src={LoginIcon} width={34} height={34} alt="Login Icon" />,
        href: '/login',
      },
      {
        title: 'Create Account',
        icon: (
          <Image
            src={CreateAccountIcon}
            width={34}
            height={34}
            alt="CreateAccount Icon"
          />
        ),
        children: [
          {
            title: 'Existing Member',
            icon: (
              <Image src={NewMemberIcon} width={34} height={34} alt="Secure" />
            ),
            href: '/join?existing_user=existing_user',
          },
          {
            title: 'New Member',
            icon: (
              <Image src={NewMemberIcon} width={34} height={34} alt="Secure" />
            ),
            href: '/join',
          },
        ],
      },
    ],
  },
] as MenuItemModel[]

const authenticatedMenus = [
  {
    title: 'Company',
    isOpened: false,
    anchorEl: null,
    children: [
      {
        title: 'About',
        icon: <Image src={AboutIcon} width={34} height={34} alt="About Icon" />,
        href: '/about',
      },
      {
        title: 'Careers',
        icon: (
          <Image src={CareersIcon} width={34} height={34} alt="Careers Icon" />
        ),
        href: '/careers',
      },
      {
        title: 'Blog',
        icon: <Image src={BlogsIcon} width={34} height={34} alt="Blogs Icon" />,
        href: '/blogs',
      },
      {
        title: 'Press Kit',
        icon: (
          <Image src={PressKitIcon} width={34} height={34} alt="Blogs Icon" />
        ),
        href: '/press-kit',
      },
    ],
  },
  {
    title: 'Pool Analytics',
    isOpened: false,
    anchorEl: null,
    href: '/analysis',
  },
  {
    title: 'Portfolio',
    isOpened: false,
    anchorEl: null,
    href: '/my-portfolio',
  },
  {
    title: 'Support',
    isOpened: false,
    anchorEl: null,
    children: [
      {
        title: 'FAQs',
        icon: <Image src={FAQsIcon} width={34} height={34} alt="FAQs Icon" />,
        href: '/faq',
      },
      {
        title: 'Contact Us',
        icon: (
          <Image
            src={ContactUsIcon}
            width={34}
            height={34}
            alt="ContactUs Icon"
          />
        ),
        href: '/contact-us',
      },
    ],
  },
] as MenuItemModel[]

export default function MainMenu() {
  const [isShowingMenu, setIsShowingMenu] = useState(false)
  const { data: session } = useSession()
  const { width } = useWindowSize()

  const isAccessToken = Boolean(session?.accessToken)

  return width && width > 768 ? (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}>
        {!isAccessToken ? (
          <>
            {/* <Link passHref href="/buy-pokt">
              <a className="text-white bg-brand-blue-dark rounded font-semibold px-4 py-2 mr-4">
                Buy POKT
              </a>
            </Link> */}
            <PopoverMenu menuItems={unauthenticatedMenus} />
          </>
        ) : (
          <>
            {/* <Link passHref href="/buy-pokt">
              <a className="text-white bg-brand-blue-dark rounded font-semibold px-4 py-2 mr-4">
                Buy POKT
              </a>
            </Link> */}
            <PopoverMenu menuItems={authenticatedMenus} />
          </>
        )}
        {isAccessToken && (
          <>
            <UserNotificationMenu />
            <UserTooltipMenu />
          </>
        )}
      </Box>
    </>
  ) : (
    <>
      {isAccessToken && (
        <>
          <UserNotificationMenu />
          <UserTooltipMenu />
        </>
      )}

      <IconButton
        onClick={() => setIsShowingMenu(!isShowingMenu)}
        className="relative z-20"
      >
        {isShowingMenu ? (
          <CloseIcon className="cursor-pointer" />
        ) : (
          <MenuIcon className="cursor-pointer" />
        )}
      </IconButton>

      <AnimatePresence>
        {isShowingMenu && (
          <motion.ul className="fixed z-10 pl-0 my-0 inset-0 flex flex-col items-center justify-center bg-gradient-to-tr from-brand-blue-dark to-brand-blue-light">
            <MobileMenu
              onClose={() => {
                setIsShowingMenu(false)
                console.log('closssing')
              }}
            />
          </motion.ul>
        )}
      </AnimatePresence>
    </>
  )
}

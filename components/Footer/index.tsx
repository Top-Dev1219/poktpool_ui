import Image from 'next/image'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import coincoverLogo from '../../public/images/coincover.png'
import poktpoolLogoHeight from '../../public/images/poktpool-logo-white.png'

const socialLinks: { href: string; label: string; icon: any }[] = [
  {
    href: 'https://discord.gg/wkEEznB8Hm',
    label: 'Discord',
    icon: ['fab', 'discord'],
  },
  {
    href: 'mailto:hello@poktpool.com',
    label: 'Email',
    icon: ['fas', 'envelope'],
  },
  {
    href: 'https://t.me/poktpool',
    label: 'Telegram',
    icon: ['fab', 'telegram'],
  },
  {
    href: 'https://twitter.com/poktpool',
    label: 'Twitter',
    icon: ['fab', 'twitter'],
  },
]

export const Footer = () => {
  const { data: session } = useSession()
  const hasAccessToken = Boolean(session?.accessToken)

  return (
    <>
      <footer className="flex flex-col gap-8 bg-gradient-to-tr from-brand-blue-dark to-brand-blue-light py-16 text-center">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-8">
            <div>
              <h2 className="text-white text-left w-full sm:w-3/4">
                Take your POKT to the next level with poktpool.
              </h2>
              {!hasAccessToken && (
                <div className="flex flex-col gap-4 w-full sm:w-3/4">
                  <div className="bg-white text-brand-blue-dark rounded-full capitalize py-4 px-8 text-lg font-bold hover:bg-white">
                    <Link href="/join" passHref>
                      Create Account
                    </Link>
                  </div>
                  <div className="bg-transparent text-white rounded-full border border-white border-solid capitalize py-4 px-8 text-lg font-bold">
                    <Link href="login">Log In</Link>
                  </div>
                </div>
              )}
            </div>
            <div>
              <h2 className="text-left text-white">Support</h2>
              <div className="pl-4 flex flex-col gap-4 text-left">
                <Link passHref href="/faq">
                  <a className="text-white">FAQs</a>
                </Link>
                <Link passHref href="/contact-us">
                  <a className="text-white">Contact Us</a>
                </Link>
              </div>
            </div>
            <div>
              <h2 className="text-left text-white">Company</h2>
              <div className="pl-4 flex flex-col gap-4 text-left">
                <Link passHref href="/about">
                  <a className="text-white">About</a>
                </Link>
                <Link passHref href="/careers">
                  <a className="text-white">Careers</a>
                </Link>
                <Link passHref href="/blogs">
                  <a className="text-white">Blog</a>
                </Link>
                <Link passHref href="/analysis">
                  <a className="text-white">Analytics</a>
                </Link>
                <Link passHref href="/press-kit">
                  <a className="text-white">Press Kit</a>
                </Link>
              </div>
            </div>
            {!hasAccessToken && (
              <div>
                <h2 className="text-left text-white">Sign In</h2>
                <div className="pl-4 flex flex-col gap-4 text-left">
                  <Link passHref href="/login">
                    <a className="text-white">Log In</a>
                  </Link>
                  <p className="text-white my-0">Create Account</p>
                </div>
                <div className="pl-8 flex flex-col gap-4 text-left mt-4">
                  <Link passHref href="/join?existing_user=existing_user">
                    <a className="text-white">Existing Members</a>
                  </Link>
                  <Link passHref href="/join">
                    <a className="text-white">New Members</a>
                  </Link>
                </div>
              </div>
            )}
          </div>
          <div className="sm:flex gap-4 items-center border border-solid border-white border-l-0 border-r-0 mt-12">
            <div className="w-full sm:w-1/5 my-4 sm:my-0">
              <div className="flex pt-2 justify-center sm:justify-start">
                <div className="w-52 cursor-pointer">
                  <Link href="/" passHref>
                    <Image alt="poktpool logo" src={poktpoolLogoHeight} />
                  </Link>
                </div>
              </div>
            </div>
            <div className="w-full sm:w-1/5 my-4 sm:my-0">
              <div className="flex gap-8 text-2xl md:text-3xl text-white justify-center">
                {socialLinks.map(({ href, label, icon }) => (
                  <a target="_blank" rel="noreferrer" key={href} href={href}>
                    <FontAwesomeIcon icon={icon} />
                  </a>
                ))}
              </div>
            </div>
            <div className="w-full sm:w-2/5 my-4 sm:my-0">
              <div className="flex justify-center">
                <nav className="inline-grid sm:grid-flow-col gap-8">
                  <Link passHref href="/disclaimer">
                    <a className="text-white underline">Disclaimer</a>
                  </Link>
                  <Link passHref href="/terms-of-service">
                    <a className="text-white underline">Terms of Service</a>
                  </Link>
                  <Link passHref href="/privacy-policy">
                    <a className="text-white underline">Privacy Policy</a>
                  </Link>
                </nav>
              </div>
            </div>
            <div className="w-full sm:w-1/5 my-4 sm:my-0">
              <div className="flex justify-center sm:justify-end">
                <div className="w-52 pt-[6px]">
                  <a
                    href="https://www.coincover.com/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Image alt="Protected by coincover" src={coincoverLogo} />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="text-left text-white mt-12">
            <p>
              *This offer is only valid for new members who create and validate
              a wallet with poktpool. Availability of this incentive is limited
              and subject to change or revocation at poktpool&rsquo;s sole
              discretion. poktpool reserves the right to alter the terms,
              conditions, and payout amounts at any time without prior notice.
              This offer is void where prohibited by law or if poktpool
              otherwise determines in its sole discretion that the customer is
              ineligible.
            </p>
            <p className="mt-8">
              The information provided is for general informational purposes
              only and is not intended as investment advice. The cryptoasset
              market is highly unpredictable and may result in a loss of funds.
              Please note that taxes may apply to any returns or increases in
              the value of your cryptoassets and it is recommended that you seek
              independent tax advice. Any investment decision should be made
              after careful consideration and consultation with a professional
              financial advisor.
            </p>
            <p className="text-center text-sm my-12">
              © 2023 poktpool, Inc. All rights reserved
            </p>
          </div>
        </div>
      </footer>
    </>
  )
}

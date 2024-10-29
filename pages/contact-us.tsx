import React from 'react'
import type { NextPage } from 'next'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import PageLayout from '../components/PageLayout'
import EmailIcon from '@mui/icons-material/Email'
import ApartmentIcon from '@mui/icons-material/Apartment'
import TwitterIcon from '@mui/icons-material/Twitter'
import LinkedInIcon from '@mui/icons-material/LinkedIn'
import TelegramIcon from '@mui/icons-material/Telegram'
import { DiscordIcon } from '../components/DiscordIcon'

const ContactUs: NextPage = () => {
  return (
    <PageLayout title="Contact Us">
      <div className="container max-w-4xl mx-auto">
        <Alert
          severity="warning"
          className="mb-16 rounded-md warning-alert-style text-brand-orange"
        >
          <AlertTitle>Security Notice</AlertTitle>
          poktpool™ will NEVER ask you for your Password, Private Keys, or
          2-step verification codes, or ask you to install remote sign-in
          software on your computer. If anyone claiming to be with poktpool™
          Support makes these requests, contact us immediately.
        </Alert>
        <div className="flex justify-center">
          <h1 className="mt-0 mb-0">We&rsquo;re here for you</h1>
        </div>
        <div className="block sm:grid grid-cols-2 mt-16">
          <div className="block sm:flex justify-center">
            <div className="max-w-2xl">
              <div className="flex">
                <EmailIcon />
                <p className="ml-2 my-0">Hello@poktpool.com</p>
              </div>
              <div className="flex mt-1">
                <ApartmentIcon />
                <p className="ml-2 my-0">
                  poktpool, inc.
                  <br />
                  4830 West Kennedy Blvd
                  <br />
                  Suite 600
                  <br />
                  Tampa, Florida 33609
                </p>
              </div>
            </div>
          </div>
          <div className="block mt-10 sm:mt-0 sm:flex justify-center">
            <div className="max-w-2xl">
              <div className="flex">
                <TwitterIcon />
                <a
                  className="ml-2 hover:underline"
                  href="https://twitter.com/poktpool"
                  target="_blank"
                  rel="noreferrer"
                >
                  https://twitter.com/poktpool
                </a>
              </div>
              <div className="flex mt-2">
                <DiscordIcon />
                <a
                  className="ml-2 hover:underline"
                  href="https://discord.gg/f4XFVDXaMP"
                  target="_blank"
                  rel="noreferrer"
                >
                  https://discord.gg/f4XFVDXaMP
                </a>
              </div>
              <div className="flex mt-2">
                <LinkedInIcon />
                <a
                  className="ml-2 hover:underline"
                  href="https://www.linkedin.com/company/poktpool/"
                  target="_blank"
                  rel="noreferrer"
                >
                  https://linkedin.com/company/poktpool/
                </a>
              </div>
              <div className="flex mt-2">
                <TelegramIcon />
                <a
                  className="ml-2 hover:underline"
                  href="https://t.me/poktpool"
                  target="_blank"
                  rel="noreferrer"
                >
                  https://t.me/poktpool
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}

export default ContactUs

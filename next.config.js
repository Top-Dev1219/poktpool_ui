const dotenv = require('dotenv')
const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
})

dotenv.config()

/** @type {import('next').NextConfig} */
module.exports = withMDX({
  pageExtensions: ['js', 'ts', 'tsx', 'md', 'mdx'],
  reactStrictMode: true,
  env: {
    GOOGLE_RECAPTCHA_SITE_KEY: process.env.GOOGLE_RECAPTCHA_SITE_KEY,
    MAINTENANCE_MODE: process.env.MAINTENANCE_MODE,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    POKTPOOL_API_URL: process.env.POKTPOOL_API_URL,
    BUY_POKT_DIVIDER: process.env.BUY_POKT_DIVIDER,
  },
  images: {
    domains: [
      'content.poktpool.com',
      'pokt-dev.ewr1.vultrobjects.com',
      'pokt-preprod.ewr1.vultrobjects.com',
      'pokt.ewr1.vultrobjects.com',
      'poktpool.wpenginepowered.com',
    ],
  },
})

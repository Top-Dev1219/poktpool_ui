import { useEffect, useState } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'
import type { NextPage } from 'next'
import { useSession } from 'next-auth/react'
import Head from 'next/head'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useQuery } from 'react-query'
import { Grid } from '@mui/material'
import { format, parseISO } from 'date-fns'
import parse from 'html-react-parser'
import Link from 'next/link'
import currency from 'currency.js'
import SecureIcon from '../public/images/secure-icon.svg'
import RevolutionaryIcon from '../public/images/revolutionary-icon.svg'
import EmpoweringIcon from '../public/images/empowering-icon.svg'
import worldMapImage from '../public/images/world-map.png'
import PageLayout from '../components/PageLayout'
import useUser from '../hooks/useUser'
import ReviewSlider from '../components/ReviewSlider/ReviewSlider'

const reviews = [
  {
    text: 'Guys, if you have $POKT coin, stake your #pokt and earn daily $POKT rewards on @Poktpool platform. They also compounding your POKT rewards daily. Currently 126 millions of POKT staked on poktpool. It is the most reliable and profitable pool for $POKT coin. All funds are insured.',
    author: 'Lion HEART | Suiswap',
  },
  {
    text: `I have been staking with @poktpool for 13 months now. I have had an incredible experience both with staff and newly developed website.  I couldn't be happier with my experience nor my investment in @POKTnetwork. Thank you to both organizations. @TracieCMyers
     and @jalde__`,
    author: 'Douglas Ehrhart',
  },
  {
    text: `I really love using @pokt, @poktpool and @walletpoktnetwork. It is easy. You just make a w on walletpoktnetwork(save keyfile), create account on poktpool,(use 2FA,for your security). Then buy some $pokt,send them to w and then to the pool. Relax,lay back and enjoy`,
    author: '(💙,🧡)mario87',
  },
  {
    text: `@poktpool what a great return! Better then what you get for your fiat money on the bank! #pokt #poktpool`,
    author: 'Alexander',
  },
]

const Home: NextPage = () => {
  const { status } = useSession()
  const { user } = useUser()
  const router = useRouter()
  const {
    isLoading,
    error,
    data: blogs,
  } = useQuery(
    'wp/poktpool-any-blog-posts',
    () =>
      fetch(
        `${process.env.NEXT_PUBLIC_WORDPRESS_BASE_URL}/wp-json/wp/v2/posts?_embed`
      ).then((res) => res.json()),
    { enabled: true }
  )

  const { data: poolData, refetch: refetchPoolData } = useQuery(
    'public/poolData',
    () => axios.get('data/pool-metrics', {}).then((res) => res.data)
  )

  // API health check to catch 502/503 server error
  const { data: apiHealthCheck } = useQuery('api/health-check', () => {
    ;(async () => {
      try {
        await axios.get('health')
      } catch (error) {
        console.error(error)
      }
    })()
  })

  useEffect(() => {
    if (status === 'authenticated') {
      if (user?.customerIds?.length === 0) {
        router.replace('/analysis')
      }
    }
  }, [user, status, router])

  return (
    <>
      <Head>
        <meta
          name="description"
          content="Join poktpool, the first and largest staking pool for POKT token in the Pocket network. Earn rewards with our secure and user-friendly platform. Sign up today!"
        />
      </Head>
      <PageLayout title="Homepage" isHome>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <section className="w-full p-5 lg:py-20 lg:px-10 xl:px-32 2xl:px-64">
            <Grid container>
              <Grid item xs={12} lg={6} className="my-auto">
                <div className="pr-4 lg:pr-24">
                  <h1 className="max-w-3xl font-bold text-4xl">
                    Stake {'&'} Earn POKT Today!
                  </h1>
                  <div className="mt-8 mb-14 text-xl leading-8">
                    Experience peace of mind with our reliable, secure platform.
                    We compound your POKT rewards daily, providing a hassle-free
                    way to maximize your earning potential.{' '}
                    <p className="my-0">
                      <strong>Ready to get started?</strong>
                    </p>
                  </div>
                  <div className="flex">
                    <div className="bg-brand-blue-dark text-white text-center font-bold py-3 px-6 rounded-md">
                      <Link href="/join" passHref>
                        JOIN TODAY
                      </Link>
                    </div>
                  </div>
                </div>
              </Grid>
              <Grid item xs={12} lg={6} className="my-auto">
                <div className="w-full text-center mt-32 lg:mt-0">
                  <video
                    autoPlay
                    loop
                    playsInline
                    muted
                    style={{ width: '100%' }}
                  >
                    <source
                      src="/images/desktop-home-video-univeral-h264.mp4"
                      type="video/mp4"
                    />
                  </video>
                </div>
              </Grid>
            </Grid>
          </section>
          <section className="w-full py-4">
            <div className="relative analytic_bg p-5 lg:px-10 xl:px-32 xl:py-64 2xl:p-64">
              <Grid container>
                <Grid item xs={12} lg={6}>
                  <div className="">
                    <div className="relative pl-2.5 before:absolute before:content-[''] before:h-full before:left-0 before:border-2 before:border-solid before:border-brand-orange">
                      <span className="text-brand-blue-dark text-base">
                        PERFORMANCE DATA
                      </span>
                    </div>
                    <h1 className="font-bold text-3xl mb-0 mt-2.5">
                      Analytics
                    </h1>
                  </div>
                </Grid>
                <Grid item xs={12} lg={6}>
                  <div className="">
                    <p className="my-0">
                      Join the future of fractional node staking with poktpool™,
                      the platform powered by cutting-edge technology and
                      trusted partnerships with premium infrastructure.
                      Experience scalable, reliable, and secure staking with
                      ease.
                    </p>
                  </div>
                </Grid>
              </Grid>
              <div className="xl:absolute bottom-0 left-0 w-full mt-10 xl:mt-0 xl:px-32 2xl:px-64">
                <div className="w-full rounded-3xl bg-white-50 shadow-custom-lg py-6">
                  <Grid container>
                    <Grid item xs={12} sm={6} lg={3}>
                      <div className="max-[600px]:mt-16 max-[1200px]:mt-6">
                        <div className="relative text-center after:absolute after:top-0 after:right-0 after:content-[''] after:h-full after:border-0 after:border-solid after:border-brand-light-grey after:md:border">
                          <div className="text-4xl text-brand-blue-dark font-bold font-sans mb-5">
                            {poolData?.staked_balance
                              ? currency(
                                  Number(poolData?.staked_balance) / 1000000,
                                  {
                                    precision: 2,
                                    symbol: '',
                                  }
                                ).format() + 'M'
                              : '-'}
                          </div>
                          <h4 className="text-2xl my-0 font-bold">
                            POKT Staked
                          </h4>
                          <div className="md:hidden mt-16 max-w-[100px] mx-auto border border-solid border-brand-light-grey border-r-0 border-l-0 border-t-0"></div>
                        </div>
                      </div>
                    </Grid>
                    <Grid item xs={12} sm={6} lg={3}>
                      <div className="max-[600px]:mt-16 max-[1200px]:mt-6">
                        <div className="relative text-center after:absolute after:top-0 after:right-0 after:content-[''] after:h-full after:border-0 after:border-solid after:border-brand-light-grey after:min-[1200px]:border">
                          <div className="text-4xl text-brand-blue-dark font-bold font-sans mb-5">
                            {poolData?.staked_members
                              ? currency(
                                  Number(poolData?.staked_members) / 1000,
                                  {
                                    precision: 2,
                                    symbol: '',
                                  }
                                ).format() + 'K'
                              : '-'}
                          </div>
                          <h4 className="text-2xl my-0 font-bold">Members</h4>
                          <div className="md:hidden mt-16 max-w-[100px] mx-auto border border-solid border-brand-light-grey border-r-0 border-l-0 border-t-0"></div>
                        </div>
                      </div>
                    </Grid>
                    <Grid item xs={12} sm={6} lg={3}>
                      <div className="max-[600px]:mt-16 max-[1200px]:mt-6">
                        <div className="relative text-center after:absolute after:top-0 after:right-0 after:content-[''] after:h-full after:border-0 after:border-solid after:border-brand-light-grey after:md:border">
                          <div className="text-4xl text-brand-blue-dark font-bold font-sans mb-5">
                            {poolData?.total_rewards
                              ? currency(
                                  Number(poolData?.total_rewards) /
                                    1000000000000,
                                  {
                                    precision: 2,
                                    symbol: '',
                                  }
                                ).format() + 'M'
                              : '-'}
                          </div>
                          <h4 className="text-2xl my-0 font-bold">
                            POKT Earned
                          </h4>
                        </div>
                        <p className="min-[1200px]:hidden text-center">
                          since 12/01/2021
                        </p>
                        <div className="md:hidden mt-16 max-w-[100px] mx-auto border border-solid border-brand-light-grey border-r-0 border-l-0 border-t-0"></div>
                      </div>
                    </Grid>
                    <Grid item xs={12} sm={6} lg={3}>
                      <div className="max-[600px]:mt-16 max-[1200px]:mt-6">
                        <div className="text-center">
                          <div className="text-4xl text-brand-blue-dark font-bold font-sans mb-5">
                            {poolData?.daily_earn_per_k
                              ? currency(poolData?.daily_earn_per_k * 15, {
                                  precision: 2,
                                  symbol: '',
                                }).format()
                              : '-'}
                          </div>
                          <h4 className="text-2xl my-0 font-bold">
                            POKT Earned/15K
                          </h4>
                        </div>
                        <p className="min-[1200px]:hidden text-center">
                          in the last 24 hours
                        </p>
                      </div>
                    </Grid>
                    <Grid item xs={12} sm={6} lg={3}></Grid>
                    <Grid item xs={12} sm={6} lg={3}></Grid>
                    <Grid item xs={12} sm={6} lg={3}>
                      <p className="text-center mb-0 mt-2 hidden min-[1200px]:block">
                        since 12/01/2021
                      </p>
                    </Grid>
                    <Grid item xs={12} sm={6} lg={3}>
                      <p className="text-center mb-0 mt-2 hidden min-[1200px]:block">
                        in the last 24 hours
                      </p>
                    </Grid>
                  </Grid>
                </div>
              </div>
            </div>
          </section>
          <section className="w-full px-5 sm:mt-8 lg:px-10 xl:px-32 2xl:px-64">
            <div className="sm:flex sm:justify-end">
              <div className="bg-brand-blue-dark text-white text-center font-bold py-3 px-6 rounded-md">
                <Link href="/analysis" passHref>
                  VIEW ANALYTICS DASHBOARD
                </Link>
              </div>
            </div>
          </section>

          <section className="w-full py-8 lg:py-20 xl:py-40">
            <div className="faq_bg py-10 lg:py-32 lg:px-10 xl:px-32 2xl:px-64">
              <div className="px-4 md:px-0 md:flex">
                <div className="mt-16 md:mt-0 w-full md:w-4/12 md:pr-8">
                  <div className="relative pl-2.5 before:absolute before:content-[''] before:h-full before:left-0 before:border-2 before:border-solid before:border-brand-orange">
                    <span className="text-brand-blue-dark text-base">
                      WHY POKTPOOL?
                    </span>
                  </div>
                  <h1 className="font-bold text-3xl mb-0 mt-2.5">
                    With limitless energy for our mission...
                  </h1>
                  <p>
                    we’re never satisfied and never sit still. We’re
                    continuously developing ourselves, constantly innovating,
                    and always building for the future — your future.
                  </p>
                  <div className="flex">
                    <div className="bg-brand-blue-dark text-white text-center font-bold py-3 px-6 mt-8 rounded-md">
                      <Link href="/join" passHref>
                        SIGN UP TODAY
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="mt-16 md:mt-0 w-full md:w-3/12">
                  <div className="">
                    <div className="text-center">
                      <Image src={SecureIcon} alt="Secure" />
                    </div>
                    <h3 className="text-center">SECURE</h3>
                    <p className="text-center max-w-[254px] mx-auto">
                      Committed to serving you with honesty, transparency, and
                      security.
                    </p>
                  </div>
                </div>
                <div className="w-full md:w-3/12">
                  <div className="">
                    <div className="text-center">
                      <Image src={RevolutionaryIcon} alt="Revolutionary" />
                    </div>
                    <h3 className="text-center">REVOLUTIONARY</h3>
                    <p className="text-center max-w-[192px] mx-auto">
                      Disrupting an industry for accessibility is what inspires
                      us.
                    </p>
                  </div>
                </div>
                <div className="mb-16 md:mb-0 w-full md:w-3/12">
                  <div className="">
                    <div className="text-center">
                      <Image src={EmpoweringIcon} alt="Empowering" />
                    </div>
                    <h3 className="text-center mt-2.5">EMPOWERING</h3>
                    <p className="text-center max-w-[280px] mx-auto">
                      We provide the tools, knowledge, and the support needed to
                      go after your financial goals.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section className="w-full flex items-center justify-center py-2">
            <div className="relative max-w-[900px] text-center">
              <Image src={worldMapImage} alt={`World map background image`} />
              <div className="absolute h-full w-full top-0 flex items-center justify-center px-4">
                <h4 className="max-w-[600px] mx-auto font-bold text-4xl text-center">
                  <span className="text-brand-blue-dark">poktpool</span> is
                  trusted by 3K+ users worldwide
                </h4>
              </div>
            </div>
          </section>
          <section className="w-full p-5 py-10 lg:py-32 lg:px-10 xl:px-32 2xl:px-64">
            <div className="relative w-full">
              <div className="relative pl-2.5 before:absolute before:content-[''] before:h-full before:left-0 before:border-2 before:border-solid before:border-brand-orange">
                <span className="text-brand-blue-dark text-base">OUR BLOG</span>
              </div>
              <div className="flex justify-between">
                <h1 className="font-bold text-2xl xl:text-3xl mb-0 mt-2.5">
                  Latest articles
                </h1>
                <div className="ml-2 mt-auto text-sm xl:text-base text-brand-blue-dark hover:underline">
                  <Link href="/blogs" passHref>
                    {'>> VIEW ALL POSTS'}
                  </Link>
                </div>
              </div>
            </div>
            <div className="w-full mt-8">
              <div className="sm:flex sm:justify-between gap-8">
                {blogs && blogs.length
                  ? blogs.slice(0, 3).map((blog: any) => (
                      <>
                        <div className="border border-solid border-slate-300 rounded-md w-full max-w-full md:max-w-[407px] mt-8 sm:mt-0">
                          <div
                            key={blog.id}
                            className="relative w-full h-60 md:max-w-[407px] md:h-60"
                          >
                            <Image
                              className="object-contain object-center border border-solid border-slate-300 border-r-0 border-l-0 border-t-0"
                              src={
                                blog?._embedded?.['wp:featuredmedia']?.[0]
                                  ?.source_url
                              }
                              alt="poktPool Homepage Post Image"
                              width="100%"
                              height="100%"
                              layout="fill"
                            />
                          </div>
                          <h3 className="px-5 mb-0">{blog?.title?.rendered}</h3>
                          <p className="text-sm px-5 mt-2">
                            {blog?.date && format(parseISO(blog?.date), 'PPP')}
                          </p>
                          <p className="ellipsis-text px-5">
                            {parse(blog?.excerpt?.rendered)}
                          </p>
                          <div className="px-5 mb-4 text-right text-brand-blue-dark text-sm">
                            <Link
                              className="text-brand-blue-dark"
                              href={`blogs/${blog?.slug}`}
                              passHref
                            >
                              Read More
                            </Link>
                          </div>
                        </div>
                      </>
                    ))
                  : ''}
              </div>
            </div>
          </section>
          <section className="w-full p-4 lg:py-32 lg:px-10 xl:px-32 2xl:px-64 faq_bg mb-20 md:mb-32">
            <div className="">
              <div className="relative pl-2.5 before:absolute before:content-[''] before:h-full before:left-0 before:border-2 before:border-solid before:border-brand-orange">
                <span className="text-brand-blue-dark text-base">
                  Our Testimonicals
                </span>
              </div>
              <h2 className="font-bold text-3xl mb-0 mt-2.5">
                Our Clients Reviews
              </h2>
            </div>
            <div className="mt-12">
              <ReviewSlider />
            </div>
          </section>
        </motion.div>
      </PageLayout>
    </>
  )
}

export default Home

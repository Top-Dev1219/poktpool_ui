import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import parse from 'html-react-parser'
import { useQuery } from 'react-query'

export const PromoBanner = () => {
  const { data: session } = useSession()
  const [loggedInText, setLoggedInText] = useState<any>()
  const [loggedOutText, setLoggedOutText] = useState<any>()

  const { isLoading, error, data, refetch } = useQuery(
    'wp/disclaimer',
    () =>
      fetch(
        `${process.env.NEXT_PUBLIC_WORDPRESS_BASE_URL}/wp-json/wp/v2/pages`
      ).then((res) => res.json()),
    { enabled: true }
  )

  useEffect(() => {
    setLoggedInText(
      data?.filter((item: any) => item.slug === 'logged-in-promo')?.[0]
    )
    setLoggedOutText(
      data?.filter((item: any) => item.slug === 'logged-out-promo-banner')?.[0]
    )
  }, [data])

  return (
    <>
      {session?.accessToken ? (
        <div className="bg-black p-1 text-center flex justify-center items-center fixed z-50 w-full">
          <div className="flex items-center gap-12">
            <p className="my-0 font-bold text-base text-white">
              {loggedInText?.content?.rendered &&
                parse(loggedInText?.content?.rendered)}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-black px-4 py-1 text-center flex justify-center items-center fixed z-50 w-full">
          <div className="flex items-center gap-12">
            <p className="my-0 font-bold text-base text-white">
              {loggedOutText?.content?.rendered &&
                parse(loggedOutText?.content?.rendered)}
            </p>
            <div className="bg-white text-black font-bold py-2 px-4 rounded-md">
              <Link href="/join" passHref>
                REDEEM NOW
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

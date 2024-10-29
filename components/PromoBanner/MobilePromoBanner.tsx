import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import { useQuery } from 'react-query'
import parse from 'html-react-parser'

export const MobilePromoBanner = ({
  closeBanner,
}: {
  closeBanner: () => void
}) => {
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
        <div className="bg-black px-4 py-4 flex justify-center items-center fixed z-50 w-full">
          <div className="flex items-center gap-4">
            <p className="my-0 font-bold text-base text-white">
              {loggedInText?.content?.rendered &&
                parse(loggedInText?.content?.rendered)}
            </p>
            <div className="flex justify-end">
              <IconButton
                className="text-white mb-2"
                aria-label="delete"
                size="small"
                onClick={closeBanner}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-black pl-4 pr-2 pb-3 flex justify-center items-center fixed z-50 w-full">
          <div className="flex">
            <div className="sm:flex">
              <p className="my-0 font-bold text-base text-white">
                {loggedOutText?.content?.rendered &&
                  parse(loggedOutText?.content?.rendered)}
              </p>
              <div className="bg-white w-2/3 mt-2 text-black text-center font-bold py-2 px-4 rounded-md">
                <Link href="/join" passHref>
                  REDEEM NOW
                </Link>
              </div>
            </div>
            <div className="flex justify-end">
              <IconButton
                className="text-white mb-2"
                aria-label="delete"
                size="small"
                onClick={closeBanner}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

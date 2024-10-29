import { useEffect, useState } from 'react'
import type { NextPage } from 'next'
import { useQuery } from 'react-query'
import parse from 'html-react-parser'
import CircularProgress from '@mui/material/CircularProgress'
import MDXPage from '../components/MDXPage'

const TermsOfService: NextPage = () => {
  const { isLoading, error, data, refetch } = useQuery(
    'wp/terms-of-service',
    () =>
      fetch(
        `${process.env.NEXT_PUBLIC_WORDPRESS_BASE_URL}/wp-json/wp/v2/pages`
      ).then((res) => res.json()),
    { enabled: true }
  )

  const [blogData, setBlogData] = useState<any>()

  useEffect(() => {
    setBlogData(
      data?.filter(
        (item: any) => item.slug === 'terms-of-serviceofpoktpool-inc'
      )?.[0]
    )
  }, [data])

  return (
    <MDXPage title="Disclaimer" showTitle={false}>
      <h1 className="text-center text-2xl leading-tight">
        Terms of Service
        <br /> of
        <br /> poktpool, inc.
      </h1>
      {isLoading ? (
        <div className="flex justify-center items-center">
          <CircularProgress />
        </div>
      ) : data ? (
        <div className="legal-pages-custom-class">
          {blogData?.content?.rendered && parse(blogData?.content?.rendered)}
        </div>
      ) : (
        ''
      )}
    </MDXPage>
  )
}

export default TermsOfService

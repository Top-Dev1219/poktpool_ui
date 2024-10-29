import { useEffect, useState } from 'react'
import type { NextPage } from 'next'
import { useQuery } from 'react-query'
import parse from 'html-react-parser'
import CircularProgress from '@mui/material/CircularProgress'
import MDXPage from '../components/MDXPage'

const Disclaimer: NextPage = () => {
  const { isLoading, error, data, refetch } = useQuery(
    'wp/disclaimer',
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
        (item: any) => item.slug === 'poktpool-inc-participant-disclaimer'
      )?.[0]
    )
  }, [data])

  return (
    <MDXPage title="Disclaimer" showTitle={false}>
      {isLoading ? (
        <div className="flex justify-center items-center">
          <CircularProgress />
        </div>
      ) : data ? (
        <div className="legal-pages-custom-class">
          <h1 className="text-4xl">{blogData?.title?.rendered}</h1>
          {blogData?.content?.rendered && parse(blogData?.content?.rendered)}
        </div>
      ) : (
        ''
      )}
    </MDXPage>
  )
}

export default Disclaimer

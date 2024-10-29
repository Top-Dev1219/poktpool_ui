import { useEffect, useState } from 'react'
import type { NextPage } from 'next'
import { useQuery } from 'react-query'
import parse from 'html-react-parser'
import CircularProgress from '@mui/material/CircularProgress'
import MDXPage from '../components/MDXPage'

const About: NextPage = () => {
  const { isLoading, error, data, refetch } = useQuery(
    'wp/about-page',
    () =>
      fetch(
        `${process.env.NEXT_PUBLIC_WORDPRESS_BASE_URL}/wp-json/wp/v2/pages`
      ).then((res) => res.json()),
    { enabled: true }
  )

  const [blogData, setBlogData] = useState<any>()

  useEffect(() => {
    setBlogData(data?.filter((item: any) => item.slug === 'about')?.[0])
  }, [data])

  return (
    <MDXPage title="Disclaimer" showTitle={false}>
      {isLoading ? (
        <div className="flex justify-center items-center">
          <CircularProgress />
        </div>
      ) : data ? (
        <>
          <h1 className="text-4xl">{blogData?.title?.rendered}</h1>
          {blogData?.content?.rendered && parse(blogData?.content?.rendered)}
        </>
      ) : (
        ''
      )}
    </MDXPage>
  )
}

export default About

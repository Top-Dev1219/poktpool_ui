import { useState, useEffect } from 'react'
import { useQuery } from 'react-query'
import Divider from '@mui/material/Divider'
import parse from 'html-react-parser'

export const JrFrontendEngineer = () => {
  const [blogData, setBlogData] = useState<any>()

  const { isLoading, error, data, refetch } = useQuery(
    'wp/jr-front-end-developer',
    () =>
      fetch(
        `${process.env.NEXT_PUBLIC_WORDPRESS_BASE_URL}/wp-json/wp/v2/pages`
      ).then((res) => res.json()),
    { enabled: true }
  )

  useEffect(() => {
    setBlogData(
      data?.filter((item: any) => item.slug === 'jr-front-end-developer')?.[0]
    )
  }, [data])

  return (
    <>
      <div>
        <h2 className="text-center">{blogData?.title?.rendered}</h2>
        <div className="flex justify-center mt-10 mb-16">
          <div className="w-20">
            <Divider className="border-slate-500" />
          </div>
        </div>
      </div>
      <div>
        {blogData?.content?.rendered && parse(blogData?.content?.rendered)}
      </div>
      <div className="flex justify-center mt-20">
        <div>
          <a
            href="mailto:careers@poktpool.com"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-brand-blue-dark text-white py-4 px-6 rounded-md text-xl"
          >
            Contact Us
          </a>
        </div>
      </div>
    </>
  )
}

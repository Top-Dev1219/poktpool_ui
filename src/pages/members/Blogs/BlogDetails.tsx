import { useQuery } from 'react-query'
import PageLayout from '../../../../components/PageLayout'
import { useRouter } from 'next/router'
import { CircularProgress } from '@mui/material'
import { format, parseISO } from 'date-fns'
import parse from 'html-react-parser'

export const BlogDetails = () => {
  const router = useRouter()
  const slug = router.query.slug;
  const { isLoading, error, data, refetch } = useQuery(
    `wp/poktpool-blog-posts/${slug}`,
    () =>
      fetch(
        `${process.env.NEXT_PUBLIC_WORDPRESS_BASE_URL}/wp-json/wp/v2/posts?slug=${slug}`
      ).then((res) => res.json()),
    { enabled: true }
  )
  return (
    <PageLayout title="Blog Content">
      {isLoading ? (
        <CircularProgress />
      ) : (
        <div className="weekly-blog-content max-w-5xl mx-auto">
          {data
            ?.filter((item: any) => item.slug === router.query.slug)
            .map((post: any) => (
              <>
                <h1 className="text-4xl underline">{post?.title?.rendered}</h1>
                <p>{format(parseISO(post?.date), 'PPP')}</p>
                {parse(post?.content?.rendered)}
              </>
            ))}
        </div>
      )}
    </PageLayout>
  )
}

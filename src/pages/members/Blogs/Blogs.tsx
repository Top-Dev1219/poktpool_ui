import React, { useState } from 'react'
import PageLayout from '../../../../components/PageLayout'
import { PostItem } from './PostItem'
import { useQuery } from 'react-query'
import { CircularProgress } from '@mui/material'

export const Blogs = () => {
  const [category, setCategory] = useState('')
  const [selectedPage, setSelectedPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const {
    isLoading,
    error,
    data,
    refetch: refetchPosts,
  } = useQuery(
    'wp/poktpool-all-blog-posts',
    () =>
      fetch(
        `${process.env.NEXT_PUBLIC_WORDPRESS_BASE_URL}/wp-json/wp/v2/posts?_embed&per_page=100`
      ).then((res) => res.json()),
    { enabled: true }
  )

  const { isLoading: categoryFetching, data: categories } = useQuery(
    'wp/poktpool-blog-categories',
    () =>
      fetch(
        `${process.env.NEXT_PUBLIC_WORDPRESS_BASE_URL}/wp-json/wp/v2/categories`
      ).then((res) => res.json()),
    { enabled: true }
  )

  const filteredData =
    data && data.length
      ? (data.find((item: any) => (item.categories?.includes(category) || !category) && item.slug == "poktpool-weekly-roundup-42") 
      ? [data.find((item: any) => (item.categories?.includes(category) || !category) && item.slug == "poktpool-weekly-roundup-42"), ...data.filter(
        (item: any) => (item.categories?.includes(category) || !category) && item.slug !== "poktpool-weekly-roundup-42"
      )] : data.filter(
        (item: any) => (item.categories?.includes(category) || !category) && item.slug !== "poktpool-weekly-roundup-42"
      ))
      : []

  return (
    <PageLayout title="Blogs">
      {isLoading ? (
        <div className="flex items-center justify-center">
          <CircularProgress />
        </div>
      ) : (
        <div className="max-w-6xl mx-auto">
          <h1 className="text-center mt-4 mb-8 md:mt-8 md:mb-16">Blogs</h1>
          <div className="md:flex">
            <div className="w-full md:w-1/5">
              <h2>Categories</h2>
              <p
                className={
                  category == ''
                    ? 'text-brand-blue-dark cursor-pointer'
                    : 'cursor-pointer'
                }
                onClick={() => setCategory('')}
              >
                All Posts
              </p>
              {categories &&
                categories
                  .filter((item: any) => item.name !== 'Uncategorized')
                  .map((item: any) => (
                    <p
                      className={
                        category == item.id
                          ? 'text-brand-blue-dark cursor-pointer'
                          : 'cursor-pointer'
                      }
                      key={item.id}
                      onClick={() => setCategory(item.id)}
                    >
                      {item?.name}
                    </p>
                  ))}
            </div>
            <div className="w-full md:w-4/5">
              <div className="pb-2 border-0 border-b border-solid border-slate-300">
                <div className="flex justify-end">
                  <button
                    className="py-2 px-3 bg-transparent border border-brand-blue-dark border-solid rounded-sm cursor-pointer text-brand-blue-dark mr-2 disabled:text-slate-300 disabled:border-slate-300"
                    disabled={selectedPage === 1}
                    onClick={() => setSelectedPage(selectedPage - 1)}
                  >
                    {'<'}
                  </button>
                  <button
                    className="py-2 px-3 bg-transparent border border-brand-blue-dark border-solid rounded-sm cursor-pointer text-brand-blue-dark disabled:text-slate-300 disabled:border-slate-300"
                    disabled={
                      Math.ceil(filteredData.length / pageSize) === selectedPage
                    }
                    onClick={() => setSelectedPage(selectedPage + 1)}
                  >
                    {'>'}
                  </button>
                </div>
              </div>
              {filteredData
                .slice(
                  (selectedPage - 1) * pageSize,
                  (selectedPage - 1) * pageSize + pageSize
                )
                .map((post: any) => (
                  <PostItem
                    key={post.id}
                    title={post.title.rendered}
                    pubDate={post?.date}
                    excerpt={post?.excerpt?.rendered}
                    imgSrc={
                      post?._embedded?.['wp:featuredmedia']?.[0]?.source_url
                    }
                    slug={`blogs/${post?.slug}`}
                  />
                ))}
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  )
}

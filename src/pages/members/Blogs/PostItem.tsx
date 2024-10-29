import Image from 'next/image'
import Link from 'next/link'
import { format, parseISO } from 'date-fns'
import parse from 'html-react-parser'

interface PostItemType {
  title: string
  slug: string
  pubDate: string
  excerpt: string
  imgSrc: string
}

export const PostItem = (props: PostItemType) => {
  return (
    <>
      <div className="md:flex md:gap-4 mt-8 pb-4 border-0 border-b border-solid border-slate-300">
        <div className="w-full md:w-72 md:h-60 shrink-0 border border-solid border-slate-300">
          <img
            className="w-full h-full object-contain object-center"
            src={props.imgSrc}
            alt="Test Image"
          />
        </div>

        <div>
          <h2 className="mt-0">{props.title}</h2>
          <p>{format(parseISO(props.pubDate), 'PPP')}</p>
          <div className="mb-0 custom-blog-margin-bottom-0">
            {props.excerpt && parse(props.excerpt)}
          </div>
          <div className="flex justify-end">
            <Link passHref href={props.slug}>
              <a className="text-brand-blue-dark cursor-pointer">Read More</a>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

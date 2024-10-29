import { useEffect, useState } from 'react'
import { useQuery } from 'react-query'
import PageLayout from '../../../../components/PageLayout'
import { JobCard } from './components'
import { JoinUsHeader } from './components'

type JobType = {
  id: number
  jobTitle: string
  location: string
  jobRoute: string
  slug: string
}

const jobs: JobType[] = [
  // {
  //   id: 0,
  //   jobTitle: 'SQL Developer',
  //   location: '100% Remote, Any Location',
  //   jobRoute: '/careers/sql-developer',
  //   slug: 'sql-developer',
  // },
  // {
  //   id: 1,
  //   jobTitle: 'Jr. Front-End Developer',
  //   location: '100% Remote, Any Location',
  //   jobRoute: '/careers/jr-frontend-engineer',
  //   slug: 'jr-front-end-developer',
  // },
  {
    id: 2,
    jobTitle: 'Marketing Director',
    location: '100% Remote, USA',
    jobRoute: '/careers/marketing-director',
    slug: 'marketing-director',
  },
]

export const Careers = () => {
  const { isLoading, error, data, refetch } = useQuery(
    'wp/company-careers',
    () =>
      fetch(
        `${process.env.NEXT_PUBLIC_WORDPRESS_BASE_URL}/wp-json/wp/v2/pages`
      ).then((res) => res.json()),
    { enabled: true }
  )

  const getTitle = (job: JobType) => {
    if (data) {
      return (
        data.find((item: any) => item.slug === job.slug)?.title.rendered ??
        job.jobTitle
      )
    }
  }

  return (
    <PageLayout title="Careers">
      <div className="max-w-4xl mx-auto">
        <JoinUsHeader />
        <div className="flex flex-wrap">
          {jobs.map((job) => (
            <div className="w-full p-4 sm:w-1/2 p" key={job.id}>
              <JobCard
                isLoading={isLoading}
                jobTitle={getTitle(job)}
                location={job.location}
                jobRoute={job.jobRoute}
              />
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  )
}

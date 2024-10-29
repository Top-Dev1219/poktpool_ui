import LocationOnIcon from '@mui/icons-material/LocationOn'
import { Skeleton } from '@mui/material'
import Link from 'next/link'

interface JobCardProps {
  isLoading: boolean
  jobTitle: string
  location: string
  jobRoute: string
}
export const JobCard = (props: JobCardProps) => {
  const { jobTitle, location, jobRoute, isLoading } = props
  return (
    <>
      <div className="border border-solid border-slate-300 hover:border-brand-blue-dark rounded-lg bg-blue pl-1 bg-gradient-to-b from-brand-blue-dark to-brand-blue-light">
        <div className="rounded-md p-4 bg-white overflow-hidden">
          <Link passHref href={jobRoute}>
            {isLoading ? (
              <Skeleton variant="text" width={200} height={40} />
            ) : (
              <h3 className="hover:text-brand-blue-dark hover:cursor-pointer mt-0">
                {jobTitle}
              </h3>
            )}
          </Link>
          <div className="flex items-center">
            {isLoading ? (
              <Skeleton variant="text" width={200} height={40} />
            ) : (
              <>
                <LocationOnIcon />
                <p className="my-0">{location}</p>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

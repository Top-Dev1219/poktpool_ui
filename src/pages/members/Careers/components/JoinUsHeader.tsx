import Divider from '@mui/material/Divider'
export const JoinUsHeader = ({ jobTitle }: { jobTitle?: string }) => {
  return (
    <>
      <h2 className="text-center">{jobTitle ? jobTitle : 'Join Our Team'}</h2>
      <div className="flex justify-center mt-10 mb-16">
        <div className="w-20">
          <Divider className="border-slate-500" />
        </div>
      </div>
    </>
  )
}

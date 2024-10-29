import { CircularProgress } from '@mui/material'
import axios from 'axios'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import PageLayout from '../components/PageLayout'

export default function UpdateEmail() {
  const {
    query: { token },
    push,
  } = useRouter()
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [isConfirming, setIsConfirming] = useState(true)
  const { data: session, status } = useSession()

  useEffect(() => {
    ;(async () => {
      if (status !== 'loading') {
        if (token?.length) {
          try {
            const res = await axios.post('confirm-email/change-email', {
              token,
            })
            setIsConfirmed(true)
          } catch (error) {
            console.error(error)
          }

          setIsConfirming(false)
        } else {
          push('/')
        }
      }
    })()
  }, [token, status])

  return (
    <PageLayout title="Confirm Email">
      <section>
        <div className="container mx-auto px-4 prose">
          <h1>Change Email</h1>
          {isConfirming && !isConfirmed ? (
            <CircularProgress />
          ) : isConfirmed ? (
            <p>Your email has been updated successfully!</p>
          ) : (
            <div>
              <p>
                Your email was not updated since you are logged out.{' '}
                {status !== 'authenticated' &&
                  `If you want to resend
                the confirmation email, log in and go to My Account.`}
              </p>
            </div>
          )}
        </div>
      </section>
    </PageLayout>
  )
}

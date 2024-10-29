import { CircularProgress } from '@mui/material'
import axios from 'axios'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import PageLayout from '../components/PageLayout'
import { POKTPOOL_API_URL } from '../hooks/useApi'

export default function ConfirmEmail() {
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
            const res = await axios.post('confirm-email/confirm', {
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
          <h1>Confirm Email</h1>
          {isConfirming && !isConfirmed ? (
            <CircularProgress />
          ) : isConfirmed ? (
            <p>Your account has been confirmed!</p>
          ) : (
            <div>
              <p>
                Your account has not been confirmed yet.{' '}
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

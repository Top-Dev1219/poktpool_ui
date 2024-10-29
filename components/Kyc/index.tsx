import { useState } from 'react'
import { Alert, AlertTitle, CircularProgress } from '@mui/material'
import { useQuery } from 'react-query'
import axios from 'axios'
import Button from '../Button'
import { useAuthMutation } from '../../hooks/useApi'
import useAccessToken from '../../hooks/useAccessToken'
import { POKTPOOL_STRING } from '../../src/constants'
import { AccountProps } from '../../src/pages/members/MyAccount/TwoFactorAuth'
import useApi from '../../hooks/useApi'

export const Kyc = (props: AccountProps) => {
  const { user, refetchUser } = props
  const accessToken = useAccessToken()
  const [isConfirmationResent, setIsConfirmationResent] = useState(false)
  const { post: resendConfirmEmail } = useApi('confirm-email/resend-confirm')

  const {
    data,
    isLoading: isKycStatusLoading,
    refetch,
  } = useQuery<{
    allowRetry?: boolean
    jumioDecision?: 'PASSED' | 'REJECTED' | 'WARNING' | 'MANUAL_REVIEW'
    status: 'INITIATED' | 'PROCESSED' | 'ACQUIRED'
    reason: null | 'NO_INFO' | 'UNDER_18' | 'SANCTIONED'
    webHref?: string
  }>(
    'poolData',
    () =>
      axios
        .get('jumio/kyc-status', {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        })
        .then((res) => {
          const data = res.data
          return data
        }),
    {
      enabled: !!accessToken,
      onSuccess: (data) => data.jumioDecision === 'PASSED' && refetchUser(),
    }
  )

  const { mutate: retryKyc } = useAuthMutation('jumio/kyc-retry', undefined, {
    onSuccess: (data: any) => {
      if (typeof window !== 'undefined') {
        window.open(data?.webHref, '_blank')
      }
      refetch()
    },
  })

  return (
    <section className="max-w-5xl mx-auto mt-16">
      <h2>ID Verification</h2>
      {!user?.isEmailVerified ? (
        <Alert
          severity="warning"
          className="mb-8 warning-alert-style text-brand-orange"
        >
          <AlertTitle>
            <strong>Verify your email address.</strong>
          </AlertTitle>
          <p>
            You won&apos;t be able to stake or withdraw until you&apos;ve
            verified your email address by visiting the link sent to your
            account&apos;s email.
          </p>
          <div className="inline-block">
            {!isConfirmationResent && (
              <Button
                onClick={() =>
                  resendConfirmEmail()
                    .then(setIsConfirmationResent(true))
                    .catch(console.error)
                }
              >
                Resend Verification Email
              </Button>
            )}
          </div>
        </Alert>
      ) : (
        <>
          {user?.jumioDecision !== 'PASSED' && (
            <>
              <Alert
                severity="warning"
                className="warning-alert-style text-brand-orange"
              >
                You won&apos;t be able to stake or withdraw until you&apos;ve
                verified your identity. For the best experience, use{' '}
                <span className="font-bold">Chrome</span> or{' '}
                <span className="font-bold">Firefox</span> to complete your ID
                verification process. Ensure that pop-ups are enabled. For
                additional assistance, use the Need Help button in the lower
                right corner.
              </Alert>
            </>
          )}

          {isKycStatusLoading && (
            <div className="inline-grid grid-flow-col items-center justify-start gap-4">
              <CircularProgress className="w-8 h-8" />
              <p>Checking your status...</p>
            </div>
          )}
          {data?.status === 'PROCESSED' && !data?.allowRetry && (
            <>
              {data?.jumioDecision === 'PASSED' && (
                <p>Your identity is verified.</p>
              )}
              {data?.jumioDecision === 'MANUAL_REVIEW' && (
                <Alert
                  severity="warning"
                  className="mt-4 warning-alert-style text-brand-orange"
                >
                  Your ID verification is under review. Please check back in 24
                  hours.
                </Alert>
              )}
              {(data?.jumioDecision === 'REJECTED' ||
                data?.jumioDecision === 'WARNING') && (
                <>
                  {data?.reason == 'UNDER_18' ? (
                    <Alert
                      severity="warning"
                      className="mt-4 warning-alert-style text-brand-orange"
                    >
                      You must be 18 years of age or older to use this service.
                      If you believe that this decision has been made in error,
                      please reach out using the{' '}
                      <span className="font-bold">Need Help</span> button
                    </Alert>
                  ) : (
                    <p>
                      There was an issue with your ID verification. Please fill
                      out a support ticket.
                    </p>
                  )}
                </>
              )}
            </>
          )}
          {data?.status === 'ACQUIRED' && (
            <>
              <p>Your verification is currently being processed.</p>
              <Button variant="outlined" onClick={() => refetch()}>
                Refresh
              </Button>
            </>
          )}
          {(data?.status === 'INITIATED' || data?.allowRetry) && (
            <>
              <p>
                The button below will open a new tab where you will continue the
                verification process on{' '}
                <a href="https://jumio.com" rel="noreferrer" target="_blank">
                  Jumio
                </a>
                , our KYC provider. When you are finished, you will be
                redirected back to {POKTPOOL_STRING}. If something went wrong
                and you&apos;re really you, there&apos;s no penalty for going
                through verification more than once.
              </p>
              <div className="inline-block">
                {data?.allowRetry ? (
                  <Button gradient onClick={async () => retryKyc()}>
                    Retry KYC
                  </Button>
                ) : (
                  <Button
                    gradient={!isKycStatusLoading}
                    disabled={isKycStatusLoading}
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        window.open(data?.webHref, '_blank')
                      }
                    }}
                    variant="contained"
                  >
                    Verify Your Identity
                  </Button>
                )}
              </div>
            </>
          )}
        </>
      )}
    </section>
  )
}

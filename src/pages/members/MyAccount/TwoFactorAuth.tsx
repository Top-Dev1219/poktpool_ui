import { useState } from 'react'
import Button from '../../../../components/Button'
import DisableTwoFactorAuthModal from '../../../../components/modals/DisableTwoFactorAuthModal'
import EnableTwoFactorAuthModal from '../../../../components/modals/EnableTwoFactorAuthModal'

export interface AccountProps {
  user?: any
  refetchUser: () => void
}

export const TwoFactorAuth = (props: AccountProps) => {
  const { user, refetchUser } = props
  const [isEnableTwoFactorModalOpen, setIsEnableTwoFactorModalOpen] =
    useState(false)
  const [isDisableTwoFactorModalOpen, setIsDisableIsTwoFactorModalOpen] =
    useState(false)
  return (
    <>
      <DisableTwoFactorAuthModal
        open={isDisableTwoFactorModalOpen}
        onClose={() => {
          refetchUser()
          setIsDisableIsTwoFactorModalOpen(false)
        }}
      />
      <EnableTwoFactorAuthModal
        open={isEnableTwoFactorModalOpen}
        onClose={() => setIsEnableTwoFactorModalOpen(false)}
      />
      <div className="max-w-5xl mx-auto mt-16">
        <h2>Two-Factor Authentication</h2>
        {user?.isTwoFactorEnabled ? (
          <>
            <p>You have two-factor authentication enabled.</p>
            <Button
              onClick={() => setIsDisableIsTwoFactorModalOpen(true)}
              color="error"
              variant="outlined"
            >
              Disable Two-Factor Authentication
            </Button>
          </>
        ) : (
          <Button
            onClick={() => setIsEnableTwoFactorModalOpen(true)}
            variant="contained"
            gradient
          >
            Enable Two-Factor Authentication
          </Button>
        )}
      </div>
    </>
  )
}

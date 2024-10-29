import { Button, Modal, TextField } from '@mui/material'
import Image from 'next/image'
import axios from 'axios'
import { useSession, signOut } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { FieldValues, useForm } from 'react-hook-form'
import useApi, { POKTPOOL_API_URL } from '../../hooks/useApi'

export default function EnableTwoFactorAuthModal({
  open = false,
  onClose = () => {},
}) {
  const [qr, setQr] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [isEnabled2fa, setIsEnabled2fa] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { handleSubmit, register, watch } = useForm()
  const { data: session } = useSession()
  const { post: enable2fa } = useApi('2fa/enable-qr')
  const watchTwoFactorCode = watch('twoFactorCode')

  const onSubmit = async ({ twoFactorCode }: FieldValues) => {
    enable2fa({ twoFactorCode }).then((data: any) => {
      setBackupCodes(data?.data?.codes)
      setIsEnabled2fa(true)
    })
  }

  useEffect(() => {
    const get2faQr = async () => {
      // Could not get this to work with axios.
      const response = await fetch(`${POKTPOOL_API_URL}/2fa/create-qr`, {
        method: 'POST',
        headers: {
          responseType: 'arraybuffer',
          authorization: `Bearer ${session?.accessToken}`,
        },
      })
      const imageBlob = await response.blob()
      const reader = new FileReader()
      reader.readAsDataURL(imageBlob)
      reader.onloadend = () => {
        const base64data = reader.result as string
        setQr(base64data)
      }
    }

    if (open && session?.accessToken) {
      get2faQr()
    }
  }, [open, session?.accessToken])

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <div
        className="absolute top-1/2 left-1/2 p-8 rounded-lg bg-white"
        style={{ transform: 'translate(-50%, -50%)' }}
      >
        <h1 id="modal-modal-title" className="mt-0">
          Two-Factor Authentication
        </h1>
        {isEnabled2fa ? (
          <div>
            <p>
              Two-factor authentication successfully enabled! Save your back-up
              codes, then log out and login again.
            </p>
            <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
              {backupCodes.map((code) => (
                <div
                  key={code}
                  className="flex justify-evenly p-4 border border-solid border-gray-300 rounded-md"
                >
                  {code.split('').map((ch, i) => (
                    <span key={i}>{ch}</span>
                  ))}
                </div>
              ))}
            </div>
            <Button
              onClick={() => {
                localStorage.removeItem('customerId')
                signOut({
                  callbackUrl: `/`,
                })
              }}
            >
              Log out
            </Button>
          </div>
        ) : (
          <div>
            <p id="modal-modal-description">
              Scan this QR code with an Authenticator app on your phone. Once
              added, provide the 6-digit code the app provides to enable 2FA
              login.
            </p>
            <div className="text-center p-4 mb-8">
              {qr && <Image alt="QR code" src={qr} width={240} height={240} />}
            </div>
            <div className="text-center">
              <form
                className="inline-flex gap-4"
                onSubmit={handleSubmit(onSubmit)}
              >
                <TextField
                  id="outlined-basic"
                  label="6-Digit Code"
                  variant="outlined"
                  inputProps={{
                    inputMode: 'numeric',
                    pattern: '[0-9]*',
                    maxLength: 6,
                  }}
                  {...register('twoFactorCode', {
                    required: true,
                    minLength: 6,
                    maxLength: 6,
                  })}
                />
                <Button
                  type="submit"
                  disabled={
                    typeof watchTwoFactorCode === 'string'
                      ? watchTwoFactorCode.length !== 6
                      : true
                  }
                  variant="contained"
                >
                  Enable 2FA
                </Button>
              </form>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

import {
  Button,
  Modal,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material'
import { useState } from 'react'
import axios from 'axios'
import { FieldValues, useForm } from 'react-hook-form'
import { useMutation } from 'react-query'
import ErrorAlert from '../../components/ErrorAlert'
import useAccessToken from '../../hooks/useAccessToken'
import { POKTPOOL_API_URL } from '../../hooks/useApi'

export default function DisableTwoFactorAuthModal({
  open = false,
  onClose = () => {},
}) {
  const [is2faSuccessfullyDisabled, setIs2faSuccessfullyDisabled] =
    useState(false)
  const [error, setError] = useState<any>({})
  const [disable2faValueType, setDisable2faValueType] =
    useState('twoFactorCode')
  const { handleSubmit, register } = useForm()
  const accessToken = useAccessToken()

  const { mutate: disable2fa } = useMutation<any, any, { code: string }>(
    ({ code }) =>
      axios
        .post(
          '2fa/disable-qr',
          { [disable2faValueType]: code },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        )
        .then(async (res) => {
          if (res.status < 400 && res.status >= 200) {
            setIs2faSuccessfullyDisabled(true)
          } else {
            const data = await res.data
            if (data.error) setError(data)
          }
        })
  )

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
          Disable Two-Factor Authentication
        </h1>
        {is2faSuccessfullyDisabled ? (
          <div>
            <p>Two-factor authentication successfully disabled!</p>
            <Button onClick={() => onClose()}>Close</Button>
          </div>
        ) : (
          <div>
            {error && <ErrorAlert error={error} />}
            <p id="modal-modal-description">
              Provide your two-factor code or your backup code to disable
              two-factor authentication.
            </p>
            <div className="text-center">
              <form
                className="inline-flex flex-col gap-4"
                onSubmit={handleSubmit(({ code }: FieldValues) => {
                  disable2fa({ code })
                })}
              >
                <ToggleButtonGroup
                  color="primary"
                  value={disable2faValueType}
                  exclusive
                  onChange={(event, value) => setDisable2faValueType(value)}
                >
                  <ToggleButton value="twoFactorCode">2FA Code</ToggleButton>
                  <ToggleButton value="backupCode">Backup Code</ToggleButton>
                </ToggleButtonGroup>
                <div className="flex gap-4">
                  <TextField
                    id="outlined-basic"
                    label="Code"
                    variant="outlined"
                    inputProps={{
                      pattern: '[0-9A-Za-z]*',
                      maxLength: 6,
                    }}
                    {...register('code', {
                      required: true,
                      minLength: 6,
                      maxLength: 6,
                    })}
                  />
                  <Button type="submit" variant="contained">
                    Disable 2FA
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

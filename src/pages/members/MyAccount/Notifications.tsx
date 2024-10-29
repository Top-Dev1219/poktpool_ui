import { useEffect, useState } from 'react'
import { useQuery, useMutation } from 'react-query'
import { FieldValues, useForm } from 'react-hook-form'
import {
  Alert,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  Skeleton,
} from '@mui/material'
import axios from 'axios'
import useAccessToken from '../../../../hooks/useAccessToken'

enum NotificationTypes {
  administrative = 7,
  marketing = 9,
  wallet_verified = 1,
  stake_status = 2,
  unstake_sent = 3,
  sweeps_sent = 4,
  transfer_received = 5,
}

// const NotificationTypes = {
//   administrative : [7, 8],
//   marketing : [9, 10],
//   wallet_verified : 1,
//   stake_status : 2,
//   unstake_sent : 3,
//   sweeps_sent : 4,
//   transfer_received : 5,
// }

export const Notifications = () => {
  const accessToken = useAccessToken()
  const { register, handleSubmit } = useForm()
  const [updateSuccess, setUpdateSuccess] = useState(false)
  const [hasPatchError, setHasPatchError] = useState(false)
  const [patchError, setPatchError] = useState<string[]>([])
  const [defaultChecked, setDefaultChecked] = useState<number[]>([])

  const {
    data: notificationSettings,
    refetch,
    isLoading,
  } = useQuery(
    'user/notification-settings',
    () =>
      axios
        .get(`user/notification-settings`, {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        })
        .then((res) => res.data),
    { enabled: !!accessToken }
  )

  const { mutate: updatePreferences } = useMutation(
    ({ payload }: { payload: number[] }) =>
      axios.put(
        `user/notification-settings`,
        { contact_type_ids: payload },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      ),
    {
      onSuccess: async (res) => {
        const data = await res.data
        setUpdateSuccess(true)
        refetch()
      },
      onError: (error: any) => {
        setHasPatchError(true)
        setPatchError([error.response.data.message])
      },
    }
  )

  const onSubmit = (data: FieldValues) => {
    let keyArrays: number[] = []
    if (data.select_all) {
      keyArrays = Object.keys(data)
        .filter((item) => item !== 'select_all')
        .map((item: any) => Number(NotificationTypes[item]))
    } else {
      keyArrays = Object.keys(data)
        .filter((item) => data[item] && item !== 'select_all')
        .map((item: any) => Number(NotificationTypes[item]))
    }

    updatePreferences({ payload: defaultChecked })
  }

  useEffect(() => {
    if (notificationSettings) {
      const ids = notificationSettings.map((item: any) => item.contact_type_id)
      setDefaultChecked(ids)
    }
  }, [notificationSettings])

  const handleCheckEvent = (id: number) => {
    return setDefaultChecked(
      defaultChecked.includes(id)
        ? defaultChecked.filter((item) => item !== id)
        : [id, ...defaultChecked]
    )
  }

  const selectAll = () => {
    if (
      defaultChecked.filter((item) => [1, 2, 3, 4, 5].includes(item)).length ===
      5
    ) {
      setDefaultChecked(
        defaultChecked.filter((item) => ![1, 2, 3, 4, 5].includes(item))
      )
    } else {
      setDefaultChecked([
        ...[1, 2, 3, 4, 5].reduce(
          (a: number[], b: number) =>
            defaultChecked.includes(b) ? a : [b, ...a],
          []
        ),
        ...defaultChecked,
      ])
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mt-8">
        <h2>Notification Settings</h2>
      </div>

      {updateSuccess && (
        <div className="max-w-4xl my-4 mx-auto">
          <Alert severity="success" onClose={() => setUpdateSuccess(false)}>
            Your notification preferences have been been updated successfully!
          </Alert>
        </div>
      )}

      <Alert
        severity="info"
        className="rounded-md info-alert-style text-brand-blue-dark my-8"
      >
        We recommend that you do not unsubscribe from administrative emails to
        stay informed of important changes that may affect you
      </Alert>

      {isLoading ? (
        <>
          <Skeleton variant="text" height="46px" />
          <Skeleton variant="text" height="46px" />
          <div className="w-full border border-[#d3d3d3] border-solid border-r-0 border-l-0 border-t-0 my-4"></div>
          <Skeleton variant="text" height="46px" />
          <Skeleton variant="text" height="46px" />
          <Skeleton variant="text" height="46px" />
          <Skeleton variant="text" height="46px" />
          <Skeleton variant="text" height="46px" />
          <Skeleton variant="text" height="46px" />
          <Skeleton variant="text" height="46px" />
          <Skeleton variant="text" height="60px" width="140px" />
        </>
      ) : (
        <>
          <div>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox disabled checked={defaultChecked.includes(7)} />
                }
                label="Administrative - Company Announcements, Changes in TOS, etc."
                className="mb-2"
                onChange={() => handleCheckEvent(7)}
              />
              <FormControlLabel
                control={<Checkbox checked={defaultChecked.includes(9)} />}
                label="Marketing - Newsletters, New Blog Content, Promotional Offers, etc. "
                className="mb-2"
                onChange={() => handleCheckEvent(9)}
              />
              <FormControlLabel
                control={<Checkbox checked={defaultChecked.includes(13)} />}
                label="Monthly Statement Notifications"
                onChange={() => handleCheckEvent(13)}
              />
            </FormGroup>
          </div>

          <div className="w-full border border-[#d3d3d3] border-solid border-r-0 border-l-0 border-t-0 my-4"></div>

          <div>
            <p>
              Transactional - Select which transactions you would like to be
              notified of below.{' '}
            </p>
            <FormGroup>
              <FormControlLabel
                control={<Checkbox checked={defaultChecked.includes(1)} />}
                label="Wallet verified"
                className="mb-2"
                onChange={() => handleCheckEvent(1)}
              />
              <FormControlLabel
                control={<Checkbox checked={defaultChecked.includes(2)} />}
                label="Stake status"
                className="mb-2"
                onChange={() => handleCheckEvent(2)}
              />
              <FormControlLabel
                control={<Checkbox checked={defaultChecked.includes(3)} />}
                label="Unstakes sent"
                className="mb-2"
                onChange={() => handleCheckEvent(3)}
              />
              <FormControlLabel
                control={<Checkbox checked={defaultChecked.includes(4)} />}
                label="Sweeps sent"
                className="mb-2"
                onChange={() => handleCheckEvent(4)}
              />
              <FormControlLabel
                control={<Checkbox checked={defaultChecked.includes(5)} />}
                label="Transfer received"
                className="mb-2"
                onChange={() => handleCheckEvent(5)}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={
                      defaultChecked.filter((item) =>
                        [1, 2, 3, 4, 5].includes(item)
                      ).length === 5
                    }
                  />
                }
                label="Select all"
                className="mb-2"
                onChange={selectAll}
              />
            </FormGroup>
          </div>

          <Button
            variant="contained"
            className="mt-4"
            onClick={() => {
              updatePreferences({ payload: defaultChecked })
            }}
          >
            Save Preferences
          </Button>
        </>
      )}
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Grid, TextField, InputAdornment, Button, Alert } from '@mui/material'
import TwitterIcon from '@mui/icons-material/Twitter'
import TelegramIcon from '@mui/icons-material/Telegram'
import 'react-phone-number-input/style.css'
import PhoneInput from 'react-phone-number-input'
import PhoneIcon from '@mui/icons-material/Phone'
import { useQuery, useMutation } from 'react-query'
import axios from 'axios'
import { sanitize } from 'dompurify'
import useAccessToken from '../../../../../hooks/useAccessToken'
import { DiscordIcon } from '../../../../../components/DiscordIcon'

export const ContactInfo = () => {
  const accessToken = useAccessToken()
  const [addContactSuccess, setAddContactSuccess] = useState(false)
  const [hasContact, setHasContact] = useState(false)
  const [buttonText, setButtonText] = useState('Add Contact')
  const {
    data: contactData,
    isLoading,
    refetch,
  } = useQuery(
    'profile/contact-info',
    () =>
      axios
        .get('profile/contact-info', {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        })
        .then((res) => {
          const data = res.data
          setAddContactSuccess(true)
          setHasContact(checkHasContact(data))
          return data
        }),
    { enabled: !!accessToken }
  )

  const checkHasContact = (contacts: any) => {
    if (
      contacts.discord ||
      contacts.telegram ||
      contacts.twitter ||
      contacts.phone
    ) {
      setButtonText('Edit Contact')
      return true
    }
    setButtonText('Add Contact')
    return false
  }

  const [contactInfo, setContactInfo] = useState<any>({
    discord: '',
    twitter: '',
    telegram: '',
    phone: '',
  })

  const handleChange = (id: string, value: string) => {
    setContactInfo({ ...contactInfo, [id]: value })
  }

  const handleChangeContact = () => {
    if (hasContact) {
      setHasContact(false)
      setButtonText('Update Contact')
    } else {
      submitContact(contactInfo)
    }
  }

  const { mutate: submitContact } = useMutation(
    (contactInfo: any) =>
      axios.put('profile/contact-info', contactInfo, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }),
    {
      onSuccess: async (res) => {
        const data = await res.data

        refetch()
      },
    }
  )

  useEffect(() => {
    setContactInfo({
      discord: sanitize(contactData?.discord),
      twitter: sanitize(contactData?.twitter),
      telegram: sanitize(contactData?.telegram),
      phone: sanitize(contactData?.phone),
    })
  }, [contactData])

  return (
    <>
      <h2>Contact Information</h2>
      <section className="mt-4 mb-8">
        <Alert
          severity="info"
          className="rounded-md info-alert-style text-brand-blue-dark "
        >
          Any additional contact details provided are optional. These are used
          to communicate with you from member support as well as in marketing
          and promotional opportunities. By providing this information, you are
          opting in to be contacted on these platforms.
        </Alert>
      </section>
      <Grid container spacing={4}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Discord handle"
            fullWidth
            disabled={hasContact}
            value={contactInfo.discord}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <DiscordIcon fillColor="#757575" />
                </InputAdornment>
              ),
            }}
            onChange={(e) => handleChange('discord', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Twitter"
            fullWidth
            disabled={hasContact}
            value={contactInfo.twitter}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <TwitterIcon />
                </InputAdornment>
              ),
            }}
            onChange={(e) => handleChange('twitter', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Telegram"
            fullWidth
            disabled={hasContact}
            value={contactInfo.telegram}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <TelegramIcon />
                </InputAdornment>
              ),
            }}
            onChange={(e) => handleChange('telegram', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <PhoneInput
            placeHolder="Enter your phone number."
            defaultCountry="US"
            value={contactInfo.phone}
            disabled={hasContact}
            onChange={(value: string) => handleChange('phone', value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Button
            variant="contained"
            size="large"
            onClick={handleChangeContact}
          >
            {buttonText}
          </Button>
        </Grid>
      </Grid>
    </>
  )
}

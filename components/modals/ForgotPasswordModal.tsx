import { useState } from 'react'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from '@mui/material'
import axios from 'axios'
import { sanitize } from 'dompurify'
import { FieldValues, useForm } from 'react-hook-form'

export default function ForgotPasswordModal({
  open = false,
  onClose = () => {},
}) {
  const { handleSubmit, register, watch, reset } = useForm()
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleClose = () => {
    reset()
    onClose()
  }

  const onSubmit = ({ email }: FieldValues) => {
    axios
      .post(
        'auth/forgot-password',
        { email: sanitize(email) },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
      .then(() => {
        setIsSubmitted(true)
      })
  }

  return (
    <Dialog open={open} onClose={handleClose}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>Forgot Password</DialogTitle>
        {isSubmitted ? (
          <DialogContent>
            <DialogContentText>
              Password reset request submitted. If the email address entered is
              correct, you will receive an email shortly with a reset link.
            </DialogContentText>
          </DialogContent>
        ) : (
          <>
            <DialogContent>
              <DialogContentText>
                A reset password link will be sent to the email address you
                provide.
              </DialogContentText>
              <div className="pt-4">
                <TextField
                  fullWidth
                  label="Email"
                  type="text"
                  {...register('email', { required: true })}
                />
              </div>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Cancel</Button>
              <Button
                type="submit"
                disabled={watch('email') === ''}
                variant="contained"
              >
                Reset
              </Button>
            </DialogActions>
          </>
        )}
      </form>
    </Dialog>
  )
}

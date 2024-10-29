import { Alert, AlertTitle, Stack } from '@mui/material'

export default function ErrorAlert({
  error,
  onDismiss,
}: {
  error: {
    error: string
    message: string | string[]
  }
  onDismiss?: () => void
}) {
  return error?.error ? (
    <Stack className="mb-8">
      <Alert onClose={onDismiss} severity="error">
        <AlertTitle>{error?.error}</AlertTitle>
        {typeof error.message === 'string' && <div>{error.message}</div>}
        {Array.isArray(error.message) && (
          <ul className="pl-4 my-0">
            {error.message?.map((message, i) => (
              <li key={i} className="list-disc">
                {message}
              </li>
            ))}
          </ul>
        )}
      </Alert>
    </Stack>
  ) : (
    <></>
  )
}

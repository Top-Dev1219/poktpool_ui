import { parseISO } from 'date-fns'

const adjustForUTCOffset = (date: Date) => {
  return new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds()
  )
}

export const formatUTCDate = (dateString: string) => {
  const date = parseISO(dateString)
  const dateWithOffset = adjustForUTCOffset(date)
  return dateWithOffset
}

import axios, { Method } from 'axios'
import { useSession } from 'next-auth/react'
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
} from 'react-query'
import useAccessToken from './useAccessToken'

export const POKTPOOL_API_URL = process.env.POKTPOOL_API_URL

export const callApi = (
  endpoint: string,
  method: Method,
  data?: object,
  session?: any,
  headers?: any
) =>
  axios({
    method: method,
    url: `${POKTPOOL_API_URL}${endpoint}`,
    data,
    headers: {
      ...(session?.accessToken && {
        Authorization: `Bearer ${session?.accessToken}`,
      }),
      ...headers,
    },
  })

export default function useApi(
  endpoint: string,
  headers?: Record<string, any>
) {
  const { data: session, status } = useSession()

  const url = endpoint[0] !== '/' ? `/${endpoint}` : endpoint

  return {
    get: (data?: object) => callApi(url, 'GET', data, session, headers),
    post: (data?: object) => callApi(url, 'POST', data, session, headers),
    session,
    status,
  } as any
}

export function useAuthQuery(
  endpoint: string,
  requestInit?: any,
  options?: UseQueryOptions | any
) {
  const accessToken = useAccessToken()

  const results = useQuery(
    endpoint,
    () =>
      axios
        .get(`${endpoint[0] !== '/' ? `/${endpoint}` : endpoint}`, {
          ...requestInit,
          headers: {
            ...requestInit?.headers,
            authorization: `Bearer ${accessToken}`,
          },
        })
        .then((res) => res.data),
    {
      ...(options ? options : {}),
      enabled:
        !!accessToken &&
        (typeof options?.enabled !== 'undefined' ? !!options.enabled : true),
    }
  )

  return results
}

export function useAuthMutation(
  endpoint: string,
  requestInit?: RequestInit,
  options?: UseMutationOptions
): any {
  const accessToken = useAccessToken()
  const results = useMutation(
    endpoint,
    (data: any) =>
      fetch(
        `${POKTPOOL_API_URL}${endpoint[0] !== '/' ? `/${endpoint}` : endpoint}`,
        {
          ...requestInit,
          method: requestInit?.method || 'POST',
          headers: {
            ...requestInit?.headers,
            authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      ).then((res) => res.json()),
    options
  )

  return results
}

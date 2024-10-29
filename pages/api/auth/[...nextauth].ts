import axios from 'axios'
import NextAuth, { SessionStrategy } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import DiscordProvider from 'next-auth/providers/discord'
import { callApi, POKTPOOL_API_URL } from '../../../hooks/useApi'

const refreshAccessToken = async (refreshToken: string) => {
  const { data } = await callApi('/auth/refresh-token', 'POST', {
    refreshToken,
  })

  return data
}

export default NextAuth({
  providers: [
    CredentialsProvider({
      id: 'username-login',
      name: 'Username',
      async authorize(credentials, req) {
        try {
          const { data } = await callApi(
            '/auth/signin-recaptcha',
            'POST',
            {
              username: credentials?.username,
              password: credentials?.password,
            },
            {},
            { recaptcha: credentials?.recaptcha }
          )

          if (data?.isTwoFactorEnabled) {
            console.log('isTwoFactorEnabled')
          }

          return data
        } catch (error) {
          console.log(credentials, error)
          return error
        }
      },
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
        recaptcha: { label: 'Recaptcha', type: 'text' },
      },
    }),
    CredentialsProvider({
      id: '2fa-username-login',
      name: 'Username',
      async authorize(credentials, req) {
        try {
          const signInRes = await callApi(
            '/auth/signin-recaptcha',
            'POST',
            {
              username: credentials?.username,
              password: credentials?.password,
              twoFactorCode: credentials?.twoFactorCode,
            },
            {},
            { recaptcha: credentials?.recaptcha }
          )

          return signInRes.data
        } catch (error) {
          console.error(error)
        }
      },
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
        twoFactorCode: { label: 'twoFactorCode', type: 'text' },
        recaptcha: { label: 'Recaptcha', type: 'text' },
      },
    }),
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, token, user }: any): Promise<any> {
      session.user = token.user?.poktPoolUser
      session.permissions = token.user?.permissions
      session.accessToken = token.accessToken
      session.isTwoFactorEnabled = token.user?.isTwoFactorEnabled
      return session
    },
    async signIn({ user, account, profile, email, credentials }: any) {
      if (!user?.accessToken) {
        const message = user?.response?.data.message

        return `/login?callbackUrl=manage/dashboard&errorMsg=${
          Array.isArray(message) ? message.join(';') : message
        }`
      }

      if (user.accessToken && user?.isTwoFactorEnabled) {
        return await callApi('/user', 'GET')
          .then(() => true)
          .catch(() => `/login?callbackUrl=manage/dashboard&error=2faEnabled`)
      }

      return true
    },
    async jwt({ token, user, account, profile, isNewUser }: any) {
      if (account && user) {
        return {
          user,
          accessToken: user.accessToken,
          accessTokenExpires: Date.now() + 3600,
          refreshToken: user.refreshToken,
        }
      }

      // Return previous token if the access token has not expired yet
      if (Date.now() < token?.accessTokenExpires) {
        return token
      }

      // Access token has expired, try to update it
      const result = await refreshAccessToken(token?.refreshToken)

      return {
        ...token,
        ...result,
      }
    },
  },
  jwt: {
    maxAge: 60 * 29,
  },
  secret: process.env.SECRET!,
  debug: true,
  pages: {
    signIn: '/login',
    error: '/login',
  },
})

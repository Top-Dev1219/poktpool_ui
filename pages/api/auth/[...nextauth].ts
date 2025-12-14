import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import DiscordProvider from 'next-auth/providers/discord'
import { callApi } from '../../../hooks/useApi'
import { AUTH_CONFIG } from '../../../src/constants'

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

          return data
        } catch (error) {
          console.error('Authentication error:', error)
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
          console.error('2FA authentication error:', error)
          return null
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
          accessTokenExpires: Date.now() + AUTH_CONFIG.ACCESS_TOKEN_EXPIRES_IN,
          refreshToken: user.refreshToken,
        }
      }

      // Return previous token if the access token has not expired yet
      if (Date.now() < token?.accessTokenExpires) {
        return token
      }

      // Access token has expired, try to update it
      try {
        const result = await refreshAccessToken(token?.refreshToken)
        return {
          ...token,
          ...result,
        }
      } catch (error) {
        console.error('Token refresh error:', error)
        return token
      }
    },
  },
  jwt: {
    maxAge: AUTH_CONFIG.JWT_MAX_AGE,
  },
  secret: process.env.SECRET!,
  debug: true,
  pages: {
    signIn: '/login',
    error: '/login',
  },
})

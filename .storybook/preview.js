import { ThemeProvider } from '@mui/material'
import CssBaseline from '@mui/material/CssBaseline'
import * as NextImage from 'next/image'
import '../styles/globals.css'
import { theme } from '../src/theme'

const OriginalNextImage = NextImage.default

/* Necessary for Next's <Image /> to work. */
Object.defineProperty(NextImage, 'default', {
  configurable: true,
  value: (props) => <OriginalNextImage {...props} unoptimized />,
})

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
}

export const decorators = [
  (Story) => {
    return (
      <ThemeProvider theme={theme}>
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="true"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,300;0,400;0,700;1,300&display=swap"
            rel="stylesheet"
          />
        </head>
        <CssBaseline />
        <Story />
      </ThemeProvider>
    )
  },
]

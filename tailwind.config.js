module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,mdx,tsx}',
  ],
  theme: {
    fontFamily: {
      sans: ['Montserrat', 'sans-serif'],
    },
    extend: {
      typography: {
        DEFAULT: {
          css: {
            a: {
              color: null,
              backgroundColor: null,
              backgroundImage: null,
            },
            button: {
              color: null,
              backgroundColor: null,
              backgroundImage: null,
            },
            '[type="button"]': {
              color: null,
              backgroundColor: null,
              backgroundImage: null,
            },
          },
        },
      },
      colors: {
        'brand-blue': {
          dark: '#0366ff',
          light: '#09d7fe',
        },
        'brand-halloween': {
          dark: '#F46629',
          light: '#FE9947',
        },
        'brand-yellow': '#FFD100',
        'brand-orange': '#FF7800',
        'brand-light-grey': '#808080',
        'white-50': '#FFFFFF80',
        'carousel-bg': '#D9D9D9',
      },
      boxShadow: {
        'custom-sm': '0px 4px 4px rgba(0, 0, 0, 0.25)',
        'custom-lg': '0px 9px 26px 1px rgba(0, 0, 0, 0.14)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}

module.exports = {
  mode: 'jit',
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './layouts/**/*.{js,ts,jsx,tsx}',
    './node_modules/@sk-web-gui/*/dist/**/*.js',
  ],
  safelist: [
    {
      pattern: /(bg|text|border)-(info|warning|error|neutral)/,
    },
  ],
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    /* screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
    },*/
    backgroundImage: {
      main: "url('./public/main-bg.png')",
    },
    screens: {
      xs: '375px',

      sm: '640px',
      // => @media (min-width: 640px) { ... }

      md: '768px',
      // => @media (min-width: 768px) { ... }

      lg: '1024px',
      // => @media (min-width: 1024px) { ... }

      xl: '1280px',
      // => @media (min-width: 1280px) { ... }

      //'2xl': '1536px',
      // => @media (min-width: 1536px) { ... }
    },
  },
  plugins: [
    //require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('@sk-web-gui/core')({
      colors: [],
      cssBase: true,
    }),
  ],
};

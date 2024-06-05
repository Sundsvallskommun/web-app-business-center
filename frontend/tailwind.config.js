module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/layouts/**/*.{js,ts,jsx,tsx}',
    './src/utils/**/*.{js,ts,jsx,tsx}',
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
    screens: {
      xxs: '320px',

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
    extend: {
      maxWidth: {
        content: '128rem', // default in core is based on screens
        'main-content': '106.2rem',
      },
      backgroundImage: {
        'hero-logo': "url('/svg/S_logo.svg')",
      },
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  presets: [require('@sk-web-gui/core').preset()],
};

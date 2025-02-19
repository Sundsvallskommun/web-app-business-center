import { preset } from '@sk-web-gui/core';

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
  darkMode: 'selector', // or 'media' or 'class'
  theme: {
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
  presets: [preset()],
};

import { preset } from '@sk-web-gui/core';

module.exports = {
  content: [
    './src/app/**/*.tsx',
    './src/components/**/*.tsx',
    './src/layouts/**/*.tsx',
    './src/utils/**/*.tsx',
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

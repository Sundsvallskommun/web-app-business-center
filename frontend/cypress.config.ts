import { defineConfig } from 'cypress';
import codeCoverage from '@cypress/code-coverage/task';

export default defineConfig({
  env: {
    apiUrl: 'http://localhost:3001',
  },

  e2e: {
    setupNodeEvents(on, config) {
      codeCoverage(on, config);

      return config;
    },
    baseUrl: 'http://localhost:3000',
    video: false,
    screenshotOnRunFailure: false,
    chromeWebSecurity: false,
    defaultCommandTimeout: 10000,
  },
});

const { defineConfig } = require('cypress');

module.exports = defineConfig({
  projectId: '43gftm',
  viewportWidth: 1280,
  viewportHeight: 960,
  defaultCommandTimeout: 20000,
  e2e: {
    baseUrl: 'http://localhost:4200',
    env: {
      apiUrl: 'https://mzima-api.staging.ush.zone',
    },
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
  video: true,
  videoUploadOnPasses: false,
});

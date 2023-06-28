const { defineConfig } = require("cypress");

module.exports = defineConfig({
  projectId: "bsiz1z",
  viewportWidth: 1280,
  viewportHeight: 960,
  defaultCommandTimeout: 20000,
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
  video: true,
});

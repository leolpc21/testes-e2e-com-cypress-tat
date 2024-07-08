const { defineConfig } = require('cypress')

module.exports = defineConfig({
  projectId: 'taycfc',
  e2e: {
    baseUrl: 'https://notes-serverless-app.com',
    defaultCommandTimeout : 10000,
    requestTimeout: 10000,
    chromeWebSecurity: false,
    env: {
      viewportWidthBreakpoint: 768,
    },
    setupNodeEvents() {
      // implement node event listeners here
    },
  },
})

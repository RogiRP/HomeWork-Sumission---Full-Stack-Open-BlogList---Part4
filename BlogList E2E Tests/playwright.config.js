const { defineConfig } = require('@playwright/test')

module.exports = defineConfig({
  timeout: 10000,
  use: {
    baseURL: 'http://localhost:5173',
    storageState: { cookies: [], origins: [] }
  }
})
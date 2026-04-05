import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  timeout: 30_000,
  reporter: 'list',
  passWithNoTests: true,
  use: {
    trace: 'on-first-retry',
  },
})

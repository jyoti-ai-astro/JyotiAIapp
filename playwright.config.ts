import { defineConfig, devices } from '@playwright/test'

const baseURL =
  process.env.PLAYWRIGHT_BASE_URL ||
  'http://127.0.0.1:3000'

const isRemotePreview = Boolean(process.env.PLAYWRIGHT_BASE_URL)
const vercelTrustedOidcToken =
  process.env.VERCEL_TRUSTED_OIDC_TOKEN

if (isRemotePreview && !vercelTrustedOidcToken) {
  throw new Error(
    'VERCEL_TRUSTED_OIDC_TOKEN is required for remote Preview tests',
  )
}

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: [
    ['list'],
    ['html', {
      outputFolder: 'playwright-report',
      open: 'never',
    }],
  ],

  timeout: 30000,

  expect: {
    timeout: 10000,
  },

  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    extraHTTPHeaders:
      isRemotePreview && vercelTrustedOidcToken
        ? {
            'x-vercel-trusted-oidc-idp-token': vercelTrustedOidcToken,
          }
        : undefined,
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],

  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: 'npm run dev -- --hostname 127.0.0.1',
        url: 'http://127.0.0.1:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
      },
})

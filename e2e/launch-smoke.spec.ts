import { expect, test } from '@playwright/test'

const publicPages = [
  '/',
  '/login',
  '/signup',
  '/pricing',
  '/legal/privacy',
  '/legal/terms',
  '/legal/security',
]

for (const path of publicPages) {
  test(`public page responds: ${path}`, async ({ page }) => {
    const response = await page.goto(path, {
      waitUntil: 'domcontentloaded',
    })

    expect(response).not.toBeNull()
    expect(response?.status()).toBeLessThan(500)
    await expect(page.locator('body')).toBeVisible()
  })
}

test('worker GET cannot execute worker', async ({ request }) => {
  const response =
    await request.get('/api/workers/process-queue')

  expect(response.status()).toBe(405)
})

test('worker POST without key cannot execute worker', async ({ request }) => {
  const response =
    await request.post('/api/workers/process-queue')

  const status = response.status()

  if (process.env.PLAYWRIGHT_BASE_URL) {
    expect(status).toBe(401)
    return
  }

  expect([401, 503]).toContain(status)
})

test('admin API rejects unauthenticated request', async ({ request }) => {
  const response =
    await request.get('/api/admin/mission/health')

  expect(response.status()).toBe(401)
})

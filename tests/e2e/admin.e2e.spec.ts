import { test, expect, Page } from '@playwright/test'
import { login } from '../helpers/login'
import { seedTestUser, cleanupTestUser, testUser } from '../helpers/seedUser'

test.describe('Admin Panel', () => {
  let page: Page

  test.beforeAll(async ({ browser }, testInfo) => {
    await seedTestUser()

    const context = await browser.newContext()
    page = await context.newPage()

    await login({ page, user: testUser })
  })

  test.afterAll(async () => {
    await cleanupTestUser()
  })

  test('can navigate to dashboard', async () => {
    await page.goto('http://localhost:3000/admin')
    await expect(page).toHaveURL('http://localhost:3000/admin')
    const dashboardArtifact = page.locator('span[title="Dashboard"]').first()
    await expect(dashboardArtifact).toBeVisible()
  })

  test('can navigate to list view', async () => {
    await page.goto('http://localhost:3000/admin/collections/users')
    await expect(page).toHaveURL('http://localhost:3000/admin/collections/users')
    const listViewArtifact = page.locator('h1', { hasText: 'Users' }).first()
    await expect(listViewArtifact).toBeVisible()
  })

  test('can navigate to edit view', async () => {
    await page.goto('http://localhost:3000/admin/collections/pages/create')
    await expect(page).toHaveURL(/\/admin\/collections\/pages\/[a-zA-Z0-9-_]+/)
    const editViewArtifact = page.locator('input[name="title"]')
    await expect(editViewArtifact).toBeVisible()
  })
})

test.describe('Signed in cookie', () => {
  test.beforeAll(async () => {
    await seedTestUser()
  })

  test.afterAll(async () => {
    await cleanupTestUser()
  })

  const signedInCookie = async (page: Page) =>
    (await page.context().cookies()).find((cookie) => cookie.name === 'payload-signed-in')

  test('login sets it and logout expires it', async ({ page }) => {
    await login({ page, user: testUser })

    expect(await signedInCookie(page)).toMatchObject({
      httpOnly: false,
      path: '/',
      sameSite: 'Lax',
      value: '1',
    })

    await page.goto('http://localhost:3000/admin/logout')
    await page.waitForURL(/\/admin\/login/)

    expect(await signedInCookie(page)).toBeUndefined()
  })

  test('shows the admin bar once signed in', async ({ page }) => {
    await login({ page, user: testUser })

    const meRequest = page.waitForRequest(
      (request) => new URL(request.url()).pathname === '/api/users/me',
    )
    await page.goto('http://localhost:3000')
    await meRequest

    await expect(page.locator('.admin-bar')).toBeVisible()
  })
})

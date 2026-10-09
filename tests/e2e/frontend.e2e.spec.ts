import { test, expect, Page } from '@playwright/test'

test.describe('Frontend', () => {
  let page: Page

  test.beforeAll(async ({ browser }, testInfo) => {
    const context = await browser.newContext()
    page = await context.newPage()
  })

  test('can load homepage', async ({ page }) => {
    await page.goto('http://localhost:3000')
    await expect(page).toHaveTitle(/Léo Di Marco/)
    const heading = page.locator('h1').first()
    // The starter home page, or the site name while the site has not been seeded yet
    await expect(heading).toHaveText(/^(Tricopigmentation à\sNancy\.|Léo Di Marco)$/)
  })
})

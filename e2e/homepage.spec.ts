import { expect, test } from '@playwright/test'

// GitHub OAuth cannot run in CI, so the server session is stubbed at the network layer.
const mockAuthenticatedSession = async (page) => {
  await page.route('**/api/user/me', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ login: 'octocat' }),
    }),
  )
}

const getBoxes = async (cards) =>
  Promise.all((await cards.all()).map(async (card) => card.boundingBox()))

test('homepage_DesktopViewport_ShowsTwoByTwoGrid', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await mockAuthenticatedSession(page)

  await page.goto('/')

  const cards = page.locator('.MuiCard-root')
  await expect(cards).toHaveCount(4)
  for (const card of await cards.all()) {
    await expect(card.locator('svg[role="img"]')).toBeVisible()
  }

  const boxes = await getBoxes(cards)
  expect(new Set(boxes.map((b) => Math.round(b.y))).size).toBe(2)
  expect(new Set(boxes.map((b) => Math.round(b.x))).size).toBe(2)
})

test('homepage_MobileViewport_StacksCardsInOneColumn', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 })
  await mockAuthenticatedSession(page)

  await page.goto('/')

  const cards = page.locator('.MuiCard-root')
  await expect(cards).toHaveCount(4)

  const boxes = await getBoxes(cards)
  expect(new Set(boxes.map((b) => Math.round(b.x))).size).toBe(1)
  for (let i = 1; i < boxes.length; i++) {
    expect(boxes[i].y).toBeGreaterThan(boxes[i - 1].y)
  }

  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }))
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth)
})

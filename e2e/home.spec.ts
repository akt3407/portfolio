import { expect, test } from '@playwright/test'

test('トップページが表示される', async ({ page }) => {
  await page.goto('/')

  await expect(page.locator('main')).toBeVisible()
})

test('WorkNav の作品名をクリックすると、その作品に切り替わる', async ({ page }) => {
  await page.goto('/')

  const images = page.locator('main article img:not([alt=""])')
  const second = page.getByRole('navigation', { name: 'Works' }).getByRole('button').nth(1)

  await second.click()

  await expect(second).toHaveAttribute('aria-current', 'true')
  await expect(images.nth(1)).not.toHaveAttribute('inert')
  await expect(images.nth(0)).toHaveAttribute('inert')
  await expect(page.getByRole('heading', { level: 2 })).toHaveText((await second.textContent())!)
})

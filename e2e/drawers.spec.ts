import { expect, test } from '@playwright/test'

// Every overlay must close itself - and only itself. A copy-pasted onClose
// handler once made the wishlist drawer impossible to dismiss.

test.beforeEach(async ({ page }) => {
	await page.goto('./?lang=en')
	// Dismiss the gender gate so the header and its drawers are reachable.
	const gateCta = page.getByRole('button', { name: /explore full collection/i })
	if (await gateCta.isVisible().catch(() => false)) await gateCta.click()
})

test('wishlist drawer closes via its close button', async ({ page }) => {
	await page.getByRole('button', { name: /wishlist/i }).first().click()
	const drawer = page.getByRole('dialog').filter({ hasText: /wishlist/i })
	await expect(drawer).toBeVisible()
	await drawer.getByRole('button', { name: /close/i }).click()
	await expect(drawer).toBeHidden()
})

test('wishlist drawer closes via Escape', async ({ page }) => {
	await page.getByRole('button', { name: /wishlist/i }).first().click()
	const drawer = page.getByRole('dialog').filter({ hasText: /wishlist/i })
	await expect(drawer).toBeVisible()
	await page.keyboard.press('Escape')
	await expect(drawer).toBeHidden()
})

test('cart drawer closes via its close button', async ({ page }) => {
	await page.getByRole('button', { name: /cart|bag/i }).first().click()
	const drawer = page.getByRole('dialog').filter({ hasText: /cart|bag/i })
	await expect(drawer).toBeVisible()
	await drawer.getByRole('button', { name: /close/i }).click()
	await expect(drawer).toBeHidden()
})

test('wishlist drawer closes when the backdrop is clicked', async ({ page, isMobile }) => {
	// The panel is `w-full max-w-md`. On a phone `w-full` wins and the drawer
	// covers the viewport, so there is no backdrop to click. That is intended
	// behaviour, not a bug - skip rather than fake a pass.
	test.skip(Boolean(isMobile), 'the drawer is full-width on phones; no backdrop exists')

	await page.getByRole('button', { name: /wishlist/i }).first().click()
	const drawer = page.getByRole('dialog').filter({ hasText: /wishlist/i })
	await expect(drawer).toBeVisible()

	// The drawer is pinned to the inline-end edge, so the far left of an LTR
	// viewport is always backdrop. The backdrop is aria-hidden by design, which
	// is why this is a coordinate click and not a role query.
	await page.mouse.click(20, 300)
	await expect(drawer).toBeHidden()
})

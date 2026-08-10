import { expect, test } from '@playwright/test';

const trigger = /language|langue|اللغة/i;

test.describe('language switching', () => {
  test('defaults to English with the switcher visible on the gate', async ({ page }) => {
    await page.goto('./');
    await expect(page.locator('html')).toHaveAttribute('lang', /^en/);
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
    await expect(page.getByRole('button', { name: trigger }).first()).toBeVisible();
  });

  // REGRESSION TEST FOR DEFECT 1.
  // The trigger and its menu must share a horizontal edge. When the root had
  // two conflicting position utilities they landed in opposite corners, and
  // this assertion is what catches that.
  test('the gate menu opens anchored to its trigger', async ({ page, isMobile }) => {
    await page.goto('./');
    const button = page.getByRole('button', { name: trigger }).first();
    await button.click();

    const menu = page.getByRole('menu').filter({ visible: true }).first();
    await expect(menu).toBeVisible();

    const b = await button.boundingBox();
    const m = await menu.boundingBox();
    expect(b, 'trigger has no box').not.toBeNull();
    expect(m, 'menu has no box').not.toBeNull();

    if (isMobile) {
      // Phone: bottom sheet, full width, docked to the bottom of the viewport.
      const viewport = page.viewportSize()!;
      expect(m!.width).toBeGreaterThan(viewport.width * 0.9);
      expect(m!.y + m!.height).toBeGreaterThan(viewport.height - 4);
    } else {
      // Desktop: dropdown directly below the trigger, edges aligned within 24px.
      expect(m!.y).toBeGreaterThan(b!.y);
      expect(m!.y - (b!.y + b!.height)).toBeLessThan(24);
      const triggerEnd = b!.x + b!.width;
      const menuEnd = m!.x + m!.width;
      expect(Math.min(Math.abs(menuEnd - triggerEnd), Math.abs(m!.x - b!.x))).toBeLessThan(24);
    }
  });

  test('switching to Arabic flips direction and survives a reload', async ({ page }) => {
    await page.goto('./');
    await page.getByRole('button', { name: trigger }).first().click();
    await page.getByRole('menuitemradio', { name: 'العربية' }).click();

    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('html')).toHaveAttribute('lang', /^ar/);

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  });

  test('honours the ?lang override', async ({ page }) => {
    await page.goto('./?lang=fr');
    await expect(page.locator('html')).toHaveAttribute('lang', /^fr/);
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  });

  test('respects the device language on a first visit', async ({ browser }) => {
    const context = await browser.newContext({ locale: 'ar-MA' });
    const page = await context.newPage();
    await page.goto('./');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await context.close();
  });

  test('Arabic does not apply letter-spacing to buttons', async ({ page }) => {
    await page.goto('./?lang=ar');
    const spacing = await page
      .locator('button')
      .first()
      .evaluate((element) => getComputedStyle(element).letterSpacing);
    expect(spacing).toBe('normal');
  });

  test('keeps proper nouns untranslated', async ({ page }) => {
    await page.goto('./?lang=ar');
    await expect(page.getByText('MOMENTO').first()).toBeVisible();
  });

  test('serves the social metadata in the HTML', async ({ page }) => {
    await page.goto('./');
    await expect(page.locator('meta[property="og:image"]').first()).toHaveAttribute(
      'content',
      /og-image\.jpg$/,
    );
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      'content',
      'summary_large_image',
    );
    await expect(page.locator('link[rel="manifest"]')).toHaveCount(1);
  });
});

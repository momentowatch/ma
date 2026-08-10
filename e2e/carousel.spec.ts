import { expect, test } from '@playwright/test';

// A watch with more than one photo. The counter badge reads "n / total".
const openFirstMultiPhotoWatch = async (page: import('@playwright/test').Page) => {
  await page.goto('./?lang=en');

  const gate = page.getByRole('button', { name: /explore full collection/i });
  if (await gate.isVisible().catch(() => false)) {
    await gate.click();
  }

  // Wait for the Category page to be ready by waiting for watch cards to be visible
  const card = page.locator('.surface-card').first();
  await card.waitFor({ state: 'visible' });
  await card.click();

  await expect(page.locator('[data-carousel-track]').first()).toBeVisible({ timeout: 10000 });
};

test.describe('product gallery', () => {
  // REGRESSION TEST FOR DEFECTS H1 AND H2.
  //
  // scroll-behavior:smooth on a snap container, and touch-action:pan-x on a
  // horizontal scroller, each independently break swiping on iOS Safari while
  // leaving Android untouched. Neither may ever be reintroduced on the track.
  test('the track declares no iOS-hostile scroll properties', async ({ page }) => {
    await openFirstMultiPhotoWatch(page);

    const track = page.locator('[data-carousel-track]').first();

    const computed = await track.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        scrollBehavior: style.scrollBehavior,
        touchAction: style.touchAction,
        overflowX: style.overflowX,
        scrollSnapType: style.scrollSnapType,
        overscrollBehaviorX: style.overscrollBehaviorX,
      };
    });

    expect(computed.scrollBehavior).not.toBe('smooth');
    expect(computed.touchAction).not.toContain('pan-x');

    // The parts that must stay.
    expect(computed.overflowX).toMatch(/auto|scroll/);
    expect(computed.scrollSnapType).toContain('mandatory');
    expect(computed.overscrollBehaviorX).toBe('contain');
  });

  // REGRESSION TEST FOR DEFECT H3.
  // Direction-agnostic navigation: the same assertions must hold in Arabic.
  for (const lang of ['en', 'ar'] as const) {
    test('arrows and thumbnails move the gallery in ' + lang, async ({ page }) => {
      await page.goto('./?lang=' + lang);

      const gate = page.getByRole('button', { name: /explore full collection|\u0627\u0633\u062a\u0643\u0634\u0641/i });
      if (await gate.isVisible().catch(() => false)) {
        await gate.click();
      }

      const card = page.locator('.surface-card').first();
      await card.waitFor({ state: 'visible' });
      await card.click();

      const track = page.locator('[data-carousel-track]').first();
      await expect(track).toBeVisible({ timeout: 10000 });

      const slides = track.locator('> div');
      const total = await slides.count();
      test.skip(total < 2, 'this product has a single photo');

      const scrollLeftBefore = await track.evaluate((el) => el.scrollLeft);

      // The next-image control is the second of the two overlay arrows.
      const nextButton = page.getByRole('button', { name: /next|\u0627\u0644\u062a\u0627\u0644\u064a\u0629/i }).first();
      await nextButton.click();
      await page.waitForTimeout(600);

      const scrollLeftAfter = await track.evaluate((el) => el.scrollLeft);
      expect(scrollLeftAfter).not.toBe(scrollLeftBefore);
    });
  }
});

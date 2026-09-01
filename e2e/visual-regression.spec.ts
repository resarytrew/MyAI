import { expect, test, type Page } from '@playwright/test';

async function prepare(page: Page) {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole('button', { name: 'EN' }).click();
}

test('desktop research station visual contract', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await prepare(page);
  await expect(page).toHaveScreenshot('research-station-desktop.png', { animations: 'disabled', fullPage: true });
});

test('mobile research station visual contract', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await prepare(page);
  await expect(page).toHaveScreenshot('research-station-mobile.png', { animations: 'disabled', fullPage: true });
});

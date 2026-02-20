import { test, expect } from '@playwright/test';

test.describe('Editor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should show canvas', async ({ page }) => {
    await expect(page.locator('canvas.pixel-canvas')).toBeVisible();
  });

  test('should show toolbar', async ({ page }) => {
    await expect(page.locator('.toolbar-left')).toBeVisible();
  });

  test('should show tool buttons', async ({ page }) => {
    await expect(page.locator('.tool-btn').first()).toBeVisible();
  });

  test('should show color palette', async ({ page }) => {
    await expect(page.locator('.palette-grid')).toBeVisible();
  });

  test('should show active color preview', async ({ page }) => {
    await expect(page.locator('.active-color-preview')).toBeVisible();
  });

  test('should show canvas size selector', async ({ page }) => {
    await expect(page.locator('.size-select').first()).toBeVisible();
  });
});

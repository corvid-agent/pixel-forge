import { test, expect } from '@playwright/test';

test.describe('App', () => {
  test('should load editor page', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.editor-layout')).toBeVisible();
  });

  test('should show header with logo', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.app-header')).toBeVisible();
    await expect(page.locator('.logo')).toBeVisible();
  });

  test('should show navigation links', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.nav-links')).toBeVisible();
  });
});

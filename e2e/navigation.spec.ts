import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should navigate to gallery', async ({ page }) => {
    await page.goto('/gallery');
    await expect(page.locator('.gallery-container')).toBeVisible();
  });

  test('should navigate back to editor', async ({ page }) => {
    await page.goto('/gallery');
    await page.locator('.logo, a[routerLink="/"]').first().click();
    await expect(page.locator('.editor-layout')).toBeVisible();
  });

  test('should show empty gallery state', async ({ page }) => {
    await page.goto('/gallery');
    await expect(page.locator('.empty-state')).toBeVisible();
  });
});

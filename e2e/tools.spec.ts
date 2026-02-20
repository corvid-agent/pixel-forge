import { test, expect } from '@playwright/test';

test.describe('Tools', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should select color swatch', async ({ page }) => {
    const swatch = page.locator('.swatch').nth(2);
    await swatch.click();
    // Color preview should update
    await expect(page.locator('.active-color-preview')).toBeVisible();
  });

  test('should click tool button', async ({ page }) => {
    const tools = page.locator('.tool-btn');
    const count = await tools.count();
    expect(count).toBeGreaterThan(0);
    await tools.first().click();
  });

  test('should interact with canvas', async ({ page }) => {
    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible();
    const box = await canvas.boundingBox();
    if (box) {
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    }
  });

  test('should change canvas size', async ({ page }) => {
    const select = page.locator('.size-select').first();
    await select.selectOption({ index: 1 });
  });
});

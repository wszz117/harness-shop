// C 类回归：全局搜索（products 域 PROD-S-002）
import { test, expect } from '@playwright/test';

test.describe('搜索', () => {
  test('关键词搜索返回匹配商品', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('search-input').fill('iPhone');
    await page.getByTestId('search-button').click();
    await expect(page).toHaveURL(/\/search\/iPhone/);
    const cards = page.getByTestId('product-card');
    await expect(cards.first()).toBeVisible();
  });
});

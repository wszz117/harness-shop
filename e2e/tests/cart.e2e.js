// C 类回归：加入购物车（orders 域入口）
import { test, expect } from '@playwright/test';

test.describe('购物车', () => {
  test('商品详情页加入购物车后购物车页可见该商品', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('product-card').first().getByRole('link').first().click();
    await expect(page.getByTestId('add-to-cart')).toBeVisible();
    await page.getByTestId('add-to-cart').click();
    await expect(page).toHaveURL(/\/cart/);
    await expect(page.getByTestId('cart-item').first()).toBeVisible();
  });
});

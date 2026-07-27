// C 类回归：首页加载（products 域）
import { test, expect } from '@playwright/test';

test.describe('首页', () => {
  test('加载后展示最新商品标题与商品卡片', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('home-title')).toBeVisible();
    const cards = page.getByTestId('product-card');
    await expect(cards.first()).toBeVisible();
    expect(await cards.count()).toBeGreaterThan(0);
  });

  test('顶部导航含购物车与登录入口', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('nav-cart')).toBeVisible();
    await expect(page.getByTestId('nav-signin')).toBeVisible();
  });
});

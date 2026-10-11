// B 类：exchange-rate-cache-fallback（与 test-report.md 中 B-E2E-01..03 一一对应）
// B-E2E-01 走真实后端；B-E2E-02/03 在浏览器网络层改写 /api/fx/usd-cny 的响应，
// 模拟"后端返回缓存快照""接口失败但本地有快照""汇率完全不可用"三种情况。
// 后端三态本身由 backend/tests/services/fxService.test.js 覆盖。
import { test, expect } from '@playwright/test';
import { saveEvidence } from './_evidence.js';

const FX = '**/api/fx/usd-cny';
const isFx = (r) => r.url().includes('/api/fx/usd-cny');

const usdOf = async (card) => {
  const text = await card.getByTestId('money-display').innerText();
  return Number(text.match(/\$([\d.]+)/)[1]);
};

test.describe('汇率参考价与降级（B 类）', () => {
  test('B-E2E-01 汇率正常：商品卡展示 ≈ ¥ 参考价，无降级横幅 (FX-S-001)', async ({ page }) => {
    const fxResponse = page.waitForResponse(isFx);
    await page.goto('/');
    const res = await fxResponse;
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.state).toBe('available');

    const card = page.getByTestId('product-card').first();
    const usd = await usdOf(card);
    await expect(card.getByTestId('cny-ref')).toHaveText(`≈ ¥${(usd * body.rate).toFixed(2)}`);
    await expect(page.getByTestId('fx-banner')).toHaveCount(0);
    await saveEvidence(page, 'B-E2E-01-fresh-ref-price');
  });

  test('B-E2E-02 后端返回缓存快照：黄色横幅提示，参考价保留 (FX-S-002/004)', async ({ page }) => {
    await page.route(FX, async (route) => {
      const real = await route.fetch();
      const body = await real.json();
      await route.fulfill({ status: 200, json: { ...body, state: 'stale' } });
    });
    await page.goto('/');
    const banner = page.getByTestId('fx-banner');
    await expect(banner).toHaveText('当前显示为缓存汇率');
    await expect(banner).toHaveClass(/alert-warning/);
    await expect(page.getByTestId('product-card').first().getByTestId('cny-ref')).toContainText('≈ ¥');
    await saveEvidence(page, 'B-E2E-02-cached-banner');

    // 接口直接失败、但浏览器本地已有快照：仍为缓存态，参考价不消失（不闪烁不清空）
    await page.unroute(FX);
    await page.route(FX, (route) => route.abort());
    await page.reload();
    await expect(banner).toHaveText('当前显示为缓存汇率');
    await expect(page.getByTestId('product-card').first().getByTestId('cny-ref')).toContainText('≈ ¥');
  });

  test('B-E2E-03 汇率完全不可用：只显示美元价，横幅提示，仍可加购 (FX-S-003/005)', async ({ page }) => {
    await page.route(FX, (route) =>
      route.fulfill({
        status: 503,
        json: { message: 'FX rate completely unavailable', messageKey: 'fx.unavailable' },
      })
    );
    await page.goto('/');
    const banner = page.getByTestId('fx-banner');
    await expect(banner).toHaveText('汇率暂不可用');
    await expect(banner).toHaveClass(/alert-secondary/);
    await expect(page.getByTestId('product-card').first().getByTestId('money-display')).toContainText('$');
    await expect(page.getByTestId('cny-ref')).toHaveCount(0);
    await saveEvidence(page, 'B-E2E-03-unavailable-hidden');

    await page.getByTestId('product-card').first().getByRole('link').first().click();
    await page.getByTestId('add-to-cart').click();
    await expect(page).toHaveURL(/\/cart/);
    await expect(page.getByTestId('cart-item').first()).toBeVisible();
    await expect(page.getByTestId('cny-ref')).toHaveCount(0);
    await saveEvidence(page, 'B-E2E-03-add-to-cart-ok');
  });
});

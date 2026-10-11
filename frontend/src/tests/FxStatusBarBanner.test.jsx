import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from './testUtils.jsx';

// 隔离网络：只验证横幅如何根据 fx.state 渲染
vi.mock('../slices/fxSlice.js', async (importOriginal) => ({
  ...(await importOriginal()),
  useGetUsdCnyQuery: () => ({}),
}));
const { default: FxStatusBarBanner } = await import('../components/FxStatusBarBanner.jsx');

const renderWith = (fxState, lang = 'zh') =>
  renderWithProviders(<FxStatusBarBanner />, {
    preloadedState: {
      fx: {
        snapshot: fxState === 'unavailable' ? null : { rate: 7.25, fetchedAt: 'x' },
        state: fxState,
        availableRate: fxState !== 'unavailable',
      },
      language: { current: lang },
    },
  });

describe('FxStatusBarBanner (FX-S-004/005)', () => {
  it('loading / available 时不渲染横幅（不闪烁）', () => {
    renderWith('loading');
    expect(screen.queryByTestId('fx-banner')).toBeNull();
  });

  it('stale 时展示黄色"当前显示为缓存汇率"横幅 (FX-S-004)', () => {
    renderWith('stale');
    const el = screen.getByTestId('fx-banner');
    expect(el.textContent).toBe('当前显示为缓存汇率');
    expect(el.className).toContain('alert-warning');
  });

  it('unavailable 时展示"汇率暂不可用"横幅 (FX-S-005)', () => {
    renderWith('unavailable');
    expect(screen.getByTestId('fx-banner').textContent).toBe('汇率暂不可用');
  });

  it('英文界面使用英文文案', () => {
    renderWith('stale', 'en');
    expect(screen.getByTestId('fx-banner').textContent).toBe('Cached exchange rate in use');
  });
});

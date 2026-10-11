import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import MoneyDisplay from '../components/MoneyDisplay.jsx';
import { renderWithProviders } from './testUtils.jsx';

describe('MoneyDisplay (FX-S-001/005 全站一致)', () => {
  it('无 FX 快照时仅展示 USD，不渲染参考价 (FX-S-005)', () => {
    renderWithProviders(<MoneyDisplay usd={10} />, {
      preloadedState: {
        fx: { snapshot: null, state: 'unavailable', availableRate: false },
      },
    });
    const el = screen.getByTestId('money-display');
    expect(el.textContent).toContain('$10.00');
    expect(el.textContent).not.toContain('¥');
    expect(screen.queryByTestId('cny-ref')).toBeNull();
  });

  it('有快照时展示 ≈ ¥ 参考价 (FX-S-001)', () => {
    renderWithProviders(<MoneyDisplay usd={10} />, {
      preloadedState: {
        fx: {
          snapshot: { rate: 7.2, fetchedAt: 'x' },
          state: 'available',
          availableRate: true,
        },
      },
    });
    expect(screen.getByTestId('cny-ref').textContent).toBe('≈ ¥72.00');
  });
});

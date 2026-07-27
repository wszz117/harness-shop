import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import MoneyDisplay from '../components/MoneyDisplay.jsx';
import { renderWithProviders } from './testUtils.jsx';

describe('MoneyDisplay (S-004 全站一致)', () => {
  it('无 FX 快照时仅展示 USD', () => {
    renderWithProviders(<MoneyDisplay usd={10} />, {
      preloadedState: {
        fx: { snapshot: null, state: 'unavailable', availableRate: false },
      },
    });
    const el = screen.getByTestId('money-display');
    expect(el.textContent).toContain('$10.00');
    expect(el.textContent).not.toContain('¥');
  });

  it('有快照时展示换算 CNY', () => {
    renderWithProviders(<MoneyDisplay usd={10} />, {
      preloadedState: {
        fx: {
          snapshot: { rate: 7.2, fetchedAt: 'x' },
          state: 'available',
          availableRate: true,
        },
      },
    });
    expect(screen.getByTestId('money-display').textContent).toContain('¥72.00');
  });
});

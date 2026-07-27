import { describe, it, expect } from 'vitest';
import { calcPrices } from '../../utils/calcPrices.js';

describe('calcPrices', () => {
  it('小于 100 收 10 元运费', () => {
    const r = calcPrices([{ price: 10, qty: 2 }]);
    expect(r.itemsPrice).toBe('20.00');
    expect(r.shippingPrice).toBe('10.00');
    expect(r.taxPrice).toBe('3.00');
    expect(r.totalPrice).toBe('33.00');
  });

  it('大于 100 免运费', () => {
    const r = calcPrices([{ price: 60, qty: 2 }]);
    expect(r.shippingPrice).toBe('0.00');
    expect(r.totalPrice).toBe('138.00');
  });
});

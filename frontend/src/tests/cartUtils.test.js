import { describe, it, expect } from 'vitest';
import { addDecimals, updateCart } from '../utils/cartUtils.js';

describe('cartUtils', () => {
  it('addDecimals 保留两位小数', () => {
    expect(addDecimals(10.555)).toBe('10.56');
  });

  it('updateCart 计算运费与税费（<=100 收 10 运费）', () => {
    const state = { cartItems: [{ price: 10, qty: 2 }] };
    const r = updateCart(state);
    expect(r.itemsPrice).toBe('20.00');
    expect(r.shippingPrice).toBe('10.00');
    expect(r.taxPrice).toBe('3.00');
    expect(r.totalPrice).toBe('33.00');
  });
});

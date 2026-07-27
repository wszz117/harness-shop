import { describe, it, expect } from 'vitest';
import request from 'supertest';
import '../setup.js';
import app from '../../app.js';
import { createUserAndLogin, seedProducts } from '../helpers.js';

const shipping = {
  address: '中关村大街 1 号',
  city: '北京',
  postalCode: '100080',
  country: '中国',
};

describe('POST /api/orders', () => {
  it('空订单返回 400 (ORDER-S-002)', async () => {
    const cookie = await createUserAndLogin();
    const res = await request(app)
      .post('/api/orders')
      .set('Cookie', cookie)
      .send({ orderItems: [], shippingAddress: shipping, paymentMethod: 'PayPal' });
    expect(res.status).toBe(400);
  });

  it('下单成功且价格以 DB 为准（防客户端篡改, ORDER-S-001/S-003）', async () => {
    const [p] = await seedProducts();
    const cookie = await createUserAndLogin();
    const res = await request(app)
      .post('/api/orders')
      .set('Cookie', cookie)
      .send({
        orderItems: [
          { _id: p._id.toString(), name: p.name, image: p.image, qty: 2, price: 0.01 },
        ],
        shippingAddress: shipping,
        paymentMethod: 'PayPal',
      });
    expect(res.status).toBe(201);
    // 89.99 * 2 = 179.98 (>100 免运费), tax 15%
    expect(Number(res.body.itemsPrice)).toBeCloseTo(179.98);
    expect(Number(res.body.shippingPrice)).toBe(0);
    expect(Number(res.body.totalPrice)).toBeCloseTo(179.98 * 1.15, 1);
  });
});

describe('GET /api/orders/mine', () => {
  it('只返回当前用户的订单 (ORDER-S-004)', async () => {
    const [p] = await seedProducts();
    const cookieA = await createUserAndLogin('a@test.com');
    await request(app)
      .post('/api/orders')
      .set('Cookie', cookieA)
      .send({
        orderItems: [
          { _id: p._id.toString(), name: p.name, image: p.image, qty: 1, price: p.price },
        ],
        shippingAddress: shipping,
        paymentMethod: 'PayPal',
      });
    const cookieB = await createUserAndLogin('b@test.com');
    const res = await request(app)
      .get('/api/orders/mine')
      .set('Cookie', cookieB);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(0);
  });
});

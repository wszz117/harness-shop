import { describe, it, expect } from 'vitest';
import request from 'supertest';
import '../setup.js';
import app from '../../app.js';
import {
  createAdminAndLogin,
  createUserAndLogin,
  seedProducts,
} from '../helpers.js';

describe('GET /api/products', () => {
  it('返回商品列表与分页信息', async () => {
    await seedProducts();
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body.products).toHaveLength(3);
    expect(res.body.page).toBe(1);
    expect(res.body.pages).toBe(1);
  });

  it('关键词搜索按中文命中 (PROD-S-002)', async () => {
    await seedProducts();
    const res = await request(app).get('/api/products?keyword=耳机');
    expect(res.status).toBe(200);
    expect(res.body.products).toHaveLength(1);
    expect(res.body.products[0].name).toBe('无线蓝牙耳机');
  });

  it('lang=en 时投影英文文案且关键词按英文命中 (I18N-S-003)', async () => {
    await seedProducts();
    const res = await request(app).get('/api/products?keyword=Mouse&lang=en');
    expect(res.status).toBe(200);
    expect(res.body.products).toHaveLength(1);
    expect(res.body.products[0].name).toBe('Gaming Mouse');
    expect(res.body.products[0].name_en).toBeUndefined();
  });
});

describe('GET /api/products/top', () => {
  it('按 rating 降序返回最多 3 个 (PROD-S-005)', async () => {
    await seedProducts();
    const res = await request(app).get('/api/products/top');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(3);
    expect(res.body[0].rating).toBeGreaterThanOrEqual(res.body[1].rating);
  });
});

describe('GET /api/products/:id', () => {
  it('非法 ObjectId 返回 404 而非 500 (PROD-S-004)', async () => {
    const res = await request(app).get('/api/products/not-an-objectid');
    expect(res.status).toBe(404);
  });

  it('合法 id 返回商品详情', async () => {
    const [p] = await seedProducts();
    const res = await request(app).get(`/api/products/${p._id}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('无线蓝牙耳机');
  });
});

describe('POST /api/products (admin)', () => {
  it('未登录返回 401', async () => {
    const res = await request(app).post('/api/products').send({});
    expect(res.status).toBe(401);
  });

  it('空数值转成 0，创建成功 (ADMIN 建品口径)', async () => {
    const cookie = await createAdminAndLogin();
    const res = await request(app)
      .post('/api/products')
      .set('Cookie', cookie)
      .send({ name: '新品', price: '', countInStock: '' });
    expect(res.status).toBe(201);
    expect(res.body.price).toBe(0);
    expect(res.body.countInStock).toBe(0);
  });

  it('非法数值返回 400 + messageKey admin.product.invalidInput', async () => {
    const cookie = await createAdminAndLogin();
    const res = await request(app)
      .post('/api/products')
      .set('Cookie', cookie)
      .send({ name: '新品', price: 'abc', countInStock: 3 });
    expect(res.status).toBe(400);
    expect(res.body.messageKey).toBe('admin.product.invalidInput');
  });
});

describe('POST /api/products/:id/reviews', () => {
  it('登录用户可评论，重复评论返回 400 (PROD-S-007)', async () => {
    const [p] = await seedProducts();
    const cookie = await createUserAndLogin();
    const first = await request(app)
      .post(`/api/products/${p._id}/reviews`)
      .set('Cookie', cookie)
      .send({ rating: 5, comment: '很好' });
    expect(first.status).toBe(201);
    const second = await request(app)
      .post(`/api/products/${p._id}/reviews`)
      .set('Cookie', cookie)
      .send({ rating: 4, comment: '再评' });
    expect(second.status).toBe(400);
  });
});

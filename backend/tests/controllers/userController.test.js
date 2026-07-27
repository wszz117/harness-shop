import { describe, it, expect } from 'vitest';
import request from 'supertest';
import '../setup.js';
import app from '../../app.js';
import User from '../../models/userModel.js';
import { createUserAndLogin, seedProducts } from '../helpers.js';

describe('POST /api/users (register)', () => {
  it('注册成功返回 201 与用户信息 (AUTH-S-001)', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ name: 'New', email: 'new@test.com', password: '123456' });
    expect(res.status).toBe(201);
    expect(res.body.email).toBe('new@test.com');
    expect(res.body.uiLanguage).toBe('zh'); // 默认中文
    expect(res.headers['set-cookie'][0]).toContain('jwt=');
  });

  it('重复邮箱返回 400 (AUTH-S-002)', async () => {
    await User.create({ name: 'A', email: 'dup@test.com', password: '123456' });
    const res = await request(app)
      .post('/api/users')
      .send({ name: 'B', email: 'dup@test.com', password: '123456' });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/users/auth (login)', () => {
  it('正确凭证登录成功 (AUTH-S-003)', async () => {
    await User.create({ name: 'A', email: 'a@test.com', password: '123456' });
    const res = await request(app)
      .post('/api/users/auth')
      .send({ email: 'a@test.com', password: '123456' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('A');
  });

  it('错误密码返回 401 (AUTH-S-004)', async () => {
    await User.create({ name: 'A', email: 'a@test.com', password: '123456' });
    const res = await request(app)
      .post('/api/users/auth')
      .send({ email: 'a@test.com', password: 'wrong' });
    expect(res.status).toBe(401);
  });
});

describe('PUT /api/users/profile', () => {
  it('可持久化用户级语言偏好 uiLanguage (I18N-S-005)', async () => {
    const cookie = await createUserAndLogin();
    const res = await request(app)
      .put('/api/users/profile')
      .set('Cookie', cookie)
      .send({ uiLanguage: 'en' });
    expect(res.status).toBe(200);
    expect(res.body.uiLanguage).toBe('en');
  });
});

describe('wishlist (我的收藏 WISH-R-001)', () => {
  it('添加/查询/移除收藏全链路', async () => {
    const [p] = await seedProducts();
    const cookie = await createUserAndLogin();

    const add = await request(app)
      .post('/api/users/wishlist')
      .set('Cookie', cookie)
      .send({ productId: p._id.toString() });
    expect(add.status).toBe(201);

    const list = await request(app)
      .get('/api/users/wishlist')
      .set('Cookie', cookie);
    expect(list.status).toBe(200);
    expect(list.body).toHaveLength(1);
    expect(list.body[0]._id).toBe(p._id.toString());

    const del = await request(app)
      .delete(`/api/users/wishlist/${p._id}`)
      .set('Cookie', cookie);
    expect(del.status).toBe(200);

    const after = await request(app)
      .get('/api/users/wishlist')
      .set('Cookie', cookie);
    expect(after.body).toHaveLength(0);
  });

  it('重复添加不产生重复条目 (WISH-S-003)', async () => {
    const [p] = await seedProducts();
    const cookie = await createUserAndLogin();
    await request(app)
      .post('/api/users/wishlist')
      .set('Cookie', cookie)
      .send({ productId: p._id.toString() });
    await request(app)
      .post('/api/users/wishlist')
      .set('Cookie', cookie)
      .send({ productId: p._id.toString() });
    const list = await request(app)
      .get('/api/users/wishlist')
      .set('Cookie', cookie);
    expect(list.body).toHaveLength(1);
  });

  it('收藏不存在的商品返回 404', async () => {
    const cookie = await createUserAndLogin();
    const res = await request(app)
      .post('/api/users/wishlist')
      .set('Cookie', cookie)
      .send({ productId: '507f1f77bcf86cd799439011' });
    expect(res.status).toBe(404);
  });
});

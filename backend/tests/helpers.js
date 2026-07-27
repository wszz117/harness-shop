import request from 'supertest';
import app from '../app.js';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';

export async function createAdminAndLogin() {
  await User.create({
    name: 'Admin',
    email: 'admin@test.com',
    password: '123456',
    isAdmin: true,
  });
  const res = await request(app)
    .post('/api/users/auth')
    .send({ email: 'admin@test.com', password: '123456' });
  return res.headers['set-cookie'];
}

export async function createUserAndLogin(email = 'user@test.com') {
  await User.create({
    name: 'User',
    email,
    password: '123456',
    isAdmin: false,
  });
  const res = await request(app)
    .post('/api/users/auth')
    .send({ email, password: '123456' });
  return res.headers['set-cookie'];
}

export async function seedProducts(owner) {
  const user =
    owner ||
    (await User.create({
      name: 'Seeder',
      email: `seed-${Date.now()}@test.com`,
      password: '123456',
      isAdmin: true,
    }));
  return Product.insertMany([
    {
      user: user._id,
      name: '无线蓝牙耳机',
      name_en: 'Wireless Headphones',
      image: '/images/airpods.jpg',
      brand: 'Apple',
      category: '电子产品',
      category_en: 'Electronics',
      description: '高品质音频',
      description_en: 'High quality audio',
      price: 89.99,
      countInStock: 10,
      rating: 4.5,
      numReviews: 12,
    },
    {
      user: user._id,
      name: '游戏鼠标',
      name_en: 'Gaming Mouse',
      image: '/images/mouse.jpg',
      brand: 'Logitech',
      category: '电子产品',
      category_en: 'Electronics',
      description: '可编程按键',
      description_en: 'Programmable buttons',
      price: 49.99,
      countInStock: 7,
      rating: 3.5,
      numReviews: 10,
    },
    {
      user: user._id,
      name: '智能音箱',
      name_en: 'Smart Speaker',
      image: '/images/alexa.jpg',
      brand: 'Amazon',
      category: '电子产品',
      category_en: 'Electronics',
      description: '语音控制',
      description_en: 'Voice control',
      price: 29.99,
      countInStock: 0,
      rating: 5,
      numReviews: 12,
    },
  ]);
}

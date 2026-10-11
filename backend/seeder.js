import dotenv from 'dotenv';
dotenv.config();
import users from './data/users.js';
import products from './data/products.js';
import reviews from './data/reviews.js';
import User from './models/userModel.js';
import Product from './models/productModel.js';
import Order from './models/orderModel.js';
import connectDB from './config/db.js';

await connectDB();

// 把 data/reviews.js 挂到对应用户上，并据此计算 rating / numReviews
const withReviews = (product, createdUsers) => {
  const list = (reviews[product.image] || []).map((r) => ({
    name: createdUsers[r.user].name,
    rating: r.rating,
    comment: r.comment,
    user: createdUsers[r.user]._id,
  }));
  const rating = list.length
    ? Math.round((list.reduce((a, r) => a + r.rating, 0) / list.length) * 10) / 10
    : 0;
  return { ...product, reviews: list, numReviews: list.length, rating };
};

const importData = async () => {
  try {
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    const createdUsers = await User.insertMany(users);
    const adminUser = createdUsers[0]._id;

    const sampleProducts = products.map((product) => {
      return { ...withReviews(product, createdUsers), user: adminUser };
    });
    await Product.insertMany(sampleProducts);

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();
    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}

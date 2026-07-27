import asyncHandler from '../middleware/asyncHandler.js';
import Product from '../models/productModel.js';
import {
  buildKeywordFilter,
  projectProductForLang,
  resolveLang,
} from '../utils/productI18n.js';

// @desc    Fetch all products (关键词搜索 + 分页 + 语言投影)
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const pageSize = Number(process.env.PAGINATION_LIMIT) || 8;
  const page = Number(req.query.pageNumber) || 1;
  const lang = resolveLang(req);

  const keywordFilter = buildKeywordFilter(req.query.keyword, lang);

  const count = await Product.countDocuments({ ...keywordFilter });
  const products = await Product.find({ ...keywordFilter })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    products: products.map((p) => projectProductForLang(p, lang)),
    page,
    pages: Math.ceil(count / pageSize),
  });
});

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const lang = resolveLang(req);
  const product = await Product.findById(req.params.id);
  if (product) {
    return res.json(projectProductForLang(product, lang));
  }
  res.status(404);
  throw new Error('Resource not found');
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const {
    name = '样品名称',
    price = 0,
    image = '/images/sample.jpg',
    brand = '样品品牌',
    category = '样品分类',
    countInStock = 0,
    description = '样品描述',
  } = req.body || {};

  // 空数值会被转成 0；非法数值输入返回 messageKey: admin.product.invalidInput
  const numericPrice = price === '' || price === null ? 0 : Number(price);
  const numericStock =
    countInStock === '' || countInStock === null ? 0 : Number(countInStock);
  if (Number.isNaN(numericPrice) || Number.isNaN(numericStock)) {
    res.status(400);
    const err = new Error('Invalid numeric input');
    err.messageKey = 'admin.product.invalidInput';
    throw err;
  }

  const product = new Product({
    name,
    price: numericPrice,
    user: req.user._id,
    image,
    brand,
    category,
    countInStock: numericStock,
    numReviews: 0,
    description,
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const { name, price, description, image, brand, category, countInStock } =
    req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    const numericPrice = price === '' || price === null ? 0 : Number(price);
    const numericStock =
      countInStock === '' || countInStock === null ? 0 : Number(countInStock);
    if (Number.isNaN(numericPrice) || Number.isNaN(numericStock)) {
      res.status(400);
      const err = new Error('Invalid numeric input');
      err.messageKey = 'admin.product.invalidInput';
      throw err;
    }
    product.name = name ?? product.name;
    product.price = numericPrice;
    product.description = description ?? product.description;
    product.image = image ?? product.image;
    product.brand = brand ?? product.brand;
    product.category = category ?? product.category;
    product.countInStock = numericStock;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('Resource not found');
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    await Product.deleteOne({ _id: product._id });
    res.json({ message: 'Product removed' });
  } else {
    res.status(404);
    throw new Error('Resource not found');
  }
});

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );
    if (alreadyReviewed) {
      res.status(400);
      throw new Error('Product already reviewed');
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();
    res.status(201).json({ message: 'Review added' });
  } else {
    res.status(404);
    throw new Error('Resource not found');
  }
});

// @desc    Get top rated products
// @route   GET /api/products/top
// @access  Public
const getTopProducts = asyncHandler(async (req, res) => {
  const lang = resolveLang(req);
  const products = await Product.find({}).sort({ rating: -1 }).limit(3);
  res.json(products.map((p) => projectProductForLang(p, lang)));
});

export {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getTopProducts,
};

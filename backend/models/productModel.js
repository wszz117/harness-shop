import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    // i18n 双语字段：默认中文，*_en 为英文投影 (productI18n.projectProductForLang)
    name: { type: String, required: true },
    name_en: { type: String, default: '' },
    image: { type: String, required: true },
    brand: { type: String, required: true },
    category: { type: String, required: true },
    category_en: { type: String, default: '' },
    description: { type: String, required: true },
    description_en: { type: String, default: '' },
    reviews: [reviewSchema],
    rating: { type: Number, required: true, default: 0 },
    numReviews: { type: Number, required: true, default: 0 },
    price: { type: Number, required: true, default: 0 },
    countInStock: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

const Product = mongoose.model('Product', productSchema);

export default Product;

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a product name'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a product description'],
    },
    price: {
      type: Number,
      required: [true, 'Please provide a product price'],
      min: 0,
    },
    category: {
      type: String,
      required: [true, 'Please provide a product category'],
    },
    subcategory: {
      type: String,
      default: null,
    },
    subSubcategory: {
      type: String,
      default: null,
    },
    subSubSubcategory: {
      type: String,
      default: null,
    },
    size: {
      type: String,
      default: null,
    },
    images: [
      {
        url: String,
        publicId: String,
      },
    ],
    maxImages: {
      type: Number,
      default: 4,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Product', productSchema);

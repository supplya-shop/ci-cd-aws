const mongoose = require("mongoose");
const schema = mongoose.Schema;
const Category = require('./Category')

const ProductSchema = new schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    default: "0",
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  quantity: {
    type: String,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'Category',
    required:true
  },
  image: {
    type: String,
    default: "",
  },
  images: [
    {
      type: String,
    },
  ],
  brand: {
    type: String,
    default: "",
  },
  // category: {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: 'Category',
  //     required: true,
  // },
  inStock: {
    type: Boolean,
    default: true,
  },
  rating: {
    type: String,
    default: 0,
  },
  numReviews: {
    type: Number,
    default: 0,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  hasDiscount: {
    type: Boolean,
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
  dateModified: {
    type: Date,
  },
});

const Product = mongoose.model("product", ProductSchema);

module.exports = Product;

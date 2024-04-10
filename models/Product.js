const mongoose = require("mongoose");
const schema = mongoose.Schema;

const productSchema = new schema({
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
    type: Number,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
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
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
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
    default: false,
  },
  flashsale: {
    type: Boolean,
    default: false,
  },
  saleCount: {
    type: Number,
    default: 0,
  },
  approved: {
    type: Boolean,
    default: false,
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
  dateModified: {
    type: Date,
  },
  moq: {
    type: Number,
    default: 1,
  },
});

module.exports = mongoose.model("Product", productSchema);

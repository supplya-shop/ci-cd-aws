const { required } = require("joi");
const mongoose = require("mongoose");
const schema = mongoose.Schema;

const productSchema = new schema({
  name: {
    type: String,
    required: true,
  },
  unit_price: {
    type: Number,
    default: 0,
    required: true,
  },
  discounted_price: {
    type: Number,
    default: 0,
  },
  description: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  size: {
    type: String,
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
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["inStock", "outOfStock"],
    default: "inStock",
    required: true,
  },
  rating: {
    type: String,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  isDealOfTheDay: {
    type: Boolean,
    default: false,
  },
  isTrending: {
    type: Boolean,
    default: false,
  },
  flashsale: {
    type: Boolean,
    default: false,
  },
  flashsaleStartDate: { type: Date },
  flashsaleEndDate: { type: Date },
  flashsaleOffers: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      offerPrice: { type: Number, required: true },
      status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending",
      },
    },
  ],
  salesCount: {
    type: Number,
    default: 0,
  },
  approved: {
    type: Boolean,
    default: false,
  },
  specialDeal: {
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
  sku: {
    type: String,
    default: "",
  },
  moq: {
    type: Number,
    default: 1,
    required: true,
  },
});

module.exports = mongoose.model("Product", productSchema);

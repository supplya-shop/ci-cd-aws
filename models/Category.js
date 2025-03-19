const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Category name is required"],
    trim: true,
    unique: true,
    maxlength: [50, "Category name cannot exceed 50 characters"],
  },
  description: {
    type: String,
    required: [true, "Category description is required"],
    maxlength: [500, "Category description cannot exceed 500 characters"],
  },
  image: {
    type: String,
    required: [true, "Category image is required"],
    default: "",
  },
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    default: null,
  },
  status: { type: String, enum: ["active", "inActive"], default: "active" },
  totalProduct: { type: Number, default: 0 },
  homepageDisplay: { type: Boolean, default: false },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Category", categorySchema);

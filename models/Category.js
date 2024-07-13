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
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Category", categorySchema);

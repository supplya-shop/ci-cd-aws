const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const reviewSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  comment: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  dateCreated: { type: Date, default: Date.now },
  dateModified: { type: Date },
});

module.exports = mongoose.model("Review", reviewSchema);

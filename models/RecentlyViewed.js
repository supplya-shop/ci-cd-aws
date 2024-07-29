const mongoose = require("mongoose");

const RecentlyViewedSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
      viewedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

const RecentlyViewed = mongoose.model("RecentlyViewed", RecentlyViewedSchema);

module.exports = RecentlyViewed;

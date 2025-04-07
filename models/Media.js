// models/Media.js
const mongoose = require("mongoose");

const mediaSchema = mongoose.Schema(
  {
    tag: {
      type: String,
      required: true,
      enum: [
        "StoreBanner",
        "HeroBanner",
        "SkyscraperBanner",
        "FooterBanner",
        "SpecialDealsBanner",
      ],
    },
    image: {
      type: String,
      required: true,
    },
    description: String,
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    redirectUrl: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Media", mediaSchema);

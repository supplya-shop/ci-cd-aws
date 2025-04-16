// models/Media.js
const mongoose = require("mongoose");

const mediaSchema = mongoose.Schema(
  {
    platform: {
      type: String,
      required: true,
      enum: ["web", "mobile"],
    },
    section: {
      type: String,
      required: true,
      enum: [
        "StoreBanner",
        "TopBarBanner",
        "HeroBanner",
        "SpecialBanner",
        "PopularDealsBanner",
        "FlashSalesBanner",
        "BillboardBanner",
        "SkyscraperLeftBanner",
        "SkyscraperRightBanner",
        "FooterBanner",
        "SpecialDealsBanner",
        "CategoryTopBanner",
        "CategoryBottomBanner",
        "HomeMobileTopBanner",
        "HomeMobileMiddleBanner",
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

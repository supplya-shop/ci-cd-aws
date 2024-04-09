const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const storeSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  url: {
    type: String,
    required: true,
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  wallet: {
    deposit: {
      type: Number,
      default: 0,
    },
    balance: {
      type: Number,
      default: 0,
    },
    withdraw: {
      type: Number,
    },
  },
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
  ],
  country: {
    type: String,
    default: "",
  },

  state: {
    type: String,
    default: "",
  },

  address: {
    type: String,
    default: "",
  },
  streetAddress: {
    type: String,
    default: "",
  },

  city: {
    type: String,
    default: "",
  },

  postalCode: {
    type: String,
    default: "",
  },
});

module.exports = mongoose.model("Store", storeSchema);

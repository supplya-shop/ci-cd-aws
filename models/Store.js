const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const StoreSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  wallet: {
    deposit: {
      type: Number,
      default: 0,
    },
    withdraw: {
      type: Number,
      default: 0,
    },
  },
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
  ],
});

const Store = mongoose.model("Store", StoreSchema);

module.exports = Store;

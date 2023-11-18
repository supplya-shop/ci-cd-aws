const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product", // Assuming you have a Product model
    required: true,
  },
  quantity: {
    type: Number,
    default: 0,
  },
});

const Inventory = mongoose.model("Inventory", inventorySchema);

module.exports = Inventory;

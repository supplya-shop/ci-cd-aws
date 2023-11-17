const mongoose = require("mongoose");
const schema = mongoose.Schema;

const CartSchema = new mongoose.Schema({
  items: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
});

const Cart = mongoose.model("Cart", CartSchema);

module.exports = Cart;

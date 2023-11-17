const express = require("express");
const router = express.Router();
const authenticateUser = require("../middleware/authenticateUser");
const { getCart, addToCart, removeFromCart } = require("../controllers/cart");

router.get("/", authenticateUser, getCart);
router.post("/add", addToCart);
router.delete("/remove/:productId", authenticateUser, removeFromCart);

module.exports = router;

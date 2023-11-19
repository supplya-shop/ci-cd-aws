const express = require("express");
const router = express.Router();
const authenticateUser = require("../middleware/authenticateUser");
const { createOrder, getOrders } = require("../controllers/order");

// order routes
router.post("/create", authenticateUser, createOrder);
router.get("/", authenticateUser, getOrders);

module.exports = router;

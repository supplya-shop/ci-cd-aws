const express = require("express");
const router = express.Router();
const authenticateUser = require("../middleware/authenticateUser");
const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
} = require("../controllers/order");

// order routes
router.post("/create", authenticateUser, createOrder);
router.get("/", authenticateUser, getOrders);
router.get("/:orderId", authenticateUser, getOrderById);
router.put("/:orderId", authenticateUser, updateOrder);
router.delete("/:orderId", authenticateUser, deleteOrder);

module.exports = router;

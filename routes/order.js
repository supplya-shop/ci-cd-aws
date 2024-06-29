const express = require("express");
const router = express.Router();
const {
  authenticateUser,
  rolesAllowed,
} = require("../middleware/authenticateUser");
const {
  createOrder,
  getOrders,
  getOrderById,
  getOrdersByUserId,
  getOrdersByStatus,
  getLatestOrder,
  updateOrder,
  cancelOrder,
} = require("../controllers/order");

// order routes
router.get("/latest", authenticateUser, getLatestOrder);
router.post("/create", authenticateUser, createOrder);
router.get("/user/:id", authenticateUser, getOrdersByUserId);
router.get("/", authenticateUser, getOrders);
router.get("/:orderId", authenticateUser, getOrderById);
router.get("/status/:orderStatus", authenticateUser, getOrdersByStatus);
router.put("/:orderId", authenticateUser, updateOrder);
router.put("/cancel/:orderId", authenticateUser, cancelOrder);

module.exports = router;

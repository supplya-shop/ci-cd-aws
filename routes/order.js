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
  getOrderByOrderId,
  getOrdersByStatus,
  getLatestOrder,
  updateOrder,
  cancelOrder,
  deleteOrder,
} = require("../controllers/order");

// order routes
router.get("/latest", authenticateUser, getLatestOrder);
router.post("/create", authenticateUser, createOrder);
router.get("/user/:id", authenticateUser, getOrdersByUserId);
router.get("/:id", authenticateUser, getOrderById);
router.get("/orderId/:orderId", authenticateUser, getOrderByOrderId);
router.get("/", authenticateUser, getOrders);
router.get("/status/:orderStatus", authenticateUser, getOrdersByStatus);
router.put("/:orderId", authenticateUser, updateOrder);
router.put("/cancel/:orderId", authenticateUser, cancelOrder);
router.delete("/:orderId", authenticateUser, deleteOrder);

module.exports = router;

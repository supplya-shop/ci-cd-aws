const express = require("express");
const router = express.Router();
const {
  authenticateUser,
  rolesAllowed,
} = require("../middleware/authenticateUser");
const {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  sendNotificationToAllUsers,
  sendNotificationToAllVendors,
} = require("../controllers/notification");

// blog routes
router.post("/", authenticateUser, createNotification);
router.post("/users", authenticateUser, sendNotificationToAllUsers);
router.post("/vendors", authenticateUser, sendNotificationToAllVendors);
router.get("/", getNotifications);
router.put("/mark-as-read", authenticateUser, markAsRead);
router.put("/mark-all-read", authenticateUser, markAllAsRead);
router.delete("/:id", deleteNotification);

module.exports = router;

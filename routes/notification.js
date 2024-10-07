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
  notifyAllUsers,
  notifyAllVendors,
} = require("../controllers/notification");

router.post("/", authenticateUser, createNotification);
router.post("/users", authenticateUser, notifyAllUsers);
router.post("/vendors", authenticateUser, notifyAllVendors);
router.get("/", getNotifications);
router.put("/mark-as-read", authenticateUser, markAsRead);
router.put("/mark-all-read", authenticateUser, markAllAsRead);
router.delete("/:id", deleteNotification);

module.exports = router;

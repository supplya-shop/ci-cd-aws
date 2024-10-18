const express = require("express");
const router = express.Router();
const {
  authenticateUser,
  rolesAllowed,
} = require("../middleware/authenticateUser");
const {
  createNotification,
  getNotifications,
  getNotificationsByRole,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  notifyAllUsers,
  notifyUsersByRole,
} = require("../controllers/notification");

router.post("/", authenticateUser, createNotification);
router.post("/users/all", authenticateUser, notifyAllUsers);
router.post("/users/role", authenticateUser, notifyUsersByRole);
router.get("/user", authenticateUser, getUserNotifications);
router.get("/", authenticateUser, getNotifications);
router.get("/get-by-role", authenticateUser, getNotificationsByRole);
router.put("/mark-read/:id", authenticateUser, markAsRead);
router.put("/mark-all-read", authenticateUser, markAllAsRead);
router.delete("/:id", authenticateUser, deleteNotification);

module.exports = router;

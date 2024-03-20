const express = require("express");
const router = express.Router();
const user = require("../models/User");
const {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  bulkdeleteUsers,
} = require("../controllers/user");

const {
  authenticateUser,
  roleMiddleware,
} = require("../middleware/authenticateUser");

//user routes
router.post("/create", authenticateUser, createUser);
router.get("/", authenticateUser, getAllUsers);
router.get("/:id", authenticateUser, getUserById);
router.patch("/:id", authenticateUser, updateUser);
router.delete(
  "/bulkdeleteusers",
  authenticateUser,
  roleMiddleware("admin"),
  bulkdeleteUsers
);
router.delete("/:id", authenticateUser, deleteUser);

module.exports = router;

const express = require("express");
const router = express.Router();
const {
  createUser,
  getAllUsers,
  getAdminUsers,
  getUserById,
  updateUser,
  deleteUser,
  bulkdeleteUsers,
} = require("../controllers/user");

const {
  authenticateUser,
  rolesAllowed,
} = require("../middleware/authenticateUser");

//user routes
router.patch("/:id", authenticateUser, updateUser);
router.post("/create", authenticateUser, createUser);
router.get("/", authenticateUser, getAllUsers);
router.get("/admin", authenticateUser, getAdminUsers);
router.get("/:id", authenticateUser, getUserById);
router.delete(
  "/bulkdeleteusers",
  authenticateUser,
  rolesAllowed("admin"),
  bulkdeleteUsers
);
router.delete("/:id", authenticateUser, deleteUser);

module.exports = router;

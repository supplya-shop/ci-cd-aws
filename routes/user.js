const express = require("express");
const router = express.Router();
const {
  createUser,
  getAllUsers,
  getAdminUsers,
  getUserById,
  getUsersByRole,
  updateUser,
  getUserOrders,
  bulkdeleteUsers,
  deleteUser,
  deleteUserAccount,
} = require("../controllers/user");

const {
  authenticateUser,
  rolesAllowed,
} = require("../middleware/authenticateUser");

//user routes
router.patch("/:id", authenticateUser, updateUser);
router.post("/create", authenticateUser, createUser);
router.get("/", authenticateUser, getAllUsers);
router.get("/orders", authenticateUser, getUserOrders);
router.get("/admin", authenticateUser, getAdminUsers);
router.get("/:id", authenticateUser, getUserById);
router.get("/role/:role", authenticateUser, getUsersByRole);
router.delete(
  "/bulkdeleteusers",
  authenticateUser,
  rolesAllowed("admin"),
  bulkdeleteUsers
);
router.delete("/:id", authenticateUser, deleteUser);
router.delete("/:id", authenticateUser, deleteUserAccount);

module.exports = router;

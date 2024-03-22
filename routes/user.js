const express = require("express");
const router = express.Router();
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
  rolesAllowed,
} = require("../middleware/authenticateUser");

//user routes
router.post("/create", authenticateUser, createUser);
router.get("/", authenticateUser, getAllUsers);
router.get("/:id", authenticateUser, getUserById);
router.patch("/:id", authenticateUser, updateUser);
router.delete(
  "/bulkdeleteusers",
  authenticateUser,
  rolesAllowed("admin"),
  bulkdeleteUsers
);
router.delete("/:id", authenticateUser, deleteUser);

module.exports = router;

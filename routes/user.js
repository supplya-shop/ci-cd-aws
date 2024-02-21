const express = require("express");
const router = express.Router();
const user = require("../models/User");
const {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  // deleteUser,
} = require("../controllers/user");

const authenticateUser = require("../middleware/authenticateUser");

//user routes
router.post("/create", authenticateUser, createUser);
router.get("/", authenticateUser, getAllUsers);
router.get("/:id", authenticateUser, getUserById);
router.patch("/:id", authenticateUser, updateUser);
// router.delete("/:id", authenticateUser, deleteUser);

router.delete("/:id", async (req, res, next) => {
  const userId = req.params.id;
  try {
    const userToDelete = await user.findById(userId);
    if (!userToDelete) {
      return res.status(404).json({ message: "User not found" });
    }
    const result = await user.findByIdAndDelete(userId);
    if (!result) {
      return res.status(500).json({ message: "Failed to delete user" });
    }
    res.status(200).json({
      message: "User deleted successfully",
      deletedUser: userToDelete,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;

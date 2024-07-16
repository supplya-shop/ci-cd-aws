const express = require("express");
const router = express.Router();
const {
  authenticateUser,
  rolesAllowed,
} = require("../middleware/authenticateUser");
const {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getCategoryData,
} = require("../controllers/category");

router.get("/data", authenticateUser, getCategoryData);
router.post("/", authenticateUser, createCategory);
router.get("/", getAllCategories);
router.get("/:categoryId", authenticateUser, getCategoryById);
router.put("/:categoryId", authenticateUser, updateCategory);
router.delete("/:categoryId", authenticateUser, deleteCategory);

module.exports = router;

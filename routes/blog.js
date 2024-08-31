const express = require("express");
const router = express.Router();
const {
  authenticateUser,
  rolesAllowed,
} = require("../middleware/authenticateUser");
const {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  addComment,
  getAllCategories,
  createCategory,
  deleteCategory,
  searchPosts,
} = require("../controllers/blog");

// blog routes
router.post("/posts", authenticateUser, createPost);
router.get("/posts", getAllPosts);
router.get("/posts/:id", getPostById);
router.put("/posts/:id", authenticateUser, updatePost);
router.delete("/posts/:id", authenticateUser, deletePost);
router.post("/posts/:postId/comments", authenticateUser, addComment);
router.get("/categories", getAllCategories);
router.post("/categories", authenticateUser, createCategory);
router.delete("/categories/:id", authenticateUser, deleteCategory);
router.get("/search", searchPosts);

module.exports = router;

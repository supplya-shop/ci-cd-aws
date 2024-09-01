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
  searchPosts,
} = require("../controllers/blog");

// blog routes
router.post("/posts", authenticateUser, createPost);
router.get("/posts", getAllPosts);
router.get("/posts/:id", getPostById);
router.put("/posts/:id", authenticateUser, updatePost);
router.delete("/posts/:id", authenticateUser, deletePost);
router.post("/posts/:postId/comments", authenticateUser, addComment);
router.get("/search", searchPosts);

module.exports = router;

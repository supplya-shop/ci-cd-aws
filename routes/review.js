const express = require("express");
const router = express.Router();
const {
  createReview,
  updateReview,
  fetchReviewByProductId,
  deleteReview,
} = require("../controllers/review");
const { authenticateUser } = require("../middleware/authenticateUser");

// Review routes
router.post("/", authenticateUser, createReview);
router.put("/:reviewId", authenticateUser, updateReview);
router.get("/:productId", fetchReviewByProductId);
router.delete("/:reviewId", authenticateUser, deleteReview);

module.exports = router;

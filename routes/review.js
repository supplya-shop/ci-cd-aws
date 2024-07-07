const express = require("express");
const router = express.Router();
const {
  addReview,
  editReview,
  fetchReviewByProductId,
  deleteReview,
} = require("../controllers/review");
const { authenticateUser } = require("../middleware/authenticateUser");

// Review routes
router.post("/", authenticateUser, addReview);
router.put("/:reviewId", authenticateUser, editReview);
router.get("/:productId", fetchReviewByProductId);
router.delete("/:reviewId", authenticateUser, deleteReview);

module.exports = router;

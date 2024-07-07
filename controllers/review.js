const Review = require("../models/Review");
const { StatusCodes } = require("http-status-codes");

const addReview = async (req, res) => {
  try {
    const { product, rating, comment } = req.body;
    const userId = req.user.userid;

    const newReview = new Review({
      user: userId,
      product,
      rating,
      comment,
    });

    await newReview.save();

    return res.status(StatusCodes.CREATED).json({
      message: "Review added successfully.",
      status: true,
      data: newReview,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Failed to add review.",
      status: false,
      error: error.message,
    });
  }
};

const editReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.userid;

    const review = await Review.findOneAndUpdate(
      { _id: reviewId, user: userId },
      { rating, comment, dateModified: Date.now() },
      { new: true }
    );

    if (!review) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message:
          "Review not found or you're not authorized to edit this review.",
        status: false,
      });
    }

    return res.status(StatusCodes.OK).json({
      message: "Review updated successfully.",
      status: true,
      data: review,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Failed to update review.",
      status: false,
      error: error.message,
    });
  }
};

const fetchReviewByProductId = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ product: productId })
      .populate("user", "firstName lastName email")
      .sort({ dateCreated: -1 });

    return res.status(StatusCodes.OK).json({
      message: "Reviews fetched successfully.",
      status: true,
      data: reviews,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Failed to fetch reviews.",
      status: false,
      error: error.message,
    });
  }
};

const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user._id;

    const review = await Review.findOneAndDelete({
      _id: reviewId,
      user: userId,
    });

    if (!review) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message:
          "Review not found or you're not authorized to delete this review.",
        status: false,
      });
    }

    return res.status(StatusCodes.OK).json({
      message: "Review deleted successfully.",
      status: true,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Failed to delete review.",
      status: false,
      error: error.message,
    });
  }
};

module.exports = {
  addReview,
  editReview,
  fetchReviewByProductId,
  deleteReview,
};

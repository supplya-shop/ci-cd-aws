const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../errors");
const Product = require("../models/Product");

const approveProduct = async (req, res, next) => {
  const { productId } = req.params;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "Product not found",
        status: "error",
      });
    }

    // Update the product's approval status to true
    product.approved = true;
    await product.save();

    return res.status(StatusCodes.OK).json({
      message: "Product approved successfully",
      status: "success",
    });
  } catch (error) {
    console.error(error.message);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Failed to approve Product",
      status: "error",
    });
  }
};

module.exports = { approveProduct };

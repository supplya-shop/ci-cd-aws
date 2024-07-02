const Product = require("../models/Product");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError } = require("../errors");

const mongoose = require("mongoose");

const createInventory = async (req, res) => {
  try {
    const products = req.body.products;
    let hasError = false;
    let errorProducts = [];

    for (const product of products) {
      const { quantity, productId } = product;

      if (!mongoose.Types.ObjectId.isValid(productId)) {
        hasError = true;
        errorProducts.push({ productId, error: "Invalid product ID" });
        continue;
      }

      if (quantity <= 0) {
        hasError = true;
        errorProducts.push({
          productId,
          error: "Quantity must be greater than 0",
        });
        continue;
      }

      try {
        const existingProduct = await Product.findById(productId);
        if (existingProduct) {
          existingProduct.quantity += quantity;

          if (existingProduct.quantity <= 0) {
            existingProduct.status = "outOfStock";
          } else {
            existingProduct.status = "inStock";
          }

          await existingProduct.save();
        } else {
          throw new Error("Product does not exist, create product first");
        }
      } catch (error) {
        hasError = true;
        errorProducts.push({ productId, error: error.message });
        continue;
      }
    }

    if (hasError) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: false,
        message: "Failed to update some products",
        data: errorProducts,
      });
    } else {
      return res.status(StatusCodes.OK).json({
        status: true,
        message: "All inventories updated successfully",
      });
    }
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Failed to process request: " + error.message,
    });
  }
};

const getInventory = async (req, res) => {
  try {
    const inventory = await Product.find({}, "_id name quantity status");
    if (!inventory.length) {
      return res.status(StatusCodes.OK).json({
        status: false,
        message: "No Inventory found",
      });
    }

    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Inventory fetched successfully",
      data: inventory.map((item) => ({
        id: item._id,
        name: item.name,
        quantity: item.quantity,
        status: item.status,
      })),
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: error.message,
    });
  }
};

const getInventoryByProduct = async (req, res) => {
  try {
    const productId = req.params.productId;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: false,
        message: "Invalid product ID",
      });
    }

    const inventory = await Product.findById(
      productId,
      "_id name quantity status"
    );

    if (!inventory) {
      return res
        .status(StatusCodes.OK)
        .json({ status: false, message: "Inventory not found" });
    }

    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Inventory fetched successfully",
      data: {
        id: inventory._id,
        name: inventory.name,
        quantity: inventory.quantity,
        status: inventory.status,
      },
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Failed to fetch inventory: " + error.message,
    });
  }
};

module.exports = {
  createInventory,
  getInventory,
  getInventoryByProduct,
};

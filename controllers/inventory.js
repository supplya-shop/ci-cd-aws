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

      // Validate productId and quantity here

      try {
        const existingInventory = await Product.findOne({ _id: productId });
        if (existingInventory) {
          existingInventory.quantity += quantity;
          await existingInventory.save();
        } else {
          throw new Error("Product does not exist, create product first");
        }
      } catch (error) {
        hasError = true;
        errorProducts.push({ productId, error: error.message });
        continue; // Continue processing other products
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
    const inventory = await Product.find({}, "_id name quantity"); // Select only specific fields
    if (!inventory) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: false,
        message: "No Inventory information available",
      });
    }

    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Inventory fetched successfully",
      data: inventory.map((item) => ({
        id: item._id,
        name: item.name,
        quantity: item.quantity,
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

    // Optionally check if the product exists here

    const inventory = await Product.findOne(
      { _id: productId },
      "_id name quantity"
    );

    if (!inventory) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ status: false, message: "Inventory not found" });
    }

    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Inventory fetched successfully",
      data: {
        id: inventory._id,
        name: inventory.name,
        quantity: inventory.quantity,
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

const Inventory = require("../models/Inventory");
const { StatusCodes } = require("http-status-codes");

const createInventory = async (req, res) => {
  try {
    const productId = req.params.productId;
    const { quantity } = req.body;

    // Validate productId and quantity here

    const existingInventory = await Inventory.findOne({ product: productId });
    if (existingInventory) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: "error",
        msg: "Inventory for this product already exists",
      });
    }

    const inventory = await Inventory.create({
      product: productId,
      quantity,
    });

    res.status(StatusCodes.CREATED).json({
      status: "success",
      msg: "Inventory created successfully",
      inventory,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: "error",
      msg: "Failed to create inventory: " + error.message,
    });
  }
};


const getInventory = async (req, res) => {
  try {
    const inventory = await Inventory.find({});

    res.status(StatusCodes.OK).json({
      status: "success",
      inventory,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: "error",
      msg: error.message,
    });
  }
};

const getInventoryByProduct = async (req, res) => {
  try {
    const productId = req.params.productId;

    // Optionally check if the product exists here

    const inventory = await Inventory.findOne({ product: productId });

    if (!inventory) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ status: "error", msg: "Inventory not found" });
    }

    res.status(StatusCodes.OK).json({
      status: "success",
      inventory,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: "error",
      msg: "Failed to fetch inventory: " + error.message,
    });
  }
};


const updateInventory = async (req, res) => {
  try {
    const productId = req.params.productId;
    const updates = req.body;
    const options = { new: true, upsert: true };

    // Validate productId and updates here

    const result = await Inventory.findOneAndUpdate(
      { product: productId },
      updates,
      options
    );

    res.status(StatusCodes.OK).json({
      status: "success",
      msg: "Inventory updated successfully",
      inventory: result,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: "error",
      msg: "Failed to update inventory: " + error.message,
    });
  }
};


const deleteInventoryByProduct = async (req, res) => {
  try {
    const productId = req.params.productId;

    // Optionally check if the product exists here

    const deletedInventory = await Inventory.findOneAndDelete({
      product: productId,
    });

    if (!deletedInventory) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ status: "error", msg: "Inventory not found" });
    }

    res.status(StatusCodes.OK).json({
      status: "success",
      msg: "Inventory deleted successfully",
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: "error",
      msg: "Failed to delete inventory: " + error.message,
    });
  }
};


module.exports = {
  createInventory,
  getInventory,
  getInventoryByProduct,
  updateInventory,
  deleteInventoryByProduct,
};

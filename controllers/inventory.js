const Inventory = require("../models/Inventory");
const { StatusCodes } = require("http-status-codes");

const createInventory = async (req, res) => {
  try {
    const productId = req.params.productId;
    const { quantity } = req.body;

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
      msg: error.message,
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
      msg: error.message,
    });
  }
};

const updateInventory = async (req, res) => {
  try {
    const productId = req.params.productId;
    const updates = req.body;
    const options = { new: true, upsert: true };

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
      msg: error.message,
    });
  }
};

const deleteInventoryByProduct = async (req, res) => {
  try {
    const productId = req.params.productId;

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
      msg: error.message,
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

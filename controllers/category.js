const Category = require("../models/Category");
const { StatusCodes } = require("http-status-codes");

const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const newCategory = new Category({ name, description });
    const savedCategory = await newCategory.save();
    res
      .status(StatusCodes.CREATED)
      .json({ status: "success", category: savedCategory });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "error", msg: error.message });
  }
};

const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({});
    res.status(StatusCodes.OK).json({ status: "success", categories });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "error", msg: error.message });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const category = await Category.findById(categoryId);

    if (!category) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ status: "error", msg: "Category not found" });
    }

    res.status(StatusCodes.OK).json({ status: "success", category });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "error", msg: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const updates = req.body;
    const options = { new: true };

    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      updates,
      options
    );

    if (!updatedCategory) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ status: "error", msg: "Category not found" });
    }

    res
      .status(StatusCodes.OK)
      .json({ status: "success", category: updatedCategory });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "error", msg: error.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;

    const deletedCategory = await Category.findByIdAndDelete(categoryId);

    if (!deletedCategory) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ status: "error", msg: "Category not found" });
    }

    res
      .status(StatusCodes.OK)
      .json({ status: "success", msg: "Category deleted successfully" });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "error", msg: error.message });
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};

const Category = require("../models/Category");
const Product = require("../models/Product");
const { StatusCodes } = require("http-status-codes");

const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ status: "error", message: "Category already exists" });
    }

    const category = new Category({ name, description });
    await category.save();

    return res.status(StatusCodes.CREATED).json({
      status: "success",
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: "Failed to create category: " + error.message,
    });
  }
};

const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    return res.status(StatusCodes.OK).json({
      status: "success",
      message: "Categories fetched successfully",
      data: categories,
    });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "error", message: error.message });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const category = await Category.findById(categoryId);

    if (!category) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ status: "error", message: "Category not found" });
    }

    return res.status(StatusCodes.OK).json({
      status: "success",
      message: "Category fetched successfully",
      data: category,
    });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "error", message: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const updates = req.body;

    const categoryExists = await Category.findById(categoryId);
    if (!categoryExists) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ status: "error", message: "Category not found" });
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      updates,
      { new: true }
    );

    return res.status(StatusCodes.OK).json({
      status: "success",
      message: "Category fetched successfully",
      data: updatedCategory,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: "Failed to update category: " + error.message,
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;

    // Check for dependencies (e.g., products associated with this category)
    const dependentProducts = await Product.find({ category: categoryId });
    if (dependentProducts.length > 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: "error",
        message:
          "Cannot delete category as there are products associated with it",
      });
    }

    const deletedCategory = await Category.findByIdAndDelete(categoryId);

    if (!deletedCategory) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ status: "error", message: "Category not found" });
    }

    return res
      .status(StatusCodes.OK)
      .json({ status: "success", message: "Category deleted successfully" });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: "Failed to delete category: " + error.message,
    });
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};

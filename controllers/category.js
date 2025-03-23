const Category = require("../models/Category");
const Product = require("../models/Product");
const { StatusCodes } = require("http-status-codes");

const createCategory = async (req, res) => {
  try {
    const {
      name,
      description,
      image,
      parentCategory,
      status,
      totalProduct,
      homepageDisplay,
    } = req.body;

    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ status: false, message: "Category already exists" });
    }

    const category = new Category({
      name,
      description,
      image,
      parentCategory,
      status,
      totalProduct,
      homepageDisplay,
    });
    await category.save();

    return res.status(StatusCodes.CREATED).json({
      status: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: error.message,
    });
  }
};

const getAllCategories = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [categories, totalCount] = await Promise.all([
      Category.aggregate([
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "category",
            as: "products",
          },
        },
        {
          $addFields: {
            totalProduct: { $size: "$products" },
          },
        },
        {
          $skip: skip,
        },
        {
          $limit: limit,
        },
        {
          $lookup: {
            from: "categories",
            localField: "parentCategory",
            foreignField: "_id",
            as: "parentCategory",
          },
        },
        {
          $unwind: {
            path: "$parentCategory",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            name: 1,
            description: 1,
            image: { $ifNull: ["$image", ""] },
            parentCategory: { $ifNull: ["$parentCategory.name", "-"] },
            status: 1,
            totalProduct: 1,
            homepageDisplay: 1,
          },
        },
      ]),
      Category.countDocuments(),
    ]);

    if (categories.length === 0) {
      return res.status(StatusCodes.OK).json({
        status: false,
        message: "No categories found",
        data: [],
      });
    }

    const totalPages = Math.ceil(totalCount / limit);

    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Categories fetched successfully",
      data: categories,
      totalPages,
      currentPage: page,
      totalCount: totalCount,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Internal Server Error: " + error.message,
    });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const category = await Category.findById(categoryId).populate(
      "parentCategory",
      "name"
    );

    if (!category) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ status: false, message: "Category not found" });
    }

    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Category fetched successfully",
      data: category,
    });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: false, message: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const updates = req.body;

    const categoryExists = await Category.findById(categoryId);
    if (!categoryExists) {
      return res
        .status(StatusCodes.OK)
        .json({ status: false, message: "Category not found" });
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      updates,
      { new: true }
    );

    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Category fetched successfully",
      data: updatedCategory,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Failed to update category: " + error.message,
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;

    const dependentProducts = await Product.find({ category: categoryId });
    if (dependentProducts.length > 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: false,
        message:
          "Cannot delete category as there are products associated with it",
      });
    }

    const deletedCategory = await Category.findByIdAndDelete(categoryId);

    if (!deletedCategory) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ status: false, message: "Category not found" });
    }

    return res
      .status(StatusCodes.OK)
      .json({ status: true, message: "Category deleted successfully" });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Failed to delete category: " + error.message,
    });
  }
};

const getCategoryData = async (req, res) => {
  try {
    const totalCategories = await Category.countDocuments();
    const activeCategories = await Category.countDocuments({
      status: "active",
    });
    const inactiveCategories = await Category.countDocuments({
      status: "inActive",
    });

    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Category data fetched successfully",
      data: {
        totalCategories,
        activeCategories,
        inactiveCategories,
      },
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: error.message,
    });
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getCategoryData,
};

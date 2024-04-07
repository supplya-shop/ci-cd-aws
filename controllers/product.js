const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, UnauthenticatedError } = require("../errors");
const Product = require("../models/Product");
const validateProduct = require("../middleware/validation/productDTO");
const multer = require("../middleware/upload");
const mongoose = require("mongoose");

const createProduct = async (req, res, next) => {
  const userId = req.user.userid;
  const { error, value } = validateProduct(req.body);
  if (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: "error",
      message: error.details.map((detail) => detail.message),
    });
  }
  value.createdBy = userId;
  value.approved = true;
  const newProduct = new Product(value);
  try {
    await newProduct.save();
    return res.status(StatusCodes.CREATED).json({
      status: "success",
      message: "Product created successfully",
      data: newProduct,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Failed to create Product",
      status: "error",
    });
  }
};

const submitProduct = async (req, res, next) => {
  const userId = req.user.userid;
  const { error, value } = validateProduct(req.body);
  if (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: "error",
      message: error.details.map((detail) => detail.message),
    });
  }
  value.createdBy = userId;
  value.approved = false;

  const newProduct = new Product(value);
  try {
    await newProduct.save();
    return res.status(StatusCodes.CREATED).json({
      message: "Product successfully submitted for approval",
      status: "success",
    });
  } catch (error) {
    console.error(error.message);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Failed to create Product",
      status: "error",
    });
  }
};

const getAllProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const totalProducts = await Product.countDocuments();
    const totalPages = Math.ceil(totalProducts / limit);

    const products = await Product.find({})
      .populate({
        path: "createdBy",
        select:
          "firstName lastName email country state city postalCode gender businessName phoneNumber accountNumber bank role",
      })
      .populate("category", "name")
      .select(
        "name price description quantity category image images brand createdBy inStock rating numReviews isFeatured hasDiscount flashsale saleCount dateCreated moq approved"
      )
      .limit(limit)
      .skip(startIndex);

    if (products.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: "error",
        message: "No products found",
      });
    }

    return res.status(StatusCodes.OK).json({
      status: "success",
      message: "Products fetched successfully",
      data: products,
      currentPage: page,
      totalPages: totalPages,
      totalProducts: totalProducts,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: "Failed to fetch products",
    });
  }
};

const getRelatedProducts = async (req, res) => {
  try {
    const productId = req.params.id;
    console.log(`productId: ${productId}`);
    const currentProduct = await Product.findById(productId);
    console.log(`currentProduct: ${currentProduct}`);
    if (!currentProduct) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ status: "error", message: "Product not found" });
    }

    const relatedProducts = await Product.find({
      category: currentProduct.category,
      _id: { $ne: productId },
    })
      .limit(10)
      .select("name price description image");

    return res.status(StatusCodes.OK).json({
      status: "success",
      message: "Products fetched successfully",
      data: relatedProducts,
    });
  } catch (error) {
    console.error("Error fetching related products:", error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error", status: "error" });
  }
};

const getProductsByVendor = async (req, res) => {
  try {
    const vendorId = req.user.userid;
    const products = await Product.find({ createdBy: vendorId });
    if (!products || products.length === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ status: "error", message: "No products could be found" });
    }
    return res.status(StatusCodes.OK).json({
      status: "success",
      message: "Products fetched successfully",
      data: products,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "error", message: "Internal server error" });
  }
};

const getProductsByBrand = async (req, res) => {
  try {
    let brand = req.params.brand;
    brand = brand.toLowerCase();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const totalProducts = await Product.countDocuments({
      brand: { $regex: new RegExp(brand, "i") },
    });
    const totalPages = Math.ceil(totalProducts / limit);
    const products = await Product.find({
      brand: { $regex: new RegExp(brand, "i") },
    })
      .populate({
        path: "createdBy",
        select:
          "firstName lastName email country state city postalCode gender businessName phoneNumber accountNumber bank role",
      })
      .limit(limit)
      .skip(startIndex);
    if (products.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: "error",
        message: "No products found for the given brand",
      });
    }
    return res.status(StatusCodes.OK).json({
      status: "success",
      message: "Products fetched successfully",
      data: products,
      currentPage: page,
      totalPages: totalPages,
      totalProducts: totalProducts,
    });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "error", message: error.message });
  }
};

const getDiscountedProducts = async (req, res) => {
  try {
    const discountedProducts = await Product.find({ hasDiscount: true });
    if (!discountedProducts || discountedProducts.length === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ status: "error", message: "No products found with discount" });
    }
    return res.json({
      status: "success",
      message: "Products fetched successfully",
      data: discountedProducts,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "error", message: error.message });
  }
};

const getFlashsaleProducts = async (req, res) => {
  try {
    const flashsaleProducts = await Product.find({ flashsale: true });
    if (flashsaleProducts.length === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ status: "error", message: "No flashsale products found" });
    }
    return res.json({
      status: "success",
      message: "Products fetched successfully",
      data: flashsaleProducts,
    });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "error", message: error.message });
  }
};

const getNewlyArrivedBrands = async (req, res, next) => {
  try {
    const response = await Product.find({}).sort({ dateCreated: -1 }).limit(10);
    const brandMap = new Map();
    response.forEach((product) => {
      const brand = product.brand;
      if (!brandMap.has(brand)) {
        brandMap.set(brand, product.toObject());
      }
    });
    const products = Array.from(brandMap.values());

    return res
      .status(StatusCodes.OK)
      .json({ status: "success", data: products });
  } catch (error) {
    console.error(error.message);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: error.message,
    });
  }
};

const getProductById = async (req, res, next) => {
  const productId = req.params.id;
  Product.findById(productId)
    .populate({
      path: "createdBy",
      select:
        "firstName lastName email country state city postalCode gender businessName phoneNumber accountNumber bank role", // Specify the fields you want to include from the User schema
    })
    .populate("category", "name")
    .select(
      "name price description quantity category image images brand createdBy inStock rating numReviews isFeatured hasDiscount flashsale saleCount dateCreated moq approved"
    )
    .then((product) => {
      if (!product) {
        return res.status(StatusCodes.NOT_FOUND).json({
          status: "error",
          message: "Product not found",
        });
      }
      return res.status(StatusCodes.OK).json({
        status: "success",
        message: "Product fetched successfully",
        data: product,
      });
    })
    .catch((error) => {
      console.error(error.message);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: "error",
        message: "Failed to fetch product",
      });
    });
};

const updateProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const updates = req.body;
    const options = { new: true };

    const result = await Product.findByIdAndUpdate(productId, updates, options);
    if (!result) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ status: "error", message: "Product not found" });
    }
    return res.status(StatusCodes.OK).json({
      status: "success",
      message: "Product updated successfully",
      data: result,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: "Failed to update product",
    });
  }
};

const uploadProductImages = async (req, res, next) => {
  try {
    return res.status(StatusCodes.OK).json({
      success: "success",
      image_url: `${process.env.IMAGE_BASE_URL}/${req.file.filename}`,
    });
  } catch (error) {
    console.error(error.message);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "error", message: "Failed to upload product images" });
  }
};

const approveProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "Product not found",
        status: "error",
      });
    }

    product.approved = true;
    await product.save();

    return res.status(StatusCodes.OK).json({
      message: "Product successfully approved",
      status: "success",
      data: product,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Failed to approve product",
      status: "error",
    });
  }
};

const deleteProduct = async (req, res, next) => {
  const productId = req.params.id;
  try {
    const product = await Product.findByIdAndDelete(productId);
    if (!product) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: "error",
        message: `Product with id ${productId} not found.`,
      });
    }
    console.log(result);
    return res
      .status(StatusCodes.OK)
      .json({ status: "success", message: "Product deleted successfully" });
  } catch (error) {
    console.log(error.message);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "error", message: "Failed to delete product" });
  }
};

module.exports = {
  createProduct,
  submitProduct,
  approveProduct,
  getAllProducts,
  getProductsByVendor,
  getProductsByBrand,
  getNewlyArrivedBrands,
  getProductById,
  getRelatedProducts,
  getFlashsaleProducts,
  getDiscountedProducts,
  updateProduct,
  uploadProductImages,
  deleteProduct,
};

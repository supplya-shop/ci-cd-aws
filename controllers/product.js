const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, UnauthenticatedError } = require("../errors");
const Product = require("../models/Product");
const validateProduct = require("../middleware/validation/productDTO");
const multer = require("../middleware/upload");

const createProduct = async (req, res, next) => {
  const userId = req.user.userid;
  const { error, value } = validateProduct(req.body);
  if (error) {
    return res
      .status(400)
      .json({ error: error.details.map((detail) => detail.message) });
  }
  const newProduct = new Product(value);
  try {
    await newProduct.save();
    res
      .status(201)
      .json({ message: "Product created successfully", status: "success" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      error: { message: "Failed to create Product", status: "error" },
    });
  }
};

const getAllProducts = async (req, res, next) => {
  await Product.find({})
    .populate({
      path: "createdBy", // Referencing the 'createdBy' field from the Product schema
      select:
        "firstName lastName email country state city postalCode gender businessName phoneNumber accountNumber bank role", // Specify the fields you want to include from the User schema
    })
    .then((products) => {
      res.status(200).json({ products, count: products.length });
    })
    .catch((err) => {
      console.error(err.message);
      res.status(500).json({
        error: {
          message: "Failed to fetch products",
          status: "error",
        },
      });
    });
};

const getRelatedProducts = async (req, res) => {
  try {
    const productId = req.params.id;
    console.log(`productId: ${productId}`);
    const currentProduct = await Product.findById(productId);
    console.log(`currentProduct: ${currentProduct}`);
    if (!currentProduct) {
      return res
        .status(404)
        .json({ status: "error", message: "Product not found" });
    }

    const relatedProducts = await Product.find({
      category: Product.category,
      _id: { $ne: productId }, // Exclude the original product
    })
      .limit(10)
      .select("name price description image");

    res
      .status(200)
      .json({ status: "success", relatedProducts: relatedProducts });
  } catch (error) {
    console.error("Error fetching related products:", error);
    res.status(500).json({ message: "Internal Server Error", status: "error" });
  }
};

const getNewlyArrivedBrands = async (req, res, next) => {
  try {
    const products = await Product.find({}).sort({ dateCreated: -1 }).limit(10);
    const brandMap = new Map();
    products.forEach((product) => {
      const brand = product.brand;
      if (!brandMap.has(brand)) {
        brandMap.set(brand, product.toObject());
      }
    });
    const response = {
      status: "success",
      message: "Products fetched successfully",
      data: Array.from(brandMap.values()),
    };
    res.status(StatusCodes.OK).json(response);
  } catch (error) {
    console.error(error.message);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: "Failed to fetch products",
      error: error.message,
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
    .then((product) => {
      if (!product) {
        return res.status(404).json({
          status: "error",
          message: "Product not found",
        });
      }
      res.status(200).json(product);
    })
    .catch((err) => {
      console.error(err.message);
      res.status(500).json({
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
        .status(404)
        .json({ status: "error", message: "Product not found" });
    }
    res.status(200).json({
      status: "success",
      message: "Product updated successfully",
      product: result,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      status: "error",
      message: "Failed to update product",
    });
  }
};

const uploadProductImages = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        status: "error",
        message: "Product not found",
      });
    }

    product.images = req.body.images;

    const savedProduct = await product.save();
    res.json({
      status: "success",
      product: savedProduct,
    });
  } catch (error) {
    console.error(error.message);
    res
      .status(500)
      .json({ status: "error", message: "Failed to upload product images" });
  }
};

const deleteProduct = async (req, res, next) => {
  const productId = req.params.id;
  try {
    const result = await Product.findByIdAndDelete(productId);
    console.log(result);
    res.json({ status: "success", message: "Product deleted successfully" });
  } catch (error) {
    console.log(error.message);
    res
      .status(500)
      .json({ status: "error", message: "Failed to delete product" });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getNewlyArrivedBrands,
  getProductById,
  getRelatedProducts,
  updateProduct,
  uploadProductImages,
  deleteProduct,
};

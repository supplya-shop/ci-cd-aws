const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, UnauthenticatedError } = require("../errors");
const Product = require("../models/Product");
const multer = require("../middleware/upload");

const createProduct = async (req, res, next) => {
  const newProduct = new Product({
    name: req.body.name,
    price: req.body.price,
    description: req.body.description,
    quantity: req.body.quantity,
    category: req.body.category,
    image: req.file ? req.file.filename : "",
    images: req.body.images,
    brand: req.body.brand,
    countInStock: req.body.inStock,
    rating: req.body.rating,
    numReviews: req.body.numReviews,
    isFeatured: req.body.isFeatured,
    hasDiscount: req.body.hasDiscount,
    dateCreated: Date.now(),
  });
  newProduct
    .save()
    .then((result) => {
      console.log(result);
      res.status(201).json({
        message: "Product created successfully",
        product: result,
      });
    })
    .catch((err) => {
      console.error(err.message);
      res.status(500).json({
        error: {
          message: "Failed to create product",
        },
      });
    });
};

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json({ products, count: products.length });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      error: { message: "Failed to fetch products" },
    });
  }
};


const getProductById = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      error: { message: "Failed to fetch product" },
    });
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const updates = req.body;
    const options = { new: true };

    const result = await Product.findByIdAndUpdate(productId, updates, options);
    if (!result) {
      return res.status(404).json({ message: "Product not found" });
    }
    res
      .status(200)
      .json({ message: "Product updated successfully", product: result });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: { message: "Failed to update product" } });
  }
};

const uploadProductImages = async (req, res) => {
  try {
    const productId = req.params.id;
    const productToUpdate = await product.findById(productId);

    if (!productToUpdate) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Add validation for req.body.images if necessary

    productToUpdate.images = req.body.images;
    const savedProduct = await productToUpdate.save();
    res.status(200).json({
      message: "Product images uploaded successfully",
      product: savedProduct,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      error: { message: "Failed to upload product images" },
    });
  }
};


const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    await product.findByIdAndDelete(productId);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: { message: "Failed to delete product" } });
  }
};


module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  uploadProductImages,
  deleteProduct,
};

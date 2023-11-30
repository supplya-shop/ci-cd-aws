const express = require("express");
const router = express.Router();
const {
  createProduct,
  getAllProducts,
  getProductById,
  getNewlyArrivedBrands,
  updateProduct,
  uploadProductImages,
  deleteProduct,
} = require("../controllers/product");

//product routes
router.post("/create", createProduct);
router.get("/", getAllProducts);
router.get("/newly-arrived-brands", getNewlyArrivedBrands);
router.get("/:id", getProductById);
router.patch("/:id", updateProduct);
router.post("/images/upload", uploadProductImages);
router.delete("/:id", deleteProduct);

module.exports = router;

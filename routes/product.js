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
  getRelatedProducts,
} = require("../controllers/product");

const authenticateUser = require("../middleware/authenticateUser");

//product routes
router.post("/create", authenticateUser, createProduct);
router.get("/", getAllProducts);
router.get("/newly-arrived-brands", getNewlyArrivedBrands);
router.get("/:id", getProductById);
router.get("/:id/get-related", getRelatedProducts);
router.patch("/:id", authenticateUser, updateProduct);
router.post("/images/upload", authenticateUser, uploadProductImages);
router.delete("/:id", authenticateUser, deleteProduct);

module.exports = router;

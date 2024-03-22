const express = require("express");
const router = express.Router();
const {
  createProduct,
  getAllProducts,
  getProductById,
  getProductsByBrand,
  getNewlyArrivedBrands,
  getDiscountedProducts,
  getFlashsaleProducts,
  updateProduct,
  uploadProductImages,
  deleteProduct,
  getRelatedProducts,
} = require("../controllers/product");

const {
  authenticateUser,
  rolesAllowed,
} = require("../middleware/authenticateUser");
//product routes
router.post(
  "/create",
  authenticateUser,
  rolesAllowed("vendor, admin"),
  createProduct
);
router.get("/", getAllProducts);
router.get("/brands/:brand", getProductsByBrand);
router.get("/newly-arrived-brands", getNewlyArrivedBrands);
router.get("/deals", getDiscountedProducts);
router.get("/flashsale", getFlashsaleProducts);
router.get("/:id", getProductById);
router.get("/:id/get-related", getRelatedProducts);
router.patch(
  "/:id",
  authenticateUser,
  rolesAllowed("vendor, admin"),
  updateProduct
);
router.post("/images/upload", authenticateUser, uploadProductImages);
router.delete(
  "/:id",
  authenticateUser,
  rolesAllowed("vendor, admin"),
  deleteProduct
);

module.exports = router;

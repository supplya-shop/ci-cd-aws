const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const {
  createProduct,
  submitProduct,
  duplicateProduct,
  approveProduct,
  getAllProducts,
  getProductById,
  getProductsByUserId,
  getProductsByVendor,
  getProductsByBrand,
  getProductsByCategory,
  getNewlyArrivedBrands,
  getDiscountedProducts,
  getFlashsaleProducts,
  updateProduct,
  uploadProductImage,
  getRelatedProducts,
  deleteProduct,
  deleteProductsWithoutVendor,
  bulkdeleteProducts,
  searchProducts,
} = require("../controllers/product");

const {
  authenticateUser,
  rolesAllowed,
} = require("../middleware/authenticateUser");

// image storage engine
const storage = multer.diskStorage({
  destination: "./assets/images",
  filename: (req, file, cb) => {
    return cb(
      null,
      `${file.fieldname}_${Date.now()}_${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({
  storage: storage,
});

//product routes
router.post(
  "/create",
  authenticateUser,
  rolesAllowed("vendor, admin"),
  createProduct
);
router.post(
  "/submit",
  authenticateUser,
  rolesAllowed("vendor, admin"),
  submitProduct
);
router.post(
  "/:productId/duplicate",
  authenticateUser,
  rolesAllowed("vendor, admin"),
  duplicateProduct
);
router.patch(
  "/approve/:id",
  authenticateUser,
  rolesAllowed("admin"),
  approveProduct
);
router.delete(
  "/delete-products-without-vendor",
  authenticateUser,
  deleteProductsWithoutVendor
);
router.get("/deals", getDiscountedProducts);
router.get("/category/:category", getProductsByCategory);
router.get("/newly-arrived-brands", getNewlyArrivedBrands);
router.get("/", getAllProducts);
router.get("/vendor", authenticateUser, getProductsByVendor);
router.get("/search", searchProducts);
router.get("/flashsale", getFlashsaleProducts);
router.get("/:id", getProductById);
router.get("/user/:userId", getProductsByUserId);
router.get("/brands/:brand", getProductsByBrand);
router.get("/:id/get-related", getRelatedProducts);
router.post(
  "/images/upload",
  upload.single("product"),
  authenticateUser,
  uploadProductImage
);
router.get("/images");
router.patch(
  "/:id",
  authenticateUser,
  rolesAllowed("vendor, admin"),
  updateProduct
);
router.delete(
  "/:id",
  authenticateUser,
  rolesAllowed("vendor, admin"),
  deleteProduct
);

router.delete(
  "/bulk-delete",
  authenticateUser,
  rolesAllowed("admin"),
  bulkdeleteProducts
),
  (module.exports = router);

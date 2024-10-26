const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const {
  importProducts,
  createProduct,
  submitProduct,
  duplicateProduct,
  approveProduct,
  getAllProducts,
  getProductById,
  getProductsByStoreName,
  getProductsByUserId,
  getProductsByVendor,
  getProductsByBrand,
  getProductsByCategory,
  getNewlyArrivedBrands,
  getDealsOfTheDay,
  getTrendingProducts,
  getDiscountedProducts,
  specialDeals,
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
// const storage = multer.diskStorage({
//   destination: "./assets/images",
//   filename: (req, file, cb) => {
//     return cb(
//       null,
//       `${file.fieldname}_${Date.now()}_${path.extname(file.originalname)}`
//     );
//   },
// });

// const upload = multer({
//   storage: storage,
// });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads/products/"));
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 3000000 }, // 3MB limit
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

function checkFileType(file, cb) {
  const filetypes = /csv|xlsx/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype =
    file.mimetype === "text/csv" ||
    file.mimetype ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error(".csv or .xlsx files only!"));
  }
}

//product routes
router.post("/import", upload.single("file"), importProducts);
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
router.get("/discounted", getDiscountedProducts);
router.get("/deals", getDealsOfTheDay);
router.get("/trending", getTrendingProducts);
router.get("/category/:category", getProductsByCategory);
router.get("/newly-arrived-brands", getNewlyArrivedBrands);
router.get("/", getAllProducts);
router.get("/vendor", authenticateUser, getProductsByVendor);
router.get("/store/:storeName", getProductsByStoreName);
router.get("/search", searchProducts);
router.get("/flashsale", getFlashsaleProducts);
router.get("/special-deals", specialDeals);
router.get("/:id", getProductById);
router.get("/user/:userId", getProductsByUserId);
router.get("/brands/:brand", getProductsByBrand);
router.get("/:id/get-related", getRelatedProducts);

// router.post(
//   "/images/upload",
//   upload.single("product"),
//   authenticateUser,
//   uploadProductImage
// );
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

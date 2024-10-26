const express = require("express");
const router = express.Router();
const passport = require("passport");
const {
  getDashboardStats,
  getProductDashboardStats,
  getOrderDashboardStats,
  getCustomerStats,
  getVendorStats,
  getAdminStats,
  assignProductToVendor,
  getMostBoughtProducts,
  getUserSignupStats,
  getOrderStats,
  bulkUploadUsers,
} = require("../controllers/admin");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const {
  authenticateUser,
  rolesAllowed,
} = require("../middleware/authenticateUser");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads/users");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 3000000 },
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

router.get(
  "/dashboard",
  authenticateUser,
  rolesAllowed("admin"),
  getDashboardStats
);
router.get(
  "/dashboard/product",
  authenticateUser,
  rolesAllowed("admin"),
  getProductDashboardStats
);
router.get(
  "/dashboard/order",
  authenticateUser,
  rolesAllowed("admin"),
  getOrderDashboardStats
);
router.get(
  "/dashboard/customer",
  authenticateUser,
  rolesAllowed("admin"),
  getCustomerStats
);
router.get("/product/popular", authenticateUser, getMostBoughtProducts);
router.get(
  "/dashboard/vendor",
  authenticateUser,
  rolesAllowed("admin"),
  getVendorStats
);
router.get(
  "/dashboard/admin",
  authenticateUser,
  rolesAllowed("admin"),
  getAdminStats
);
router.get(
  "/dashboard/signup-stats",
  authenticateUser,
  rolesAllowed("admin"),
  getUserSignupStats
);
router.get(
  "/dashboard/sales-stats",
  authenticateUser,
  rolesAllowed("admin"),
  getOrderStats
);
router.post(
  "/dashboard/users/import",
  authenticateUser,
  rolesAllowed("admin"),
  upload.single("file"),
  bulkUploadUsers
);
router.post("/assign-product", authenticateUser, assignProductToVendor);

module.exports = router;

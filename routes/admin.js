const express = require("express");
const router = express.Router();
const passport = require("passport");
const {
  getDashboardStats,
  getProductDashboardStats,
  getOrderDashboardStats,
  getCustomerStats,
  getVendorStats,
} = require("../controllers/admin");
const {
  authenticateUser,
  rolesAllowed,
} = require("../middleware/authenticateUser");

router.get("/dashboard", rolesAllowed("admin"), getDashboardStats);
router.get(
  "/dashboard/product",
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
router.get(
  "/dashboard/vendor",
  authenticateUser,
  rolesAllowed("admin"),
  getVendorStats
);

module.exports = router;

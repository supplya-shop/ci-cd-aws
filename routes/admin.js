const express = require("express");
const router = express.Router();
const passport = require("passport");
const {
  getDashboardStats,
  getProductDashboardStats,
} = require("../controllers/admin");
const {
  authenticateUser,
  rolesAllowed,
} = require("../middleware/authenticateUser");

router.get("/dashboard", getDashboardStats);
router.get("/products/dashboard", getProductDashboardStats);

module.exports = router;

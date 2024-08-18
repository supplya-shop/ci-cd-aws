const express = require("express");
const router = express.Router();
const {
  createVendor,
  checkStoreNameAvailability,
  createStore,
  getVendorByStoreName,
  getAllVendors,
  getVendorById,
  updateOrderStatus,
  deleteVendor,
} = require("../controllers/vendor");

const {
  authenticateUser,
  rolesAllowed,
} = require("../middleware/authenticateUser");

//user routes
router.post("/create", authenticateUser, createVendor);
router.get("/validate-store-name", checkStoreNameAvailability);
router.get("/", authenticateUser, getAllVendors);
router.get("/:storeName", getVendorByStoreName);
router.get("/:id", authenticateUser, getVendorById);
router.patch("/order/:orderId", authenticateUser, updateOrderStatus);
router.delete("/:id", authenticateUser, deleteVendor);

module.exports = router;

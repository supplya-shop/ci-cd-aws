const express = require("express");
const router = express.Router();
const {
  createVendor,
  checkStoreNameAvailability,
  createStore,
  getAllVendors,
  getVendorById,
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
router.get("/:id", authenticateUser, getVendorById);
router.delete("/:id", authenticateUser, deleteVendor);

module.exports = router;

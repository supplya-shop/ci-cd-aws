const express = require("express");
const router = express.Router();
const {
  createVendor,
  createStore,
  getAllVendors,
  getVendorById,
  updateVendor,
  deleteVendor,
} = require("../controllers/vendor");

const {
  authenticateUser,
  rolesAllowed,
} = require("../middleware/authenticateUser");

//user routes
router.post("/create", authenticateUser, createVendor);
router.get("/", authenticateUser, getAllVendors);
router.get("/:id", authenticateUser, getVendorById);
router.put("/:id", authenticateUser, updateVendor);
router.delete("/:id", authenticateUser, deleteVendor);

module.exports = router;

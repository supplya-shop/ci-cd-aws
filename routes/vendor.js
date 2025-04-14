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
  uploadStoreBanners,
  getStoreBanners,
  patchStoreBanners,
  uploadHomepageBanner,
} = require("../controllers/vendor");

const {
  authenticateUser,
  rolesAllowed,
} = require("../middleware/authenticateUser");

router.get("/store-banners", authenticateUser, getStoreBanners);
//user routes
router.post("/create", authenticateUser, createVendor);
router.get("/validate-store-name", checkStoreNameAvailability);
router.get("/", authenticateUser, getAllVendors);
router.get("/:storeName", getVendorByStoreName);
router.get("/:id", authenticateUser, getVendorById);
router.patch("/order/:orderId", authenticateUser, updateOrderStatus);
router.patch("/store-banners", patchStoreBanners);
router.delete("/:id", authenticateUser, deleteVendor);
router.post(
  "/store-banners",
  authenticateUser,
  rolesAllowed("vendor"),
  uploadStoreBanners
);

module.exports = router;

const express = require("express");
const {
  uploadHomepageBanners,
  getBannersByTag,
  getBannersByUser,
  getAllBanners,
  getAdminHomepageBanners,
  updateBanner,
  deleteBanner,
} = require("../controllers/media");

const router = express.Router();
const {
  authenticateUser,
  rolesAllowed,
} = require("../middleware/authenticateUser");

router.post(
  "/banners/homepage-banners",
  authenticateUser,
  uploadHomepageBanners
);
router.get("/banners/tag", getBannersByTag);
router.get("/banners/:id", getBannersByUser);
router.get("/banners/all", getAllBanners);
router.get("/admin/banners/homepage", getAdminHomepageBanners);
router.put("/banners/:id", updateBanner);
router.delete("/:id", deleteBanner);

module.exports = router;

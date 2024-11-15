const express = require("express");
const router = express.Router();
const {
  createPromoCode,
  updatePromoCode,
  getPromoCodes,
  deletePromoCode,
  applyPromoCode,
} = require("../controllers/promocode");
const { authenticateUser } = require("../middleware/authenticateUser");

router.post("/", authenticateUser, createPromoCode);
router.patch("/:id", authenticateUser, updatePromoCode);
router.get("/", authenticateUser, getPromoCodes);
router.get("/:id", authenticateUser, getPromoCodes);
router.delete("/:id", authenticateUser, deletePromoCode);
router.post("/apply", authenticateUser, applyPromoCode);
module.exports = router;

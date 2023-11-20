const express = require("express");
const router = express.Router();
const authenticateUser = require("../middleware/authenticateUser");
const {
  createInventory,
  getInventory,
  getInventoryByProduct,
  updateInventory,
  deleteInventoryByProduct,
} = require("../controllers/inventory");

router.post("/:productId", authenticateUser, createInventory);
router.get("/", authenticateUser, getInventory);
router.get("/:productId", authenticateUser, getInventoryByProduct);
router.put("/:productId", authenticateUser, updateInventory);
router.delete("/:productId", authenticateUser, deleteInventoryByProduct);

module.exports = router;

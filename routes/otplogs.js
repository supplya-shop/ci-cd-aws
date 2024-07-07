const express = require("express");
const router = express.Router();
const { getAllOtpLogs, bulkdeleteOtpLogs } = require("../controllers/otplogs");

const {
  authenticateUser,
  rolesAllowed,
} = require("../middleware/authenticateUser");

//otplog routes
router.get("/", authenticateUser, rolesAllowed("admin"), getAllOtpLogs);
router.delete("/", authenticateUser, rolesAllowed("admin"), bulkdeleteOtpLogs);

module.exports = router;

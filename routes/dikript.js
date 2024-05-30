const { verifyPhoneNo } = require("../service/DikriptService");
const express = require("express");
const router = express.Router();

router.get("/verify-phone", verifyPhoneNo);

module.exports = router;

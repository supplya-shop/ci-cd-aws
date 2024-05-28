const { verifyPhoneNo } = require("../service/DikriptService");
const express = require("express");
const router = express.Router();

// const dikriptService = ;

// router.get("/verify-phone", async (req, res) => {
//   await dikriptService.verifyPhoneNo(req, res);
// });

router.get("/verify-phone", verifyPhoneNo);

module.exports = router;

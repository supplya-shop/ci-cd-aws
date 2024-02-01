// const router = express.Router()
// const upload = require('../middleware/upload')

// const {regCustomerOnAnchor} = require('../controllers/anchor')

// // Use the custom middleware for the '/kyc' route
// router.post('/kyc', upload, regCustomerOnAnchor);

const AnchorService = require("../service/AnchorService");
const authenticateUser = require("../middleware/authenticateUser");
const express = require("express");
const router = express.Router();
const apiKey = process.env.ANCHOR;

const anchorService = new AnchorService(apiKey);

router.get("/listAllCustomers", authenticateUser, async (req, res) => {
  try {
    await anchorService.authenticate();
    const result = await anchorService.listAllCustomers();
    res.json(result.data);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/createCustomer", async (req, res) => {
  try {
    await anchorService.authenticate();
    const customerData = req.body;
    const result = await anchorService.createCustomer(customerData);
    res.json(result.data);
  } catch (error) {
    console.error(error);
    const status = error.response ? error.response.status : 500;
    res.status(status).json({ error: "Internal Server Error", details: error });
  }
});

module.exports = router;

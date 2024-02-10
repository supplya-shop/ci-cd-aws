const express = require("express");
const router = express.Router();
const { StatusCodes } = require("http-status-codes");
const curacelApi = require("../api/curacel/customers");
const CuracelService = require("../service/CuracelService");
const curacelService = new CuracelService(process.env.CURACEL_API_KEY);

// customers
// create customers
router.post("/customers/create", async (req, res) => {
  try {
    const customerData = req.body;
    const newCustomer = await curacelService.createNewCustomer(customerData);
    console.log(newCustomer);
    res.status(200).json(newCustomer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// get all customers
router.get("/customers", async (req, res) => {
  try {
    const customers = await curacelService.getCustomers();
    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// get single customer
router.get("/customers/:ref", async (req, res) => {
  const customerRef = req.params.ref;

  try {
    const customerDetails = await curacelService.getCustomerDetails(
      customerRef
    );
    res.status(200).json(customerDetails);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// debit-notes
router.get("/debit-notes", async (req, res) => {
  try {
    const debitNotes = await curacelService.getDebitNotes();
    res.status(200).json(debitNotes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/debit-notes/details", async (req, res) => {
  try {
    const debitNoteDetails = await curacelService.getDebitNoteDetails();
    res.status(200).json(debitNoteDetails);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// products
router.get("/products/list-product-types", async (req, res) => {
  try {
    const productTypes = await curacelService.listProductTypes();
    res.status(200).json(productTypes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/products/list-available-insurance-products", async (req, res) => {
  try {
    const productTypes = await curacelService.listAvailableInsuranceProducts(
      process.env.CURACEL_BASE_URL
    );
    res.status(200).json(productTypes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/products/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    const productDetails = await curacelService.fetchSingleInsuranceProduct(
      productId
    );
    res.status(200).json(productDetails);
  } catch (error) {
    if (error.status === 404) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ msg: error.message, status: "error" });
    }
    res.status(500).json({ error: error.message });
  }
});

router.get("/credit-requests", async (req, res) => {
  try {
    const creditRequests = await curacelService.fetchCreditRequests();
    res.status(200).json(creditRequests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/credit-notes", async (req, res) => {
  try {
    const creditNotes = await curacelService.getCreditNotes();
    res.status(200).json(creditNotes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

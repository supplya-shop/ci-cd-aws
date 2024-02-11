const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

const { regCustomerOnAnchor } = require("../controllers/anchor");

// Use the custom middleware for the '/kyc' route
router.post("/kyc", upload, regCustomerOnAnchor);

// const AnchorService = require("../service/AnchorService");
// const authenticateUser = require("../middleware/authenticateUser");
// const express = require("express");
// const router = express.Router();
// const apiKey = process.env.ANCHOR;

// const anchorService = new AnchorService(apiKey);

// router.post("/createCustomer", async (req, res) => {
//   try {
//     const customerData = req.body;
//     await anchorService.authenticate();
//     const result = await anchorService.createCustomer(customerData);
//     res.json(result.data);
//   } catch (error) {
//     console.error(error);
//     const status = error.response ? error.response.status : 500;
//     res.status(status).json({ error: "Internal Server Error", details: error });
//   }
// });

// router.put("/updateCustomer/:customerId", async (req, res) => {
//   try {
//     const customerId = req.params.customerId;
//     const updateData = req.body;

//     await anchorService.authenticate();

//     const result = await anchorService.updateCustomer(customerId, {
//       data: {
//         attributes: {
//           identificationLevel2: {
//             dateOfBirth: updateData.dateOfBirth,
//             gender: updateData.gender,
//             bvn: updateData.bvn,
//             selfieImage: updateData.selfieImage,
//           },
//           //   fullname: {
//           //     firstName: updateData.firstName,
//           //     lastName: updateData.lastName,
//           //     middleName: updateData.middleName,
//           //     maidenName: updateData.maidenName,
//           //   },
//           email: updateData.email,
//           phoneNumber: updateData.phoneNumber,
//           doingBusinessAs: updateData.doingBusinessAs,
//           description: updateData.description,
//         },
//         type: "IndividualCustomer",
//       },
//     });

//     res.json(result.data);
//   } catch (error) {
//     console.error(error);
//     const status = error.response ? error.response.status : 500;
//     res.status(status).json({ error: "Internal Server Error", details: error });
//   }
// });

// router.get("/listAllCustomers", async (req, res) => {
//   try {
//     await anchorService.authenticate();
//     const result = await anchorService.listAllCustomers();
//     res.json(result.data);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Internal Server Error");
//   }
// });

// router.get("/fetchCustomer/:customerId", async (req, res, next) => {
//   try {
//     const customerId = req.params.customerId;
//     await anchorService.authenticate();
//     const customerData = await anchorService.fetchCustomer(customerId);
//     res.json(customerData);
//   } catch (error) {
//     console.error(error);
//     const status = error.response ? error.response.status : 500;
//     res.status(status).json({ error: "Internal Server Error", details: error });
//   }
// });

// //kycValidation
// //individual

// router.post("/kycValidation/:customerId", async (req, res) => {
//   try {
//     const customerId = req.params.customerId;
//     const kycData = req.body;
//     const result = await anchorService.kycValidationIndividual(kycData, customerId);
//     res.json(result);
//   } catch (error) {
//     console.error(error);
//     const status = error.response ? error.response.status : 500;
//     res.status(status).json({ error: "Internal Server Error", details: error });
//   }
// });

// // business
// router.post("/kycValidation_1/:customerId", async (req, res) => {
//   try {
//     const customerId = req.params.customerId;
//     const result = await anchorService.kycValidationBusiness(customerId, req.body);
//     res.json(result);
//   } catch (error) {
//     console.error(error);
//     const status = error.response ? error.response.status : 500;
//     res.status(status).json({ error: "Internal Server Error", details: error });
//   }
// });

module.exports = router;

const express = require('express')
const router = express.Router()
const upload = require('../middleware/upload')



const {regCustomerOnAnchor} = require('../controllers/anchor')

// Use the custom middleware for the '/kyc' route
router.post('/kyc', upload, regCustomerOnAnchor);
module.exports = router
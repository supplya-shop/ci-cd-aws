const express = require('express')
const router = express.Router()



const {regCustomerOnAnchor} = require('../controllers/auth')

router.post('/kyc', upload.single('file'), regCustomerOnAnchor)

module.exports = router
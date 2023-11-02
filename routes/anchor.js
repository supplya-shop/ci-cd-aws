const express = require('express')
const router = express.Router()
const upload = require('../middleware/upload')



const {regCustomerOnAnchor} = require('../controllers/auth')

router.post('/kyc', upload.single('file'), regCustomerOnAnchor)

module.exports = router
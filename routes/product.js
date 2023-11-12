const express = require('express')
const router = express.Router()
const {createProduct, getAllProducts, getProductById, updateProduct, deleteProduct} = require('../controllers/product')

//product routes
router.post('/products', createProduct)
router.get('/', getAllProducts)
router.get('/:id', getProductById)
router.patch('/:id', updateProduct)
router.delete('/:id', deleteProduct)

module.exports = router
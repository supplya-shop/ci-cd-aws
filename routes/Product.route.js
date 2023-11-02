const express = require('express')
const router = express.Router()
const product = require('../model/Product.model')

//product routes

// get all products
router.get('/', (req, res, next) => {
    product.find()
        .then(products => {
            res.status(200).json(products);
        })
        .catch(err => {
            console.error(err.message);
            res.status(500).json({
                error: {
                    message: 'Failed to fetch products'
                }
            });
        });
});

// create product
router.post('/', async (req, res, next) => {
    const newProduct = new product({
        name: req.body.name,
        price: req.body.price,
        description: req.body.description,
        quantity: req.body.quantity,
        category: req.body.category,
        inStock: req.body.inStock
    });
    newProduct.save()
        .then(result => {
            console.log(result);
            res.status(201).json({
                message: 'Product created successfully',
                product: result
            });
        })
        .catch(err => {
            console.error(err.message);
            res.status(500).json({
                error: {
                    message: 'Failed to create product'
                }
            });
        });
});

// get product by id
router.get('/:id', (req, res, next) => {
    const productId = req.params.id;
    product.findById(productId)
        .then(product => {
            if (!product) {
                return res.status(404).json({
                    message: 'Product not found'
                });
            }
            res.status(200).json(product);
        })
        .catch(err => {
            console.error(err.message);
            res.status(500).json({
                error: {
                    message: 'Failed to fetch product'
                }
            });
        });
});

// update product
router.patch('/:id', async (req, res, next) => {
    try {
        const productId = req.params.id;
        const updates = req.body;
        const options = { new: true }; // To return the modified document rather than the original

        const result = await product.findByIdAndUpdate(productId, updates, options);
        if (!result) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json({ message: 'Product updated successfully', product: result });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: { message: 'Failed to update product' } });
    }
});

// delete product
router.delete('/:id', async (req, res, next) => {
    const productId = req.params.id;
    try {
        const result = await product.findByIdAndDelete(productId)
        res.send(result)
        res.send("product deleted successfully")
    } catch (error) {
        console.log(error.message)
    }
});

module.exports = router
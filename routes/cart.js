const express = require('express')
const router = express.Router()

router.post('/cart/add', async (req, res) => {
    const productId = req.body.productId;
  
    try {
      const product = await product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
  
      const cart = await Cart.findOne();
      cart.items.push(product);
      await cart.save();
  
      res.status(200).json({ message: 'Product added to cart successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to add product to cart' });
    }
  });
  
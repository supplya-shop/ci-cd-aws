const express = require("express");
const router = express.Router();

const {
  addProductToCart,
  removeProductFromCart,
  getCartProducts,
} = require("../controllers/cart");

//product routes
router.post("/cart/add", addProductToCart);
router.delete("/cart/remove", removeProductFromCart);
router.get("/cart/get", getCartProducts);

// router.post('/cart/add', async (req, res) => {
//     const productId = req.body.productId;

//     try {
//       const product = await product.findById(productId);
//       if (!product) {
//         return res.status(404).json({ message: 'Product not found' });
//       }

//       const cart = await Cart.findOne();
//       cart.items.push(product);
//       await cart.save();

//       res.status(200).json({ message: 'Product added to cart successfully' });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ message: 'Failed to add product to cart' });
//     }
//   });

const { cartId, productId } = req.body;

try {
  const cart = await Cart.findById(cartId);
  if (!cart) {
    return res.status(404).json({ message: "Cart not found" });
  }

  // Add the product to the cart
  cart.items.push(productId);
  await cart.save();

  res.json({ message: "Product added to the cart successfully" });
} catch (error) {
  res.status(500).json({ message: error.message });
}
module.exports = router;

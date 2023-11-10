app.post('/orders', async (req, res) => {
    const cart = await Cart.findOne();
    const products = cart.items;
  
    // Calculate total price based on products in the cart
    const totalPrice = products.reduce((total, product) => total + product.price, 0);
  
    try {
      const order = new Order({
        items: products,
        total: totalPrice,
      });
  
      await order.save();
      // Clear the cart after the order is created
      cart.items = [];
      await cart.save();
  
      res.status(200).json({ message: 'Order created successfully', order });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to create order' });
    }
  });
  
  
  
  
  
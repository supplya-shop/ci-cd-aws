const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const Inventory = require("../models/Inventory");
const { StatusCodes } = require("http-status-codes");
const { NotFoundError } = require("../errors");
const { authenticateUser } = require("../middleware/authenticateUser");

const createOrder = async (req, res) => {
  try {
    const user = req.user._id;
    const {
      orderItems,
      shippingAddress1,
      shippingAddress2,
      city,
      zip,
      country,
      phone,
    } = req.body;

    // Calculate total price
    const orderItemIds = await Promise.all(
      orderItems.map(async (item) => {
        const orderItem = await OrderItem.create({
          quantity: item.quantity,
          product: item.product,
        });
        return orderItem._id;
      })
    );

    const total = orderItems.reduce(
      (acc, item) => acc + item.quantity * item.product.price,
      0
    );

    // Check if there is enough inventory for each item
    for (const item of orderItems) {
      const productInInventory = await Inventory.findOne({
        product: item.product,
      });

      // if (!productInInventory || productInInventory.quantity < item.quantity) {
      //   return res.status(StatusCodes.BAD_REQUEST).json({
      //     msg: `Not enough inventory for product ${item.product}`,
      //   });
      // }
    }

    // If there is enough inventory, create the order and update inventory
    const order = await Order.create({
      user,
      orderItems: orderItemIds,
      shippingAddress1,
      shippingAddress2,
      city,
      zip,
      country,
      phone,
      total,
    });

    // Update the inventory
    for (const item of orderItems) {
      await Inventory.findOneAndUpdate(
        { product: item.product },
        { $inc: { quantity: -item.quantity } }
      );
    }

    res
      .status(StatusCodes.CREATED)
      .json({ msg: "Order created successfully", order });
  } catch (error) {
    res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: error.message });
  }
};

const getOrders = async (req, res) => {
  try {
    const user = req.user.id;
    const orders = await Order.find({ user }).populate("orderItems");

    res.status(StatusCodes.OK).json(orders);
  } catch (error) {
    res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: error.message });
  }
};

module.exports = {
  createOrder,
  getOrders,
};

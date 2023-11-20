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

    // Check and update inventory
    for (const item of orderItems) {
      const productInInventory = await Inventory.findOne({
        product: item.product,
      });

      if (!productInInventory || productInInventory.quantity < item.quantity) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: "error",
          msg: `Not enough inventory for product ${item.product}`,
        });
      }

      // Update inventory
      await Inventory.findOneAndUpdate(
        { product: item.product },
        { $inc: { quantity: -item.quantity } }
      );
    }

    // If there is enough inventory, create the order
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

    res
      .status(StatusCodes.CREATED)
      .json({ status: "success", msg: "Order created successfully", order });
  } catch (error) {
    res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "error", msg: error.message });
  }
};

const getOrders = async (req, res) => {
  try {
    const user = req.user.id;
    const orders = await Order.find({ user }).populate("orderItems");

    res.status(StatusCodes.OK).json({ status: "success", orders });
  } catch (error) {
    res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "error", msg: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const orderId = req.params.orderId;

    const order = await Order.findById(orderId).populate("orderItems");

    if (!order) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ status: "error", msg: "Order not found" });
    }

    res.status(StatusCodes.OK).json({ status: "success", order });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "error", msg: error.message });
  }
};

const updateOrder = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const updatedOrderData = req.body;

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      updatedOrderData,
      { new: true }
    );

    if (!updatedOrder) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ status: "error", msg: "Order not found" });
    }

    res.status(StatusCodes.OK).json({ status: "success", order: updatedOrder });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "error", msg: error.message });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const orderId = req.params.orderId;

    const deletedOrder = await Order.findByIdAndDelete(orderId);

    if (!deletedOrder) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ status: "error", msg: "Order not found" });
    }

    res
      .status(StatusCodes.OK)
      .json({ status: "success", msg: "Order deleted successfully" });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "error", msg: error.message });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
};

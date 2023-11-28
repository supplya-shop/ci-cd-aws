const Order = require("../models/Order");
const Product = require("../models/Product");
const { StatusCodes } = require("http-status-codes");
const { NotFoundError } = require("../errors");

const mongoose = require('mongoose');

const createOrder = async (req, res) => {
  let session;

  try {
    const user = req.user._id;
    const {
      orderItems, // This is an array of { product: ObjectId, quantity: Number }
      shippingAddress1,
      shippingAddress2,
      city,
      zip,
      country,
      phone,
      paymentRefId
    } = req.body;

    // Start a transaction
    session = await mongoose.startSession();
    session.startTransaction();

    // Calculate total price
    let totalPrice = 0;
    for (const item of orderItems) {
      const product = await Product.findById(item.product).session(session);
      if (!product) {
        throw new Error(`Product not found: ${item.product}`);
      }
      totalPrice += item.quantity * product.price;
    }

    // Check and update inventory
    await checkAndUpdateInventory(orderItems, session);

    // Create the order
    const order = await Order.create([{
      user,
      orderItems, // Directly using the nested orderItems array
      shippingAddress1,
      shippingAddress2,
      city,
      zip,
      country,
      phone,
      totalPrice, // Using the calculated total price
      paymentRefId
    }], { session });

    // Commit the transaction
    await session.commitTransaction();

    res.status(StatusCodes.CREATED).json({ status: "success", msg: "Order created successfully", order });
  } catch (error) {
    // Rollback the transaction in case of error
    if (session.inTransaction()) await session.abortTransaction();

    console.error("Error creating order: ", error); // Error logging
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({ status: "error", msg: "Failed to create order. " + error.message });
  } finally {
    session.endSession();
  }
};

async function checkAndUpdateInventory(orderItems, session) {
  for (const item of orderItems) {
    const productInInventory = await Product.findOne({ _id: item.product }).session(session);

    if (!productInInventory || productInInventory.quantity < item.quantity) {
      throw new Error(`Not enough inventory for product ${item.product}`);
    }

    await Product.findOneAndUpdate(
      { _id: item.product },
      { $inc: { quantity: -item.quantity } },
      { session }
    );
  }
}


const getOrders = async (req, res) => {
  try {
    const user = req.user._id;
    const orders = await Order.find({ user }).populate("orderItems");

    res.status(StatusCodes.OK).json({ status: "success", orders });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "error", msg: "Failed to fetch orders: " + error.message });
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

    // Add an ownership check here if necessary

    res.status(StatusCodes.OK).json({ status: "success", order });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "error", msg: "Failed to fetch order: " + error.message });
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

const cancelOrder = async (req, res) => {
  let session;

  try {
      const orderId = req.params.orderId;
      session = await mongoose.startSession();
      session.startTransaction();

      // Find the order
      const order = await Order.findById(orderId).session(session);
      if (!order) {
          throw new Error("Order not found");
      }

      // Check if the order can be cancelled
      if (order.orderStatus === 'completed') {
          throw new Error("Completed orders cannot be cancelled");
      }

      // Update the order status
      order.orderStatus = 'cancelled';
      await order.save({ session });

      // Restore product quantities
      for (const item of order.orderItems) {
          await Product.updateOne(
              { _id: item.product },
              { $inc: { quantity: item.quantity } },
              { session }
          );
      }

      // Commit the transaction
      await session.commitTransaction();

      res.status(StatusCodes.OK).json({ status: "success", msg: "Order cancelled successfully", order });
  } catch (error) {
      // Rollback the transaction in case of error
      if (session && session.inTransaction()) await session.abortTransaction();

      console.error("Error cancelling order: ", error);
      res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({ status: "error", msg: "Failed to cancel order. " + error.message });
  } finally {
      if (session) {
          session.endSession();
      }
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  cancelOrder,
};

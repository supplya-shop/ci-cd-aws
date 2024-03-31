const Order = require("../models/Order");
const Product = require("../models/Product");
const { StatusCodes } = require("http-status-codes");
const { NotFoundError } = require("../errors");

const mongoose = require("mongoose");

const createOrder = async (req, res) => {
  let session;

  try {
    const user = req.user.userid;
    const email = req.user.email;
    let totalPrice;
    const {
      orderItems, // Array of { product: ObjectId, quantity: Number }
      shippingAddress1,
      shippingAddress2,
      city,
      zip,
      country,
      phone,
      address,
      orderNote,
      paymentRefId,
      paymentMethod,
    } = req.body;

    // Start a transaction
    session = await mongoose.startSession();
    session.startTransaction();

    // Calculate total price and populate vendor details
    totalPrice = 0;
    for (const item of orderItems) {
      const product = await Product.findById(item.product)
        .populate("createdBy") // Assuming 'createdBy' is the field for vendor
        .session(session);

      if (!product) {
        await session.abortTransaction();
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          status: "error",
          message: `Product not found: ${item.product}`,
        });
      }

      totalPrice += item.quantity * product.price;
      item.vendorDetails = product.createdBy;
    }

    // Check and update inventory
    await checkAndUpdateInventory(orderItems, session);

    // Create the order
    const createdOrders = await Order.create(
      [
        {
          user,
          orderItems,
          shippingAddress1,
          shippingAddress2,
          city,
          zip,
          country,
          phone,
          email,
          address,
          orderNote,
          totalPrice,
          paymentRefId,
          paymentMethod,
        },
      ],
      { session }
    );

    // Commit the transaction before trying to populate
    await session.commitTransaction();

    // Retrieve the first created order and populate necessary fields
    const order = await Order.findById(createdOrders[0]._id)
      .populate({
        path: "orderItems.product",
        model: "Product", // Replace with your Product model name
      })
      .populate({
        path: "createdBy",
        model: "User", // Replace with your User model name
      });
    // Note: No need to pass session here as the transaction is already committed

    console.log(order);

    return res.status(StatusCodes.CREATED).json({
      status: "success",
      message: "Order created successfully",
      data: order,
    });
  } catch (error) {
    // Rollback the transaction in case of error
    if (session && session.inTransaction()) await session.abortTransaction();

    console.error("Error creating order: ", error);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json({
        status: "error",
        message: "Failed to create order. " + error.message,
      });
  } finally {
    if (session) session.endSession();
  }
};

async function checkAndUpdateInventory(orderItems, session) {
  for (const item of orderItems) {
    const productInInventory = await Product.findOne({
      _id: item.product,
    }).session(session);

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
    const user = req.user.userid;
    const orders = await Order.find({ user }).populate({
      path: "orderItems.product", // Populating product within each orderItem
      populate: {
        path: "createdBy", // Nested population for createdBy within product
        select:
          "firstName lastName email country state city postalCode gender businessName phoneNumber accountNumber bank role", // Specify fields you want from User
      },
    });

    return res.status(StatusCodes.OK).json({
      status: "success",
      message: "Orders fetched successfully",
      data: orders,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: "Failed to fetch orders: " + error.message,
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const order = await Order.findById(orderId).populate({
      path: "orderItems.product",
      populate: {
        path: "createdBy",
        select:
          "firstName lastName email country state city postalCode gender businessName phoneNumber accountNumber bank role",
      },
    });

    if (!order) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ status: "error", message: "Order not found" });
    }

    return res.status(StatusCodes.OK).json({
      status: "success",
      message: "Order fetched successfully",
      data: order,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: "Failed to fetch order: " + error.message,
    });
  }
};

const getOrdersByStatus = async (req, res, next) => {
  try {
    const { status } = req.params;
    const orders = await Order.find({ orderStatus: status }).populate(
      "orderItems"
    );

    return res.status(StatusCodes.OK).json({
      status: "success",
      message: "Orders fetched successfully",
      data: orders,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: `Failed to fetch orders with status ${req.params.status}: ${error.message}`,
    });
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
        .json({ status: "error", message: "Order not found" });
    }

    return res.status(StatusCodes.OK).json({
      status: "success",
      message: "Order updated successfully",
      data: updatedOrder,
    });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "error", message: error.message });
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
    if (order.orderStatus === "completed") {
      throw new Error("Completed orders cannot be cancelled");
    }

    // Update the order status
    order.orderStatus = "cancelled";
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

    return res.status(StatusCodes.OK).json({
      status: "success",
      message: "Order cancelled successfully",
      data: order,
    });
  } catch (error) {
    // Rollback the transaction in case of error
    if (session && session.inTransaction()) await session.abortTransaction();

    console.error("Error cancelling order: ", error);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json({
        status: "error",
        message: "Failed to cancel order. " + error.message,
      });
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
  getOrdersByStatus,
  updateOrder,
  cancelOrder,
};

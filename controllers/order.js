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

    // Start a transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    const orderItemIds = await Promise.all(
      orderItems.map(async (item) => {
        const orderItem = await OrderItem.create([{
          quantity: item.quantity,
          product: item.product,
        }], { session });
        return orderItem._id;
      })
    );

    const total = orderItems.reduce(
      (acc, item) => acc + item.quantity * item.product.price,
      0
    );

    // Check and update inventory
    await checkAndUpdateInventory(orderItems, session);

    // Create the order
    const order = await Order.create([{
      user,
      orderItems: orderItemIds,
      shippingAddress1,
      shippingAddress2,
      city,
      zip,
      country,
      phone,
      total,
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
    const productInInventory = await Inventory.findOne({ product: item.product }).session(session);

    if (!productInInventory || productInInventory.quantity < item.quantity) {
      throw new Error(`Not enough inventory for product ${item.product}`);
    }

    await Inventory.findOneAndUpdate(
      { product: item.product },
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

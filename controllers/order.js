const Order = require("../models/Order");
const { StatusCodes } = require("http-status-codes");
const { NotFoundError } = require("../errors");
const { authenticateUser } = require("../middleware/authenticateUser");

const createOrder = async (req, res) => {
  try {
    const user = req.user;
    const { items, total } = req.body;

    const order = await Order.create({
      user,
      items,
      total,
    });

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
    const user = req.user;
    const orders = await Order.find({ user });

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

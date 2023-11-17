const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authenticateUser = require("../middleware/authenticateUser");
const { StatusCodes } = require("http-status-codes");
const {
  BadRequestError,
  UnauthenticatedError,
  NotFoundError,
} = require("../errors");
const Cart = require("../models/Cart");

// get cart items
const getCart = async (req, res) => {
  try {
    const user = req.user;
    const cart = await Cart.findOne({ user }).populate("items.product");

    if (!cart) {
      throw new NotFoundError("Cart not found");
    }

    res.status(StatusCodes.OK).json(cart);
  } catch (error) {
    res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: error.message });
  }
};

const addToCart = async (req, res) => {
  try {
    // Include the authenticateUser middleware here
    await authenticateUser(req, res, async () => {
      const user = req.user;
      const { productId, quantity } = req.body;

      const cart = await Cart.findOne({ user });

      if (!cart) {
        throw new NotFoundError("Cart not found");
      }

      const existingItem = cart.items.find(
        (item) => item.product.toString() === productId
      );

      if (existingItem) {
        existingItem.quantity += quantity || 1;
      } else {
        cart.items.push({ product: productId, quantity: quantity || 1 });
      }

      await cart.save();

      res
        .status(StatusCodes.CREATED)
        .json({ msg: "Product added to cart successfully" });
    });
  } catch (error) {
    res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: error.message });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const user = req.user;
    const { productId } = req.params;

    const cart = await Cart.findOne({ user });

    if (!cart) {
      throw new NotFoundError("Cart not found");
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();

    res
      .status(StatusCodes.OK)
      .json({ msg: "Product removed from cart successfully" });
  } catch (error) {
    res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: error.message });
  }
};

module.exports = {
  getCart,
  addToCart,
  removeFromCart,
};

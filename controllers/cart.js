const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, UnauthenticatedError } = require("../errors");
const cart = require("../models/Cart");

// get cart items
const getCartProducts = async (req, res) => {
  const { cartId } = req.params;

  try {
    const cart = await Cart.findById(cartId).populate("items");
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    res.json(cart.items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// add to cart
const addProductToCart = async (req, res) => {
  const { cartId, productId } = req.body;
  try {
    const cart = await Cart.findById(cartId);
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items.push(productId);
    await cart.save();

    res.json({ message: "Product added to the cart successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// remove from cart
const removeProductFromCart = async (req, res) => {
  const { cartId, productId } = req.body;
  try {
    const cart = await Cart.findById(cartId);
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter((item) => item.toString() !== productId);
    await cart.save();

    res.json({ message: "Product removed from the cart successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { addProductToCart, removeProductFromCart, getCartProducts };

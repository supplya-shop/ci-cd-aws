const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, UnauthenticatedError } = require("../errors");
const multer = require("../middleware/upload");
const authenticateUser = require("../middleware/authenticateUser");

const getAllUsers = async (req, res) => {
  try {
    const [users, totalCount] = await Promise.all([
      User.find(),
      User.countDocuments(),
    ]);

    res.status(200).json({ users, totalCount });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      error: {
        message: "Failed to fetch users",
      },
    });
  }
};

const getUserById = async (req, res) => {
  const userId = req.params.id;
  await User.findById(userId)
    .then((User) => {
      if (!User) {
        return res.status(404).json({
          message: "user not found",
        });
      }
      res.status(200).json(User);
    })
    .catch((err) => {
      console.error(err.message);
      res.status(500).json({
        error: {
          message: "Failed to fetch user",
        },
      });
    });
};

const createUser = async (req, res) => {
  const newuser = new User({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    phoneNumber: req.body.phoneNumber,
    password: req.body.password,
    status: req.body.status,
    gender: req.body.gender,
    dateOfBirth: req.body.dateOfBirth,
    address: req.body.address,
    role: req.body.role,
    dateCreated: req.body.dateCreated,
  });
  newuser
    .save()
    .then((result) => {
      console.log(result);
      res.status(201).json({
        message: "user created successfully",
        user: result,
      });
    })
    .catch((err) => {
      console.error(err.message);
      res.status(500).json({
        error: {
          message: "Failed to create user",
        },
      });
    });
};

const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const updates = req.body;
    const options = { new: true }; // To return the modified document rather than the original

    const result = await User.findByIdAndUpdate(userId, updates, options);
    if (!result) {
      return res.status(404).json({ message: "user not found" });
    }
    res
      .status(200)
      .json({ message: "user updated successfully", User: result });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: { message: "Failed to update user" } });
  }
};

const deleteUser = async (req, authenticateUser, res) => {
  const userId = req.params.id;
  try {
    const userToDelete = await User.findById(userId);
    if (!userToDelete) {
      return res.status(404).json({ message: "User not found" });
    }
    const result = await User.findByIdAndDelete(userId);
    if (!result) {
      return res.status(500).json({ message: "Failed to delete user" });
    }
    res.status(200).json({
      message: "User deleted successfully",
      deletedUser: userToDelete,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};

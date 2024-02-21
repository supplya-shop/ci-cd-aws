const User = require("../models/User");
const validateUser = require("../middleware/validation/userDTO");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, UnauthenticatedError } = require("../errors");
const multer = require("../middleware/upload");
const winston = require("winston");
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
      User.firstName =
        User.firstName.charAt(0).toUpperCase() + User.firstName.slice(1);
      User.lastName =
        User.lastName.charAt(0).toUpperCase() + User.lastName.slice(1);
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
  const { error, value } = validateUser(req.body);
  if (error) {
    return res
      .status(400)
      .json({ error: error.details.map((detail) => detail.message) });
  }
  const newUser = new User(value);
  try {
    await newUser.save();
    res
      .status(201)
      .json({ message: "User created successfully", status: "success" });
  } catch (err) {
    console.error(err.message);
    res
      .status(500)
      .json({ error: { message: "Failed to create user", status: "error" } });
  }
};

const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    let updates = validateUser(req.body);

    delete updates.password;

    const options = { new: true };

    const result = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      options
    );
    if (!result) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if result is a Mongoose document before calling toObject()
    const response = result.toObject ? result.toObject() : result;

    if (response.password) {
      delete response.password;
    }

    res.status(200).json({
      message: "User updated successfully",
      User: response,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: { message: error.message } });
  }
};

// const deleteUser = async (req, authenticateUser, res) => {
//   const userId = req.params.id;
//   try {
//     const userToDelete = await User.findById(userId);
//     if (!userToDelete) {
//       return res.status(404).json({ message: "User not found" });
//     }
//     const result = await User.findByIdAndDelete(userId);
//     if (!result) {
//       return res.status(500).json({ message: "Failed to delete user" });
//     }
//     res.status(200).json({
//       message: "User deleted successfully",
//       deletedUser: userToDelete,
//     });
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  // deleteUser,
};

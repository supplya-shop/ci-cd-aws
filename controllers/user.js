const User = require("../models/User");
const validateUser = require("../middleware/validation/userDTO");
const { StatusCodes } = require("http-status-codes");
const {
  BadRequestError,
  UnauthenticatedError,
  NotFoundError,
} = require("../errors");
const multer = require("../middleware/upload");
// const logger = require("../middleware/logging/logger");

const getAllUsers = async (req, res) => {
  try {
    const [users, totalCount] = await Promise.all([
      User.find(),
      User.countDocuments(),
    ]);

    return res
      .status(StatusCodes.OK)
      .json({ users: users, totalCount: totalCount });
  } catch (error) {
    // logger.error(error.message);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: "Failed to fetch users",
    });
  }
};

const getUserById = async (req, res) => {
  const userId = req.params.id;
  await User.findById(userId)
    .then((User) => {
      if (!User) {
        return res.status(StatusCodes.NOT_FOUND).json({
          status: "error",
          message: "user not found",
        });
      }
      User.firstName =
        User.firstName.charAt(0).toUpperCase() + User.firstName.slice(1);
      User.lastName =
        User.lastName.charAt(0).toUpperCase() + User.lastName.slice(1);
      return res.status(StatusCodes.OK).json({ status: "success", user: User });
    })
    .catch((error) => {
      // logger.error(error.message);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: "error",
        message: "Failed to fetch user",
      });
    });
};

const createUser = async (req, res) => {
  const { error, value } = validateUser(req.body);
  if (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: "error",
      message:
        "Validation error. Please confirm that all required fields are entered and try again.",
    });
  }
  const newUser = new User(value);
  try {
    await newUser.save();
    return res
      .status(StatusCodes.CREATED)
      .json({ message: "User created successfully.", status: "success" });
    // logger.info(`${newUser.email} created successfully.`);
  } catch (error) {
    // logger.error(error.message);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Failed to create user.", status: "error" });
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
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ status: "error", message: "User not found" });
    }

    // Check if result is a Mongoose document before calling toObject()
    const response = result.toObject ? result.toObject() : result;

    if (response.password) {
      delete response.password;
    }

    return res.status(StatusCodes.OK).json({
      status: "success",
      message: "User updated successfully",
      user: response,
    });
  } catch (error) {
    // logger.error(error.message);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "error", message: error.message });
  }
};

const deleteUser = async (req, res, next) => {
  const userId = req.params.id;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ status: "error", message: "User not found" });
    }
    const result = await User.findByIdAndDelete(userId);
    if (!result) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ status: "error", message: "Failed to delete user" });
    }
    return res.status(StatusCodes.OK).json({
      status: "success",
      message: "User deleted successfully",
      data: user,
    });
  } catch (error) {
    // logger.error(error.message);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "error", message: "Internal Server Error" });
  }
};

const bulkdeleteUsers = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      res.status(StatusCodes.NOT_FOUND).json({
        status: "error",
        message: "Invalid input. Please provide an array of user IDs.",
      });
      throw new NotFoundError("Unable to find user");
    }
    const result = await User.deleteMany({ _id: { $in: ids } });

    if (result.deletedCount === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: "error",
        message: "No users found with the provided IDs.",
      });
    }
    return res.json({
      status: "success",
      message: `${result.deletedCount} user(s) deleted successfully.`,
    });
  } catch (error) {
    console.error("Error in bulk delete operation:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "error", message: "Internal server error" });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  bulkdeleteUsers,
};

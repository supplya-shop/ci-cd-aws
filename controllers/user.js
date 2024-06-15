const User = require("../models/User");
const Order = require("../models/Order");
const Product = require("../models/Product");
const validateUser = require("../middleware/validation/userDTO");
const { StatusCodes } = require("http-status-codes");
const {
  BadRequestError,
  UnauthenticatedError,
  NotFoundError,
} = require("../errors");
const multer = require("../middleware/upload");
// const logger = require("../middleware/logging/logger");

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

const getAllUsers = async (req, res) => {
  try {
    const [users, totalCount] = await Promise.all([
      User.find(),
      User.countDocuments(),
    ]);

    return res.status(StatusCodes.OK).json({
      status: "success",
      message: "Users fetched successfully",
      data: users,
      totalCount: totalCount,
    });
  } catch (error) {
    // logger.error(error.message);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: "Failed to fetch users",
    });
  }
};

const getAdminUsers = async (req, res, next) => {
  try {
    const adminUsers = await User.find({ role: "admin" }).select("_id email");
    const adminIds = adminUsers.map((user) => user._id);
    console.log("Admin users:", adminUsers);

    return res.status(200).json({
      status: "success",
      message: "Admin users fetched successfully",
      data: adminIds,
      adminUsers: adminUsers,
    });
  } catch (error) {
    console.error("Error fetching admin users:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
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
      return res.status(StatusCodes.OK).json({
        status: "success",
        message: "User fetched successfully",
        data: User,
      });
    })
    .catch((error) => {
      // logger.error(error.message);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: "error",
        message: "Failed to fetch user",
      });
    });
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    delete updates.password;
    delete updates.role;

    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: "error",
        message: "User not found",
      });
    }

    if (updates.storeName) {
      updates.storeName = updates.storeName.toLowerCase();

      if (updates.storeName !== existingUser.storeName) {
        const storeNameExists = await User.findOne({
          storeName: updates.storeName,
        });
        if (storeNameExists) {
          return res.status(StatusCodes.CONFLICT).json({
            status: "error",
            message: "This store name is already taken",
          });
        }
        updates.storeUrl = `https://supplya.shop/store/${updates.storeName.replace(
          /\s+/g,
          "-"
        )}`;
      }
    }

    const updatedData = {};
    for (const key in updates) {
      if (updates[key] !== undefined) {
        updatedData[key] = updates[key];
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updatedData },
      { new: true, runValidators: true }
    );

    const response = updatedUser.toObject();
    delete response.password;

    return res.status(StatusCodes.OK).json({
      status: "success",
      message: "User updated successfully",
      data: response,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: "Internal server error",
    });
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

const getUserOrders = async (req, res) => {
  const userId = req.user.userid;
  const userRole = req.user.role;

  try {
    const past24Hours = new Date();
    past24Hours.setDate(past24Hours.getDate() - 1);

    if (userRole === "vendor") {
      const vendorProducts = await Product.find({
        createdBy: userId,
      }).select("quantity");

      const productIds = vendorProducts.map((product) => product._id);

      const orders = await Order.find({
        "orderItems.product": { $in: productIds },
      });

      const receivedOrdersCount = orders.filter(
        (order) => order.orderStatus === "received"
      ).length;
      const deliveredOrdersCount = orders.filter(
        (order) => order.orderStatus === "delivered"
      ).length;

      const newOrdersCount = orders.filter(
        (order) => new Date(order.dateOrdered) >= past24Hours
      ).length;

      const totalOrders = orders.length;

      const totalStock = vendorProducts.reduce(
        (acc, product) => acc + product.quantity,
        0
      );

      const totalAmountSold = orders.reduce(
        (acc, order) => acc + parseFloat(order.totalPrice),
        0
      );

      const dailySales = await Order.aggregate([
        { $match: { "orderItems.product": { $in: productIds } } },
        {
          $group: {
            _id: {
              year: { $year: "$dateOrdered" },
              month: { $month: "$dateOrdered" },
              day: { $dayOfMonth: "$dateOrdered" },
            },
            totalSales: { $sum: "$totalPrice" },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": -1, "_id.month": -1, "_id.day": -1 } },
      ]);

      const monthlySales = await Order.aggregate([
        { $match: { "orderItems.product": { $in: productIds } } },
        {
          $group: {
            _id: {
              year: { $year: "$dateOrdered" },
              month: { $month: "$dateOrdered" },
            },
            totalSales: { $sum: "$totalPrice" },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": -1, "_id.month": -1 } },
      ]);

      return res.status(StatusCodes.OK).json({
        status: "success",
        data: {
          totalOrders,
          totalStock,
          totalAmountSold,
          dailySales,
          monthlySales,
          orders,
          receivedOrdersCount,
          deliveredOrdersCount,
          newOrdersCount,
        },
      });
    } else {
      // Fetch orders for the customer
      const orders = await Order.find({ user: userId })
        .populate({
          path: "orderItems.product",
          populate: {
            path: "createdBy",
            select:
              "firstName lastName email country state city postalCode businessName phoneNumber accountNumber bank",
          },
        })
        .populate({
          path: "user",
          select: "firstName lastName email",
        });

      if (!orders) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ status: false, data: orders });
      }

      const pendingOrdersCount = orders.filter(
        (order) => order.orderStatus === "received"
      ).length;
      const deliveredOrdersCount = orders.filter(
        (order) => order.orderStatus === "delivered"
      ).length;

      const newOrdersCount = orders.filter(
        (order) => new Date(order.dateOrdered) >= past24Hours
      ).length;

      const totalOrders = orders.length;

      const totalAmountSpent = orders.reduce(
        (acc, order) => acc + parseFloat(order.totalPrice),
        0
      );

      const totalProductsOrdered = orders.reduce(
        (acc, order) =>
          acc + order.orderItems.reduce((acc, item) => acc + item.quantity, 0),
        0
      );

      return res.status(StatusCodes.OK).json({
        status: "success",
        data: {
          totalOrders,
          totalAmountSpent,
          totalProductsOrdered,
          orders,
          pendingOrdersCount,
          deliveredOrdersCount,
          newOrdersCount,
        },
      });
    }
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: "Failed to fetch orders: " + error.message,
    });
  }
};

const bulkdeleteUsers = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: "error",
        message: "Invalid input. Please provide an array of user IDs.",
      });
    }
    const result = await User.deleteMany({ _id: { $in: ids } });

    if (result.deletedCount === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: "error",
        message: "No users found with the provided IDs.",
      });
    }
    return res.status(StatusCodes.OK).json({
      status: "success",
      message: `${result.deletedCount} user(s) deleted successfully.`,
    });
  } catch (error) {
    console.error("Error in bulk delete operation:", error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "error", message: "Internal server error" });
  }
};

module.exports = {
  getAllUsers,
  getAdminUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserOrders,
  bulkdeleteUsers,
};

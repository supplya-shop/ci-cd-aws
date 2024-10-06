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
const { contactMail } = require("../middleware/mailUtil");

const createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    if (!firstName || !lastName || !email || !password || !role) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: false,
        message:
          "Please provide firstName, lastName, email, password, and role.",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(StatusCodes.CONFLICT).json({
        status: false,
        message: "User with this email already exists.",
      });
    }

    const newUser = new User({
      firstName,
      lastName,
      email,
      password,
      role,
    });

    await newUser.save();

    return res.status(StatusCodes.CREATED).json({
      status: true,
      message: "User created successfully.",
      data: newUser,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Failed to create user.",
      error: error.message,
    });
  }
};

const getAllUsers = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 15;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  try {
    const [users, totalCount] = await Promise.all([
      User.find().sort({ createdAt: -1 }).limit(limit).skip(startIndex),
      User.countDocuments(),
    ]);
    const totalPages = Math.ceil(totalCount / limit);
    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Users fetched successfully",
      data: users,
      currentPage: page,
      totalCount: totalCount,
      totalPages: totalPages,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
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
      status: true,
      message: "Admin users fetched successfully",
      data: adminIds,
      adminUsers: adminUsers,
    });
  } catch (error) {
    console.error("Error fetching admin users:", error);
    return res
      .status(500)
      .json({ status: false, message: "Internal server error" });
  }
};

const getUserById = async (req, res) => {
  const userId = req.params.id;
  await User.findById(userId)
    .then((User) => {
      if (!User) {
        return res.status(StatusCodes.OK).json({
          status: false,
          message: "user not found",
        });
      }
      User.firstName =
        User.firstName.charAt(0).toUpperCase() + User.firstName.slice(1);
      User.lastName =
        User.lastName.charAt(0).toUpperCase() + User.lastName.slice(1);
      return res.status(StatusCodes.OK).json({
        status: true,
        message: "User fetched successfully",
        data: User,
      });
    })
    .catch((error) => {
      // logger.error(error.message);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: false,
        message: "Failed to fetch user",
      });
    });
};

const getUsersByRole = async (req, res) => {
  const role = req.params.role;
  try {
    const users = await User.find({ role })
      .select(
        "firstName lastName email phoneNumber role createdAt storeName storeUrl blocked"
      )
      .sort({ createdAt: -1 });

    if (!users || users.length === 0) {
      return res.status(StatusCodes.OK).json({
        status: false,
        message: "Users not found",
        data: users,
      });
    }

    return res.status(StatusCodes.OK).json({
      status: true,
      message: "Users fetched successfully",
      data: users,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Internal Server Error: " + error.message,
    });
  }
};

const updateUser = async (req, res) => {
  const phonePattern = /^234\d{10}$/;
  try {
    const { id } = req.params;
    const updates = req.body;

    delete updates.password;
    delete updates.role;

    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: false,
        message: "User not found",
      });
    }

    if (updates.storeName) {
      // updates.storeName = updates.storeName.toLowerCase();

      if (updates.storeName !== existingUser.storeName) {
        const storeNameExists = await User.findOne({
          storeName: updates.storeName,
        });
        if (storeNameExists) {
          return res.status(StatusCodes.CONFLICT).json({
            status: false,
            message: "This store name is already taken",
          });
        }
        updates.storeUrl = `https://supplya.shop/store/${updates.storeName.replace(
          /\s+/g,
          "-"
        )}`;
      }
    }
    if (updates.phoneNumber && !phonePattern.test(updates.phoneNumber)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: false,
        message: "Phone number must start with 234 followed by 10 digits.",
      });
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
      status: true,
      message: "User updated successfully",
      data: response,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Internal server error",
    });
  }
};

const getUserOrders = async (req, res) => {
  const userId = req.user.userid;
  const userRole = req.user.role;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const excludedStatuses = ["Delivered", "shipped", "cancelled"];

  try {
    let orders,
      totalOrdersCount,
      totalNewOrdersCount,
      totalDeliveredOrdersCount,
      totalPendingOrdersCount,
      totalOrders,
      totalAmountSold,
      totalStock,
      dailySales,
      monthlySales;

    const past24Hours = new Date();
    past24Hours.setDate(past24Hours.getDate() - 1);

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    if (userRole === "vendor") {
      const vendorProducts = await Product.find({ createdBy: userId }).select(
        "quantity"
      );
      const productIds = vendorProducts.map((product) => product._id);

      totalOrdersCount = await Order.countDocuments({
        "orderItems.product": { $in: productIds },
      });

      orders = await Order.find({ "orderItems.product": { $in: productIds } })
        .sort({ dateCreated: -1 })
        .populate("user")
        .populate({
          path: "orderItems.product",
          populate: [
            {
              path: "createdBy",
              select:
                "firstName lastName email country state city postalCode businessName phoneNumber accountNumber bank",
            },
            {
              path: "category",
              select: "name",
            },
          ],
        })
        .skip(skip)
        .limit(limit);

      totalNewOrdersCount = await Order.countDocuments({
        "orderItems.product": { $in: productIds },
        dateOrdered: { $gte: startOfDay, $lte: endOfDay },
      });

      totalDeliveredOrdersCount = await Order.countDocuments({
        "orderItems.product": { $in: productIds },
        orderStatus: "Delivered",
      });

      totalPendingOrdersCount = await Order.countDocuments({
        "orderItems.product": { $in: productIds },
        orderStatus: { $nin: excludedStatuses },
      });

      totalStock = vendorProducts.reduce(
        (acc, product) => acc + product.quantity,
        0
      );
      totalAmountSold = orders.reduce(
        (acc, order) => acc + parseFloat(order.totalPrice),
        0
      );

      dailySales = await Order.aggregate([
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

      monthlySales = await Order.aggregate([
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

      totalOrders = orders.length;

      return res.status(StatusCodes.OK).json({
        status: true,
        message: "Orders fetched successfully",
        data: {
          totalOrders,
          totalStock,
          totalAmountSold,
          dailySales,
          monthlySales,
          orders,
          totalDeliveredOrdersCount,
          totalPendingOrdersCount,
          totalNewOrdersCount,
          totalOrdersCount,
          totalPages: Math.ceil(totalOrdersCount / limit),
          currentPage: page,
        },
      });
    } else {
      totalOrdersCount = await Order.countDocuments({ user: userId });

      orders = await Order.find({ user: userId })
        .sort({ dateCreated: -1 })
        .populate({
          path: "orderItems.product",
          populate: [
            {
              path: "createdBy",
              select:
                "firstName lastName email country state city postalCode businessName phoneNumber accountNumber bank",
            },
            {
              path: "category",
              select: "name",
            },
          ],
        })
        .populate({ path: "user", select: "firstName lastName email" })
        .skip(skip)
        .limit(limit);

      if (!orders) {
        return res.status(StatusCodes.OK).json({
          status: false,
          message: "No orders found",
          data: orders,
        });
      }

      totalPendingOrdersCount = await Order.countDocuments({
        user: userId,
        orderStatus: { $nin: excludedStatuses },
      });
      const deliveredOrdersCount = orders.filter(
        (order) => order.orderStatus === "delivered"
      ).length;
      const newOrdersCount = orders.filter(
        (order) => new Date(order.dateOrdered) >= past24Hours
      ).length;

      totalOrders = orders.length;
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
        status: true,
        message: "Orders fetched successfully",
        data: {
          totalOrders,
          totalAmountSpent,
          totalProductsOrdered,
          orders,
          totalPendingOrdersCount,
          deliveredOrdersCount,
          newOrdersCount,
          totalOrdersCount,
          totalPages: Math.ceil(totalOrdersCount / limit),
          currentPage: page,
        },
      });
    }
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Failed to fetch orders: " + error.message,
    });
  }
};

const bulkdeleteUsers = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: false,
        message: "Invalid input. Please provide an array of user IDs.",
      });
    }
    const result = await User.deleteMany({ _id: { $in: ids } });

    if (result.deletedCount === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: false,
        message: "No users found with the provided IDs.",
      });
    }
    return res.status(StatusCodes.OK).json({
      status: true,
      message: `${result.deletedCount} user(s) deleted successfully.`,
    });
  } catch (error) {
    console.error("Error in bulk delete operation:", error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: false, message: "Internal server error" });
  }
};

const deleteUser = async (req, res, next) => {
  const userId = req.params.id;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ status: false, message: "User not found" });
    }
    await user.remove();
    return res.status(StatusCodes.OK).json({
      status: true,
      message: "User deleted successfully",
      data: user,
    });
  } catch (error) {
    console.error("Error in delete user api:", error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: false, message: "Internal Server Error" });
  }
};

const deleteUserAccount = async (req, res) => {
  const userId = req.user.userid;
  console.log("userId: ", userId);

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: false,
        message: "User not found",
      });
    }

    await User.findByIdAndDelete(userId);

    await Order.deleteMany({ "user._id": userId });

    return res.status(StatusCodes.OK).json({
      status: true,
      message: "User account and data deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user account:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "Failed to delete user account. " + error.message,
    });
  }
};

const contactUs = async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  try {
    if (!name || !email || !subject || !message || !phone) {
      return res.status(400).json({
        status: StatusCodes.OK,
        message: "All fields are required.",
      });
    }
    await contactMail(name, email, phone, subject, message);
    return res.status(200).json({
      status: true,
      message: "Message sent successfully!",
    });
  } catch (error) {
    console.error("Error submitting the contact form:", error);

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: false,
      message: "There was an error submitting your message. Please try again.",
    });
  }
};

module.exports = {
  getAllUsers,
  getAdminUsers,
  getUserById,
  getUsersByRole,
  createUser,
  updateUser,
  getUserOrders,
  deleteUser,
  bulkdeleteUsers,
  deleteUserAccount,
  contactUs,
};

const Notification = require("../models/Notification");
const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");

const createNotification = async (req, res) => {
  try {
    const { title, message, userId } = req.body;

    const notification = new Notification({
      title,
      message,
      userId: userId,
    });

    await notification.save();
    return res
      .status(201)
      .json({ status: true, message: "Notification created", notification });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "Failed to create notification", error });
  }
};

const getNotifications = async (req, res) => {
  try {
    const userId = req.user.userid;
    const notifications = await Notification.find({ userId: userId });

    res.status(200).json({ status: true, notifications });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Failed to retrieve notifications",
      error,
    });
  }
};

const markAsRead = async (req, res) => {
  try {
    const notificationId = req.params.id;

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res
        .status(404)
        .json({ status: false, message: "Notification not found" });
    }

    notification.read = true;
    await notification.save();

    res
      .status(200)
      .json({ status: true, message: "Notification marked as read" });
  } catch (error) {
    res
      .status(500)
      .json({ status: false, message: "Failed to update notification", error });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const notificationId = req.params.id;

    await Notification.findByIdAndDelete(notificationId);

    res.status(200).json({ status: true, message: "Notification deleted" });
  } catch (error) {
    res
      .status(500)
      .json({ status: false, message: "Failed to delete notification", error });
  }
};

const notifyAllUsers = async (req, res) => {
  try {
    const { title, message } = req.body;
    const users = await User.find();

    const notifications = users.map((user) => ({
      title,
      message,
      userId: user._id,
    }));

    await Notification.insertMany(notifications);

    res
      .status(201)
      .json({ status: true, message: "Notifications sent to all users" });
  } catch (error) {
    res
      .status(500)
      .json({ status: false, message: "Failed to send notifications", error });
  }
};

const notifyAllVendors = async (req, res) => {
  try {
    const { title, message } = req.body;
    const vendors = await User.find({ role: "vendor" });

    const notifications = vendors.map((vendor) => ({
      title,
      message,
      userId: vendor._id,
    }));

    await Notification.insertMany(notifications);

    res
      .status(201)
      .json({ status: true, message: "Notifications sent to all vendors" });
  } catch (error) {
    res
      .status(500)
      .json({ status: false, message: "Failed to send notifications", error });
  }
};

const notifyAllCustomers = async (req, res) => {
  try {
    const { title, message } = req.body;
    const customers = await User.find({ role: "customer" });

    const notifications = customers.map((customer) => ({
      title,
      message,
      userId: customer._id,
    }));

    await Notification.insertMany(notifications);

    res
      .status(201)
      .json({ status: true, message: "Notifications sent to all customers" });
  } catch (error) {
    res
      .status(500)
      .json({ status: false, message: "Failed to send notifications", error });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.userid;

    await Notification.updateMany(
      { userId: userId, read: false },
      { read: true }
    );

    res
      .status(200)
      .json({ status: true, message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Failed to mark notifications as read",
      error,
    });
  }
};

module.exports = {
  createNotification,
  markAsRead,
  getNotifications,
  markAllAsRead,
  deleteNotification,
  notifyAllUsers,
  notifyAllVendors,
  notifyAllCustomers,
};

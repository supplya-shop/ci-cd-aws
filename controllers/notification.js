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

const getUserNotifications = async (req, res) => {
  const userId = req.user.userid;
  try {
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

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({});

    res.status(200).json({ status: true, notifications });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Failed to retrieve notifications",
      error,
    });
  }
};

const getNotificationsByRole = async (req, res) => {
  try {
    const { role } = req.query;

    if (!role) {
      return res.status(400).json({
        status: false,
        message: "Role is required to filter notifications",
      });
    }

    const usersWithRole = await User.find({ role }).select("_id");

    if (!usersWithRole || usersWithRole.length === 0) {
      return res.status(404).json({
        status: false,
        message: `No users found for role: ${role}`,
      });
    }

    const userIds = usersWithRole.map((user) => user._id);

    const notifications = await Notification.find({ userId: { $in: userIds } });

    if (!notifications || notifications.length === 0) {
      return res.status(404).json({
        status: false,
        message: `No notifications found for users with role: ${role}`,
      });
    }

    res.status(200).json({
      status: true,
      message: `Notifications for ${role} retrieved successfully`,
      notifications,
    });
  } catch (error) {
    console.error("Error fetching notifications by role:", error);
    res.status(500).json({
      status: false,
      message: "Failed to retrieve notifications",
      error: error.message,
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

const notifyUsersByRole = async (req, res) => {
  try {
    const { title, message, role } = req.body;

    if (!role || !["vendor", "customer", "admin"].includes(role)) {
      return res.status(400).json({
        status: false,
        message:
          "Invalid or missing role. Allowed roles are 'vendor', 'customer', 'admin'.",
      });
    }

    const users = await User.find({ role });

    if (users.length === 0) {
      return res.status(404).json({
        status: false,
        message: `No users found for the role: ${role}`,
      });
    }

    const notifications = users.map((user) => ({
      title,
      message,
      userId: user._id,
    }));

    await Notification.insertMany(notifications);

    res.status(201).json({
      status: true,
      message: `Notifications sent to all ${role}s`,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Failed to send notifications",
      error: error.message,
    });
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

module.exports = {
  createNotification,
  markAsRead,
  getNotifications,
  getUserNotifications,
  getNotificationsByRole,
  markAllAsRead,
  deleteNotification,
  notifyAllUsers,
  notifyUsersByRole,
};

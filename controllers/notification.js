const Notification = require("../models/Notification");
const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const cron = require("node-cron");

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
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 15;
  const startIndex = (page - 1) * limit;

  try {
    const [notifications, totalNotificationsCount, unreadNotifications] =
      await Promise.all([
        Notification.find({ userId })
          .sort({ createdAt: -1 })
          .limit(limit)
          .skip(startIndex),
        Notification.countDocuments({ userId }),
        Notification.find({ userId, read: false }).sort({ createdAt: -1 }),
      ]);

    if (notifications.length === 0) {
      return res.status(404).json({
        status: false,
        message: "No notifications found",
        data: [],
        unread: [],
        totalCount: 0,
      });
    }

    const totalPages = Math.ceil(totalNotificationsCount / limit);

    res.status(200).json({
      status: true,
      message: "Notifications retrieved successfully",
      data: notifications,
      unread: unreadNotifications,
      currentPage: page,
      totalPages,
      totalNotificationsCount,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Failed to retrieve notifications",
      error: error.message,
    });
  }
};

const getNotifications = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 15;
  const startIndex = (page - 1) * limit;

  try {
    const [notifications, totalCount] = await Promise.all([
      Notification.find({})
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(startIndex),
      Notification.countDocuments(),
    ]);

    if (notifications.length === 0) {
      return res.status(404).json({
        status: false,
        message: "No notifications found",
        data: [],
      });
    }

    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      status: true,
      message: "Notifications retrieved successfully",
      data: notifications,
      currentPage: page,
      totalPages,
      totalCount,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Failed to retrieve notifications",
      error: error.message,
    });
  }
};

const getNotificationsByRole = async (req, res) => {
  const { role } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 15;
  const startIndex = (page - 1) * limit;

  try {
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

    const [notifications, totalCount] = await Promise.all([
      Notification.find({ userId: { $in: userIds } })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(startIndex),
      Notification.countDocuments({ userId: { $in: userIds } }),
    ]);

    if (notifications.length === 0) {
      return res.status(404).json({
        status: false,
        message: `No notifications found for users with role: ${role}`,
        data: [],
      });
    }

    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      status: true,
      message: `Notifications for ${role} retrieved successfully`,
      data: notifications,
      currentPage: page,
      totalPages,
      totalCount,
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

const sendBirthdayNotifications = async () => {
  try {
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();

    const usersWithBirthdayToday = await User.find({
      $expr: {
        $and: [
          { $eq: [{ $dayOfMonth: "$dob" }, currentDay] },
          { $eq: [{ $month: "$dob" }, currentMonth] },
        ],
      },
    });

    if (usersWithBirthdayToday.length === 0) {
      console.log("No users have a birthday today.");
      return;
    }

    const notifications = usersWithBirthdayToday.map((user) => ({
      title: "Happy Birthday!",
      message: `Happy Birthday ${user.firstName}! 🥳🥳🥳\n Wishing you a fantastic year ahead. Thank you for being a part of our journey! ❤️ Supplya.`,
      userId: user._id,
    }));

    await Notification.insertMany(notifications);

    console.log(
      `Birthday notifications sent to ${usersWithBirthdayToday.length} user(s).`
    );
  } catch (error) {
    console.error("Error sending birthday notifications:", error);
  }
};

cron.schedule("0 9 * * *", () => {
  console.log("Running daily birthday notification task...");
  sendBirthdayNotifications();
});

module.exports = {
  createNotification,
  markAsRead,
  getNotifications,
  getUserNotifications,
  getNotificationsByRole,
  markAllAsRead,
  sendBirthdayNotifications,
  deleteNotification,
  notifyAllUsers,
  notifyUsersByRole,
};

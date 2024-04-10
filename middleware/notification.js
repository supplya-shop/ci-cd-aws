const Notification = require("../models/Notification");

const notificationService = {
  async createNotification(user, message) {
    try {
      const notification = new Notification({ user, message });
      await notification.save();
      return notification;
    } catch (error) {
      console.error("Error creating notification:", error);
      return res
        .status(500)
        .json({ status: "error", message: "Internal Server Error" });
    }
  },

  async getUnreadNotifications(userId) {
    try {
      return await Notification.find({ user: userId, read: false });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw new Error("Failed to fetch notifications");
    }
  },
};

module.exports = notificationService;

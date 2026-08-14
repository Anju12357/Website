const Notifications = require("../models/notifications");

// Get all notifications
const getNotifications = async (req, reply) => {
  try {
    const notifications = await Notifications.getNotifications();

    reply.send({
      status: 1,
      data: notifications,
    });
  } catch (err) {
    console.log("Error getNotifications:", err);

    reply.status(500).send({
      status: 0,
      message: "Server Error",
    });
  }
};

// Add notification
const addNotification = async (req, reply) => {
  try {
    const { title, subtitle } = req.body;

    if (!title) {
      return reply.send({
        status: 0,
        message: "Title is required",
      });
    }

    await Notifications.addNotification(title, subtitle || null);

    reply.send({
      status: 1,
      message: "Notification added successfully",
    });
  } catch (err) {
    console.log("Error addNotification:", err);

    reply.status(500).send({
      status: 0,
      message: "Server Error",
    });
  }
};

// Mark notification as read
const markNotificationRead = async (req, reply) => {
  try {
    const { id } = req.body;

    if (!id) {
      return reply.send({
        status: 0,
        message: "Notification ID is required",
      });
    }

    const result = await Notifications.markAsRead(id);

    if (result === false) {
      return reply.send({
        status: 0,
        message: "Failed to mark notification as read",
      });
    }

    reply.send({
      status: 1,
      message: "Notification marked as read",
    });

  } catch (err) {
    console.log("Error markNotificationRead:", err);

    reply.status(500).send({
      status: 0,
      message: "Server Error",
    });
  }
};
// Delete notification
const deleteNotification = async (req, reply) => {
  try {
    const { id } = req.body;

    if (!id) {
      return reply.send({
        status: 0,
        message: "Notification ID is required",
      });
    }

    await Notifications.deleteNotification(id);

    reply.send({
      status: 1,
      message: "Notification deleted successfully",
    });
  } catch (err) {
    console.log("Error deleteNotification:", err);

    reply.status(500).send({
      status: 0,
      message: "Server Error",
    });
  }
};

module.exports = {
  getNotifications,
  addNotification,
  markNotificationRead,
  deleteNotification,
};
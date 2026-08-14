const {
  getNotifications,
  addNotification,
  markNotificationRead,
  deleteNotification,
} = require("../controllers/notifications");

module.exports = [
  {
    method: "GET",
    url: "/notifications",
    handler: getNotifications,
  },
  {
    method: "POST",
    url: "/notifications/add",
    handler: addNotification,
  },
  {
    method: "POST",
    url: "/notifications/read",
    handler: markNotificationRead,
  },
  {
    method: "POST",
    url: "/notifications/delete",
    handler: deleteNotification,
  },
];
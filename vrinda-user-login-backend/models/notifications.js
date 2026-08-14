const sequelize = require("../config/dbconnection");

// Get all notifications
const getNotifications = async () => {
  try {
    const [result] = await sequelize.query(`
      SELECT *
      FROM notifications
      ORDER BY created_at DESC
    `);

    return result;
  } catch (err) {
    console.log("Error getNotifications:", err);
    return false;
  }
};

// Add notification
const addNotification = async (title, subtitle) => {
  try {
    const [result] = await sequelize.query(
      `
      INSERT INTO notifications (title, subtitle)
      VALUES (:title, :subtitle)
      `,
      {
        replacements: {
          title,
          subtitle,
        },
      }
    );

    return result;
  } catch (err) {
    console.log("Error addNotification:", err);
    return false;
  }
};

// Mark notification as read
const markAsRead = async (id) => {
  try {
    const [result] = await sequelize.query(
      `
      UPDATE notifications
      SET is_read = 1
      WHERE id = :id
      `,
      {
        replacements: { id },
      }
    );

    return result;
  } catch (err) {
    console.log("Error markAsRead:", err);
    return false;
  }
};

// Delete notification
const deleteNotification = async (id) => {
  try {
    const [result] = await sequelize.query(
      `
      DELETE FROM notifications
      WHERE id = :id
      `,
      {
        replacements: { id },
      }
    );

    return result;
  } catch (err) {
    console.log("Error deleteNotification:", err);
    return false;
  }
};

module.exports = {
  getNotifications,
  addNotification,
  markAsRead,
  deleteNotification,
};
const sequelize = require("../config/dbconnection");

// Get All Audit Logs
const getAuditLogs = async () => {
  try {
    const [result] = await sequelize.query(`
      SELECT *
      FROM audit_logs
      ORDER BY created_at DESC
    `);

    return result;
  } catch (err) {
    console.log(err);
    return false;
  }
};

// Add Audit Log
const addAuditLog = async (action, user, color) => {
  try {
    const [result] = await sequelize.query(
      `
      INSERT INTO audit_logs (action, user, color)
      VALUES (:action, :user, :color)
      `,
      {
        replacements: {
          action,
          user,
          color,
        },
      }
    );

    return result;
  } catch (err) {
    console.log(err);
    return false;
  }
};

module.exports = {
  getAuditLogs,
  addAuditLog,
};
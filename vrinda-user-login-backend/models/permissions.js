const sequelize = require("../config/dbconnection");
const Sequelize = require("sequelize");

const Permissions = sequelize.define(
  "permissions",
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    area: {
      type: Sequelize.STRING(150),
    },
    name: {
      type: Sequelize.STRING(150),
    },
    permission_key: {
      type: Sequelize.STRING(150),
    },
    description: {
      type: Sequelize.STRING(500),
    },
    status: {
      type: Sequelize.INTEGER,
    },
    created_at: {
      type: Sequelize.DATE,
    },
    updated_at: {
      type: Sequelize.DATE,
    },
  },
  {
    tableName: "permissions",
    timestamps: false,
  }
);

// GET ALL PERMISSIONS
const getAllPermissions = async () => {
  try {
    const [results] = await sequelize.query(`
      SELECT
        id,
        area,
        name,
        permission_key,
        description,
        status,
        created_at,
        updated_at
      FROM permissions
      WHERE status != 0
      ORDER BY id ASC
    `);

    return results;
  } catch (error) {
    console.error("Error getAllPermissions:", error);
    return false;
  }
};

module.exports = {
  Permissions,
  getAllPermissions,
};

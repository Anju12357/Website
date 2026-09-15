const sequelize = require("../config/dbconnection");
const Sequelize = require("sequelize");

const Roles = sequelize.define(
  "employee_roles",
  {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },

    name: {
      type: Sequelize.STRING(150),
      allowNull: false,
      unique: true,
    },

    description: {
      type: Sequelize.STRING(500),
      allowNull: true,
    },

    permissions: {
      type: Sequelize.TEXT,
      allowNull: true,
    },

    status: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },

    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
    },

    updated_at: {
      type: Sequelize.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "employee_roles",
    timestamps: false,
  }
);


// ======================================================
// GET ALL ROLES
// ======================================================

const getAllRoles = async () => {
  try {
    const [results] = await sequelize.query(`
      SELECT
        id,
        name,
        description,
        permissions,
        status,
        created_at,
        updated_at
      FROM employee_roles
      WHERE status != 0
      ORDER BY id ASC
    `);

    return results;
  } catch (error) {
    console.error("Error getAllRoles:", error);
    return false;
  }
};


// ======================================================
// GET ROLE BY ID
// ======================================================

const getRoleById = async (id) => {
  try {
    const [results] = await sequelize.query(
      `
        SELECT
          id,
          name,
          description,
          permissions,
          status,
          created_at,
          updated_at
        FROM employee_roles
        WHERE id = :id
          AND status != 0
        LIMIT 1
      `,
      {
        replacements: { id },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    return results || false;
  } catch (error) {
    console.error("Error getRoleById:", error);
    return false;
  }
};


// ======================================================
// CHECK DUPLICATE ROLE NAME
// ======================================================

const roleNameExists = async (name, id = 0) => {
  try {
    const whereClause = id
      ? `
          name = :name
          AND id != :id
          AND status != 0
        `
      : `
          name = :name
          AND status != 0
        `;

    const replacements = id
      ? { name, id }
      : { name };

    const [results] = await sequelize.query(
      `
        SELECT id
        FROM employee_roles
        WHERE ${whereClause}
        LIMIT 1
      `,
      {
        replacements,
      }
    );

    return results.length > 0;
  } catch (error) {
    console.error("Error roleNameExists:", error);
    return false;
  }
};


// ======================================================
// CREATE ROLE
// ======================================================

const createRole = async (data) => {
  try {
    const result = await Roles.create(data);

    return result.dataValues.id;
  } catch (error) {
    console.error("Error createRole:", error);
    return false;
  }
};


// ======================================================
// UPDATE ROLE
// ======================================================

const updateRole = async (id, data) => {
  try {
    const result = await Roles.update(data, {
      where: {
        id,
      },
    });

    return result[0] > 0;
  } catch (error) {
    console.error("Error updateRole:", error);
    return false;
  }
};


// ======================================================
// DELETE ROLE
// ======================================================

const deleteRole = async (id) => {
  try {
    const result = await Roles.update(
      {
        status: 0,
      },
      {
        where: {
          id,
        },
      }
    );

    return result[0] > 0;
  } catch (error) {
    console.error("Error deleteRole:", error);
    return false;
  }
};


// ======================================================
// EXPORT
// ======================================================

module.exports = {
  Roles,
  getAllRoles,
  getRoleById,
  roleNameExists,
  createRole,
  updateRole,
  deleteRole,
};
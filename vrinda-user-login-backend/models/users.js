const sequelize = require("../config/dbconnection");
const Sequelize = require("sequelize");

const Users = sequelize.define(
  "users",
  {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },

    name: {
      type: Sequelize.STRING(300),
      allowNull: false,
    },

    password: {
      type: Sequelize.STRING(300),
      allowNull: false,
    },
    password_changed_at: {
  type: Sequelize.DATE,
  allowNull: true,
},

    email: {
      type: Sequelize.STRING(300),
      allowNull: false,
    },

    role: {
      type: Sequelize.STRING(300),
      allowNull: false,
    },

    user_type: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },

    profile_pic: {
      type: Sequelize.STRING(800),
      allowNull: true,
    },

    cover_pic: {
      type: Sequelize.STRING(800),
      allowNull: true,
    },

    department: {
      type: Sequelize.STRING(100),
      allowNull: false,
    },

    designation: {
      type: Sequelize.STRING(100),
      allowNull: false,
    },

    // NEW
    phone: {
      type: Sequelize.STRING(30),
      allowNull: true,
    },

    // NEW
    joining_date: {
      type: Sequelize.DATEONLY,
      allowNull: true,
    },

    // NEW
    address: {
      type: Sequelize.STRING(500),
      allowNull: true,
    },

    // NEW
    bio: {
      type: Sequelize.TEXT,
      allowNull: true,
    },

    attendance: {
      type: Sequelize.STRING(20),
      allowNull: false,
      defaultValue: "Present",
    },

    status: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },

    timestamp: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },

    added_by: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },

    updated_on: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "users",
    timestamps: false,
  }
);


// ======================================================
// ADD USER
// ======================================================

const addUser = async (data) => {
  try {
    const result = await Users.create(data);

    return result.dataValues.id;
  } catch (error) {
    console.log("Error adding user - ", error);
    return false;
  }
};


// ======================================================
// UPDATE USER
// ======================================================

const updateUser = async (userId, data) => {
  try {
    const result = await Users.update(
      data,
      {
        where: {
          id: userId,
        },
      }
    );

    return result[0] > 0;
  } catch (error) {
    console.log("Error updateUser - ", error);
    return false;
  }
};


// ======================================================
// GET USER BY EMAIL
// ======================================================

const getUserByEmail = async (email) => {
  try {
    const user = await Users.findOne({
      where: {
        email,
        status: 1,
      },
    });

    return !!user;
  } catch (error) {
    console.log(
      "Error getUserByEmail - ",
      error
    );

    return false;
  }
};


// ======================================================
// GET USER BY ID
// ======================================================

const getUserById = async (id) => {
  try {
    const [result] = await sequelize.query(
      `
      SELECT
        id,
        name,
        email,
        role,
        user_type,
        profile_pic,
        cover_pic,

        department,
        designation,

        phone,
        joining_date,
        address,
        bio,

        attendance,
        status,
        timestamp,
        added_by,
        updated_on

      FROM users

      WHERE id = :id
        AND status != 0
      `,
      {
        replacements: {
          id,
        },

        type: sequelize.QueryTypes.SELECT,
      }
    );

    return result || false;

  } catch (error) {
    console.log(
      "Error getUserById - ",
      error
    );

    return false;
  }
};




// ======================================================
// GET USER BY ID WITH PASSWORD
// Used only for password verification
// ======================================================

const getUserWithPassword = async (id) => {
  try {
    const user = await Users.findOne({
      where: {
        id: id,
        status: 1,
      },
      raw: true,
    });

    return user || false;

  } catch (error) {
    console.log(
      "Error getUserWithPassword - ",
      error
    );

    return false;
  }
};
// ======================================================
// GET USER PROFILE
// ======================================================

const getUserProfile = async (user_id) => {
  try {
    const result = await Users.findOne({
      where: {
        id: user_id,
        status: 1,
      },
    });

    return result
      ? result.dataValues
      : false;

  } catch (error) {
    console.log(
      "Error getUserProfile - ",
      error
    );

    return false;
  }
};


// ======================================================
// GET ALL USERS
// ======================================================

const getAllUsers = async () => {
  try {
    const [results] =
      await sequelize.query(
        `
        SELECT
          id,
          name,
          email,
          role,
          user_type,
          profile_pic,
          cover_pic,

          department,
          designation,

          phone,
          joining_date,
          address,
          bio,
password_changed_at,
          attendance,
          status,
          timestamp,
          added_by,
          updated_on

        FROM users

        WHERE status != 0

        ORDER BY id DESC
        `
      );

    return results;

  } catch (error) {
    console.error(
      "Error getAllUsers:",
      error
    );

    return false;
  }
};


// ======================================================
// SEARCH USERS
// ======================================================

const searchUsersModel = async (search) => {
  try {
    const [results] =
      await sequelize.query(
        `
        SELECT
          id,
          name,
          email,
          role,
          user_type,
          profile_pic,
          cover_pic,

          department,
          designation,

          phone,
          joining_date,
          address,
          bio,

          attendance,
          status,
          timestamp,
          added_by,
          updated_on

        FROM users

        WHERE status != 0

        AND (
          name LIKE :search
          OR email LIKE :search
          OR department LIKE :search
          OR designation LIKE :search
          OR phone LIKE :search
          OR address LIKE :search
          OR bio LIKE :search
        )

        ORDER BY id DESC
        `,
        {
          replacements: {
            search: `%${search || ""}%`,
          },
        }
      );

    return results;

  } catch (error) {
    console.log(
      "Error searchUsersModel - ",
      error
    );

    return [];
  }
};


// ======================================================
// CHANGE PASSWORD
// ======================================================

const changePasswordModel = async (
  id,
  password
) => {
  try {
    const result =
      await Users.update(
        {
          password,

          updated_on:
            Math.floor(
              Date.now() / 1000
            ),
        },
        {
          where: {
            id,
          },
        }
      );

    return result[0] > 0;

  } catch (error) {
    console.log(
      "Error changePasswordModel - ",
      error
    );

    return false;
  }
};


// ======================================================
// DELETE USER
// ======================================================

const deleteUserModel = async (
  user_id
) => {
  try {
    const result =
      await Users.destroy({
        where: {
          id: user_id,
        },
      });

    return result > 0;

  } catch (error) {
    console.log(
      "Error deleteUserModel - ",
      error
    );

    return false;
  }
};


// ======================================================
// CHECK EMAIL
// ======================================================

const userEmailExist = async (
  email,
  id = 0
) => {
  try {
    const whereClause = id
      ? `
        email = :email
        AND id != :id
        AND status = 1
      `
      : `
        email = :email
        AND status = 1
      `;

    const replacements = id
      ? {
          email,
          id,
        }
      : {
          email,
        };

    const [results] =
      await sequelize.query(
        `
        SELECT email
        FROM users
        WHERE ${whereClause}
        `,
        {
          replacements,
        }
      );

    return results.length > 0;

  } catch (error) {
    console.error(
      "Error checking email existence:",
      error
    );

    return false;
  }
};


// ======================================================
// UPDATE PROFILE / COVER IMAGE
// ======================================================

const updateUserImage = async (
  userId,
  imageType,
  imagePath
) => {
  try {
    const updateData = {
      updated_on:
        Math.floor(
          Date.now() / 1000
        ),
    };

    if (imageType === "profile") {
      updateData.profile_pic =
        imagePath;
    }

    if (imageType === "cover") {
      updateData.cover_pic =
        imagePath;
    }

    const result =
      await Users.update(
        updateData,
        {
          where: {
            id: userId,
          },
        }
      );

    return result[0] > 0;

  } catch (error) {
    console.log(
      "Error updateUserImage - ",
      error
    );

    return false;
  }
};



  
// ======================================================
// EXPORT
// ======================================================

module.exports = {
  Users,
  addUser,
  updateUser,
  getUserByEmail,
  getUserById,
  getUserWithPassword,
  getAllUsers,
  searchUsersModel,
  changePasswordModel,
  deleteUserModel,
  getUserProfile,
  userEmailExist,
  updateUserImage,
};
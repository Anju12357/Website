const sequelize = require("../config/dbconnection");
const Sequelize = require("sequelize");

const UserSkills = sequelize.define(
  "user_skills",
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },

    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },

    skill: {
      type: Sequelize.STRING(100),
      allowNull: false,
    },

    created_at: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "user_skills",
    timestamps: false,
  }
);

// GET USER SKILLS
const getUserSkills = async (userId) => {
  try {
    const skills = await UserSkills.findAll({
      where: {
        user_id: userId,
      },
      order: [["id", "ASC"]],
    });

    return skills.map((item) => item.dataValues);
  } catch (error) {
    console.error("Error getUserSkills:", error);
    return [];
  }
};

// ADD SKILL
const addUserSkill = async (userId, skill) => {
  try {
    const result = await UserSkills.create({
      user_id: userId,
      skill: skill.trim(),
      created_at: Math.floor(Date.now() / 1000),
    });

    return result.dataValues;
  } catch (error) {
    console.error("Error addUserSkill:", error);
    return false;
  }
};

// DELETE SKILL
const deleteUserSkill = async (id, userId) => {
  try {
    const result = await UserSkills.destroy({
      where: {
        id,
        user_id: userId,
      },
    });

    return result > 0;
  } catch (error) {
    console.error("Error deleteUserSkill:", error);
    return false;
  }
};

module.exports = {
  UserSkills,
  getUserSkills,
  addUserSkill,
  deleteUserSkill,
};
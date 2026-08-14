const {
  getUserSkills,
  addUserSkill,
  deleteUserSkill,
} = require("../models/userSkills");

// ======================================================
// GET USER SKILLS
// ======================================================

const fetchUserSkills = async (req, reply) => {
  try {
    const { user_id } = req.body;

    if (!user_id) {
      return reply.send({
        status: 0,
        message: "User ID is required",
      });
    }

    const skills = await getUserSkills(user_id);

    return reply.send({
      status: 1,
      message: "Skills fetched successfully",
      data: skills,
    });
  } catch (error) {
    console.error("fetchUserSkills error:", error);

    return reply.status(500).send({
      status: 0,
      message: "Server error",
    });
  }
};

// ======================================================
// ADD USER SKILL
// ======================================================

const createUserSkill = async (req, reply) => {
  try {
    const { user_id, skill } = req.body;

    if (!user_id || !skill || !skill.trim()) {
      return reply.send({
        status: 0,
        message: "User ID and skill are required",
      });
    }

    const newSkill = await addUserSkill(
      user_id,
      skill
    );

    if (!newSkill) {
      return reply.send({
        status: 0,
        message: "Failed to add skill",
      });
    }

    return reply.send({
      status: 1,
      message: "Skill added successfully",
      data: newSkill,
    });
  } catch (error) {
    console.error("createUserSkill error:", error);

    return reply.status(500).send({
      status: 0,
      message: "Server error",
    });
  }
};

// ======================================================
// DELETE USER SKILL
// ======================================================

const removeUserSkill = async (req, reply) => {
  try {
    const { id, user_id } = req.body;

    if (!id || !user_id) {
      return reply.send({
        status: 0,
        message: "Skill ID and User ID are required",
      });
    }

    const deleted = await deleteUserSkill(
      id,
      user_id
    );

    if (deleted) {
      return reply.send({
        status: 1,
        message: "Skill deleted successfully",
      });
    }

    return reply.send({
      status: 0,
      message: "Skill not found",
    });
  } catch (error) {
    console.error("removeUserSkill error:", error);

    return reply.status(500).send({
      status: 0,
      message: "Server error",
    });
  }
};

module.exports = {
  fetchUserSkills,
  createUserSkill,
  removeUserSkill,
};
const {
  getAllPermissions,
} = require("../models/permissions");

// GET ALL PERMISSIONS
const fetchAllPermissions = async (req, reply) => {
  try {
    const permissions = await getAllPermissions();

    if (permissions === false) {
      return reply.status(500).send({
        status: 0,
        message: "Unable to fetch permissions",
      });
    }

    return reply.send({
      status: 1,
      message: "Permissions fetched successfully",
      permissions,
      data: permissions,
    });
  } catch (error) {
    console.error("Error fetchAllPermissions:", error);

    return reply.status(500).send({
      status: 0,
      message: "Unable to fetch permissions",
    });
  }
};

module.exports = {
  fetchAllPermissions,
};
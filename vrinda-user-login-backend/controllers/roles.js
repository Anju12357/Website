const {
  getAllRoles,
  getRoleById,
  roleNameExists,
  createRole,
  updateRole,
  deleteRole,
} = require("../models/roles");


// ======================================================
// GET ALL ROLES
// ======================================================

const fetchAllRoles = async (req, reply) => {
  try {
    const roles = await getAllRoles();

    if (roles && roles.length > 0) {
      return reply.send({
        status: 1,
        message: "Roles fetched successfully",
        roles,
      });
    }

    return reply.send({
      status: 0,
      message: "No roles found",
      roles: [],
    });
  } catch (error) {
    console.error("Error fetchAllRoles:", error);

    return reply.status(500).send({
      status: 0,
      message: "Server error",
    });
  }
};


// ======================================================
// GET ROLE BY ID
// ======================================================

const fetchRoleById = async (req, reply) => {
  try {
    const { id } = req.body;

    if (!id) {
      return reply.send({
        status: 0,
        message: "Role ID is required",
      });
    }

    const role = await getRoleById(id);

    if (role) {
      return reply.send({
        status: 1,
        message: "Role fetched successfully",
        role,
      });
    }

    return reply.send({
      status: 0,
      message: "Role not found",
    });
  } catch (error) {
    console.error("Error fetchRoleById:", error);

    return reply.status(500).send({
      status: 0,
      message: "Server error",
    });
  }
};


// ======================================================
// CREATE ROLE
// ======================================================

const addRole = async (req, reply) => {
  try {
    const {
      name,
      description,
      permissions,
    } = req.body;

    const cleanName = String(name || "").trim();

    if (!cleanName) {
      return reply.send({
        status: 0,
        message: "Role name is required",
      });
    }

    const exists = await roleNameExists(cleanName);

    if (exists) {
      return reply.send({
        status: 0,
        message: "Role already exists",
      });
    }

    const permissionList = Array.isArray(permissions)
      ? [...new Set(permissions)]
      : [];

    const now = new Date();

    const roleData = {
      name: cleanName,
      description: description || null,
      permissions: JSON.stringify(permissionList),
      status: 1,
      created_at: now,
      updated_at: now,
    };

    const newRoleId = await createRole(roleData);

    if (!newRoleId) {
      return reply.send({
        status: 0,
        message: "Failed to create role",
      });
    }

    const createdRole = await getRoleById(newRoleId);

    if (createdRole) {
      createdRole.permissions = parsePermissions(createdRole.permissions);
    }

    return reply.send({
      status: 1,
      message: "Role created successfully",
      role: createdRole,
    });
  } catch (error) {
    console.error("Error addRole:", error);

    return reply.status(500).send({
      status: 0,
      message: "Server error",
    });
  }
};


// ======================================================
// UPDATE ROLE
// ======================================================

const editRole = async (req, reply) => {
  try {
    const {
      id,
      name,
      description,
      permissions,
    } = req.body;

    if (!id) {
      return reply.send({
        status: 0,
        message: "Role ID is required",
      });
    }

    const cleanName = String(name || "").trim();

    if (!cleanName) {
      return reply.send({
        status: 0,
        message: "Role name is required",
      });
    }

    const existingRole = await getRoleById(id);

    if (!existingRole) {
      return reply.send({
        status: 0,
        message: "Role not found",
      });
    }

    const exists = await roleNameExists(cleanName, id);

    if (exists) {
      return reply.send({
        status: 0,
        message: "Role already exists",
      });
    }

    const permissionList = Array.isArray(permissions)
      ? [...new Set(permissions)]
      : [];

    const updated = await updateRole(id, {
      name: cleanName,
      description: description || null,
      permissions: JSON.stringify(permissionList),
      updated_at: new Date(),
    });

    if (!updated) {
      return reply.send({
        status: 0,
        message: "Failed to update role",
      });
    }

    const updatedRole = await getRoleById(id);

    if (updatedRole) {
      updatedRole.permissions = parsePermissions(
        updatedRole.permissions
      );
    }

    return reply.send({
      status: 1,
      message: "Role updated successfully",
      role: updatedRole,
    });
  } catch (error) {
    console.error("Error editRole:", error);

    return reply.status(500).send({
      status: 0,
      message: "Server error",
    });
  }
};


// ======================================================
// DELETE ROLE
// ======================================================

const removeRole = async (req, reply) => {
  try {
    const { id } = req.body;

    if (!id) {
      return reply.send({
        status: 0,
        message: "Role ID is required",
      });
    }

    const existingRole = await getRoleById(id);

    if (!existingRole) {
      return reply.send({
        status: 0,
        message: "Role not found",
      });
    }

    const deleted = await deleteRole(id);

    if (!deleted) {
      return reply.send({
        status: 0,
        message: "Failed to delete role",
      });
    }

    return reply.send({
      status: 1,
      message: "Role deleted successfully",
    });
  } catch (error) {
    console.error("Error removeRole:", error);

    return reply.status(500).send({
      status: 0,
      message: "Server error",
    });
  }
};


// ======================================================
// PERMISSION JSON HELPER
// ======================================================

const parsePermissions = (permissions) => {
  if (!permissions) {
    return [];
  }

  if (Array.isArray(permissions)) {
    return permissions;
  }

  try {
    const parsed = JSON.parse(permissions);

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};


// ======================================================
// EXPORT
// ======================================================

module.exports = {
  fetchAllRoles,
  fetchRoleById,
  addRole,
  editRole,
  removeRole,
};
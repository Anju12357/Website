const {
  fetchAllRoles,
  fetchRoleById,
  addRole,
  editRole,
  removeRole,
} = require("../controllers/roles");

const roleRoutes = [
  {
    method: "POST",
    url: "/webservices/roles/get-roles",
    handler: fetchAllRoles,
  },

  {
    method: "POST",
    url: "/webservices/roles/get-role-by-id",
    handler: fetchRoleById,
  },

  {
    method: "POST",
    url: "/webservices/roles/create-role",
    handler: addRole,
  },

  {
    method: "POST",
    url: "/webservices/roles/update-role",
    handler: editRole,
  },

  {
    method: "POST",
    url: "/webservices/roles/delete-role",
    handler: removeRole,
  },
];

module.exports = roleRoutes;
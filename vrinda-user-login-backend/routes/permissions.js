const {
  fetchAllPermissions,
} = require("../controllers/permissions");

const permissionRoutes = [
  {
    method: "POST",
    url: "/webservices/permissions/get-permissions",
    handler: fetchAllPermissions,
  },
];

module.exports = permissionRoutes;
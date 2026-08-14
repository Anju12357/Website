const {
  createUser,
  fetchAllUsers,
  deleteUser,
  getUserById,
  updateUser,
  changePassword,
  searchUsers,
  uploadUserImage,
} = require("../controllers/users");


const userRoutes = [

  // ====================================================
  // CREATE USER
  // ====================================================

  {
    method: "POST",
    url: "/webservices/users/add-users",
    handler: createUser,
  },


  // ====================================================
  // UPDATE USER
  // ====================================================

  {
    method: "POST",
    url: "/webservices/users/update-user",
    handler: updateUser,
  },


  // ====================================================
  // CHANGE PASSWORD
  // ====================================================

  {
    method: "POST",
    url: "/webservices/users/change-password",
    handler: changePassword,
  },


  // ====================================================
  // DELETE USER
  // ====================================================

  {
    method: "POST",
    url: "/webservices/users/delete-user",
    handler: deleteUser,
  },


  // ====================================================
  // GET USER BY ID
  // ====================================================

  {
    method: "POST",
    url: "/webservices/users/get-user-by-id",
    handler: getUserById,
  },


  // ====================================================
  // GET ALL USERS
  // ====================================================

  {
    method: "POST",
    url: "/webservices/users/get-all-users",
    handler: fetchAllUsers,
  },


  // ====================================================
  // SEARCH USERS
  // ====================================================

  {
    method: "POST",
    url: "/webservices/users/search-users",
    handler: searchUsers,
  },


  // ====================================================
  // UPLOAD PROFILE / COVER IMAGE
  // ====================================================

  {
    method: "POST",
    url: "/webservices/users/upload-image",
    handler: uploadUserImage,
  },

];


module.exports = userRoutes;
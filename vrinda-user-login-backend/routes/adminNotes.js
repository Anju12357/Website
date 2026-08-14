const {
  getNotes,
  addNote,
  updateNote,
  deleteNote,
} = require("../controllers/adminNotes");

module.exports = [
  {
    method: "GET",
    url: "/admin-notes",
    handler: getNotes,
  },
  {
    method: "POST",
    url: "/admin-notes/add",
    handler: addNote,
  },
  {
    method: "POST",
    url: "/admin-notes/update",
    handler: updateNote,
  },
  {
    method: "POST",
    url: "/admin-notes/delete",
    handler: deleteNote,
  },
];
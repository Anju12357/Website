const {
  getMeetings,
  addMeeting,
  deleteMeeting,
} = require("../controllers/meetings");

module.exports = [
  {
    method: "GET",
    url: "/meetings",
    handler: getMeetings,
  },
  {
    method: "POST",
    url: "/meetings/add",
    handler: addMeeting,
  },
  {
    method: "POST",
    url: "/meetings/delete",
    handler: deleteMeeting,
  },
];
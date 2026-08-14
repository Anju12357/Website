const {
  sendAnnouncement,
} = require("../controllers/mail");

const mailRoutes = [
  {
    method: "POST",
    url: "/webservices/mail/send-announcement",
    handler: sendAnnouncement,
  },
];

module.exports = mailRoutes;
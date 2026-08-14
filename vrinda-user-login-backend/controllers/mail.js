const nodemailer = require("nodemailer");
const Users = require("../models/users");

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT || 587),
  secure: false,

  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },

  connectionTimeout: 30000,
  greetingTimeout: 30000,
  socketTimeout: 30000,
});

const sendAnnouncement = async (req, reply) => {
  try {
    const {
      subject,
      message,
      recipientIds,
    } = req.body;

    // -----------------------------
    // VALIDATE SUBJECT
    // -----------------------------
    if (!subject || !subject.trim()) {
      return reply.code(400).send({
        status: 0,
        message: "Subject is required",
      });
    }

    // -----------------------------
    // VALIDATE MESSAGE
    // -----------------------------
    if (!message || !message.trim()) {
      return reply.code(400).send({
        status: 0,
        message: "Announcement message is required",
      });
    }

    // -----------------------------
    // VALIDATE RECIPIENTS
    // -----------------------------
    if (
      !Array.isArray(recipientIds) ||
      recipientIds.length === 0
    ) {
      return reply.code(400).send({
        status: 0,
        message: "Please select at least one recipient",
      });
    }

    // -----------------------------
    // GET ALL USERS
    // -----------------------------
    const users = await Users.getAllUsers();

    if (!users || !users.length) {
      return reply.code(404).send({
        status: 0,
        message: "No employees found",
      });
    }

    // -----------------------------
    // GET ONLY SELECTED USERS
    // -----------------------------
    const selectedUsers = users.filter((user) =>
      recipientIds.includes(Number(user.id))
    );

    if (!selectedUsers.length) {
      return reply.code(400).send({
        status: 0,
        message: "Selected employees were not found",
      });
    }

    // -----------------------------
    // GET EMAIL ADDRESSES
    // -----------------------------
    const emailAddresses = [
      ...new Set(
        selectedUsers
          .map((user) => user.email)
          .filter(
            (email) =>
              typeof email === "string" &&
              email.trim() !== ""
          )
          .map((email) => email.trim())
      ),
    ];

    if (!emailAddresses.length) {
      return reply.code(400).send({
        status: 0,
        message:
          "Selected employees do not have email addresses",
      });
    }

    console.log(
      "Selected recipients:",
      selectedUsers.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
      }))
    );

    // -----------------------------
    // SEND EMAIL
    // -----------------------------
    const mailResult = await transporter.sendMail({
      from: process.env.MAIL_FROM,

      to: emailAddresses,

      subject: subject.trim(),

      text: message.trim(),

      html: `
        <div style="
          font-family: Arial, sans-serif;
          max-width: 650px;
          margin: auto;
          padding: 30px;
        ">
          <h2 style="color:#0284C7;">
            ${subject.trim()}
          </h2>

          <p style="
            font-size:16px;
            line-height:1.6;
            color:#222;
          ">
            ${message
              .trim()
              .replace(/\n/g, "<br />")}
          </p>

          <hr />

          <p style="
            color:#777;
            font-size:13px;
          ">
            This announcement was sent from EMS Portal.
          </p>
        </div>
      `,
    });

    console.log(
      "MAIL SENT:",
      mailResult.messageId
    );

    // -----------------------------
    // SUCCESS
    // -----------------------------
    return reply.send({
      status: 1,
      message: "Announcement sent successfully",
      recipientCount: emailAddresses.length,
    });

  } catch (error) {
    console.error(
      "SEND ANNOUNCEMENT ERROR:",
      error
    );

    return reply.code(500).send({
      status: 0,
      message: "Failed to send announcement",
      error: error.message,
    });
  }
};


// ======================================================
// EXPORT CONTROLLER
// ======================================================

module.exports = {
  sendAnnouncement,
};
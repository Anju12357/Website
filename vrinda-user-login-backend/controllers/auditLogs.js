const AuditLogs = require("../models/auditLogs");

// Get All Logs
const getAuditLogs = async (req, reply) => {
  try {
    const logs = await AuditLogs.getAuditLogs();

    reply.send({
      status: 1,
      data: logs,
    });
  } catch (err) {
    console.log(err);

    reply.status(500).send({
      status: 0,
      message: "Server Error",
    });
  }
};

module.exports = {
  getAuditLogs,
};
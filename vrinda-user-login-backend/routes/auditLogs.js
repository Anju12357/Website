const { getAuditLogs } = require("../controllers/auditLogs");

module.exports = [
  {
    method: "GET",
    url: "/audit-logs",
    handler: getAuditLogs,
  },
];
const sequelize = require("../config/dbconnection");
const { createObjectCsvWriter } = require("csv-writer");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const Users = require("../models/users");

const getDashboardStats = async (req, reply) => {
  try {
    const [result] = await sequelize.query(`
      SELECT
      COUNT(*) AS totalEmployees,
      COUNT(DISTINCT department) AS totalDepartments,
      SUM(CASE WHEN attendance='Present' THEN 1 ELSE 0 END) AS presentEmployees,
      SUM(CASE WHEN attendance='Absent' THEN 1 ELSE 0 END) AS absentEmployees
      FROM users
      WHERE status=1
    `);

    reply.send({
      status: 1,
      data: result[0],
    });

  } catch (err) {
    console.log(err);
    reply.send({
      status: 0,
      message: "Server Error",
    });
  }
};


const getActivities = async (req, reply) => {
  try {
    reply.send({
      status: 1,
      data: [
        {
          id: 1,
          action: "Employee Added",
          user: "Admin",
          time: "2 mins ago",
          color: "#10B981",
        },
        {
          id: 2,
          action: "Attendance Updated",
          user: "Rahul",
          time: "10 mins ago",
          color: "#06B6D4",
        },
        {
          id: 3,
          action: "Profile Updated",
          user: "Anju R",
          time: "30 mins ago",
          color: "#F59E0B",
        },
      ],
    });
  } catch (err) {
    reply.status(500).send(err);
  }
};

const getMeetings = async (req, reply) => {
  try {
    reply.send({
      status: 1,
      data: {
        title: "Tech Architecture Sync",
        time: "10:00 AM",
        platform: "Google Meet",
        button: "Join Video Call"
      }
    });
  } catch (err) {
    reply.status(500).send(err);
  }
};

const getNotifications = async (req, reply) => {
  try {
    reply.send({
      status: 1,
      data: [
        {
          id: 1,
          title: "Leave request pending approval",
          subtitle: "10 mins ago • HR Dept",
        },
        {
          id: 2,
          title: "New employee joined",
          subtitle: "30 mins ago • Engineering",
        },
        {
          id: 3,
          title: "Attendance updated",
          subtitle: "1 hour ago • Operations",
        },
      ],
    });
  } catch (err) {
    reply.status(500).send(err);
  }
};

const getEmployeeReport = async (req, reply) => {
  try {
    const [employees] = await sequelize.query(`
      SELECT
        id,
        name,
        email,
        department,
        designation,
        attendance
      FROM users
      WHERE status = 1
    `);

    reply.send({
      status: 1,
      data: employees,
    });

  } catch (err) {
    console.log(err);

    reply.send({
      status: 0,
      message: "Server Error",
    });
  }
};


const getDepartmentChart = async (req, reply) => {
  try {
    const [result] = await sequelize.query(`
      SELECT
        department,
        COUNT(*) AS total
      FROM users
      WHERE status = 1
      GROUP BY department
    `);

    reply.send({
      status: 1,
      data: result,
    });
  } catch (err) {
    console.log(err);
    reply.send({
      status: 0,
      message: "Server Error",
    });
  }
};

const report = async (req, reply) => {
  try {
    const users = await Users.getAllUsers();

    const reportsDir = path.join(__dirname, "../uploads/reports");

    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const filePath = path.join(reportsDir, "employee-report.pdf");

    const doc = new PDFDocument({ margin: 40 });
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    doc.fontSize(22).text("Employee Management System", {
      align: "center",
    });

    doc.moveDown();
    doc.fontSize(16).text("Employee Report", {
      align: "center",
    });

    doc.moveDown();
    doc.text(`Generated On: ${new Date().toLocaleString()}`);
    doc.moveDown();

    users.forEach((user, index) => {
      doc.text(`${index + 1}. ${user.name}`);
      doc.text(`Email: ${user.email}`);
      doc.text(`Department: ${user.department}`);
      doc.text(`Designation: ${user.designation}`);
      doc.text(`Attendance: ${user.attendance}`);
      doc.moveDown();
    });

    doc.end();

    // Wait until PDF is completely written
    await new Promise((resolve, reject) => {
      stream.on("finish", resolve);
      stream.on("error", reject);
    });

    return reply.send({
      status: 1,
      file: "http://localhost:4000/uploads/reports/employee-report.pdf",
    });

  } catch (err) {
    console.log(err);

    return reply.status(500).send({
      status: 0,
      message: "Failed to generate report",
    });
  }
};

module.exports = {
  getDashboardStats,
  getActivities,
  getMeetings,
  getNotifications,
  getEmployeeReport,
  getDepartmentChart,
   report,
};
const sequelize = require("../config/dbconnection");

// Get all meetings
const getMeetings = async () => {
  try {
    const [result] = await sequelize.query(`
      SELECT *
      FROM meetings
      ORDER BY created_at DESC
    `);

    return result;
  } catch (err) {
    console.log("Error getMeetings:", err);
    return false;
  }
};

// Add meeting
const addMeeting = async (title, meeting_time, platform, meeting_link) => {
  try {
    const [result] = await sequelize.query(
      `
      INSERT INTO meetings
      (title, meeting_time, platform, meeting_link)
      VALUES (:title, :meeting_time, :platform, :meeting_link)
      `,
      {
        replacements: {
          title,
          meeting_time,
          platform,
          meeting_link,
        },
      }
    );

    return result;
  } catch (err) {
    console.log("Error addMeeting:", err);
    return false;
  }
};

// Delete meeting
const deleteMeeting = async (id) => {
  try {
    const [result] = await sequelize.query(
      `
      DELETE FROM meetings
      WHERE id = :id
      `,
      {
        replacements: { id },
      }
    );

    return result;
  } catch (err) {
    console.log("Error deleteMeeting:", err);
    return false;
  }
};

module.exports = {
  getMeetings,
  addMeeting,
  deleteMeeting,
};
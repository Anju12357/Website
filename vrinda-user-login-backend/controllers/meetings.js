const Meetings = require("../models/meetings");

// Get all meetings
const getMeetings = async (req, reply) => {
  try {
    const meetings = await Meetings.getMeetings();

    reply.send({
      status: 1,
      data: meetings,
    });
  } catch (err) {
    console.log("Error getMeetings:", err);

    reply.status(500).send({
      status: 0,
      message: "Server Error",
    });
  }
};

// Add meeting
const addMeeting = async (req, reply) => {
  try {
    const {
      title,
      meeting_time,
      platform,
      meeting_link,
    } = req.body;

    if (!title || !meeting_time || !platform) {
      return reply.send({
        status: 0,
        message: "Title, meeting time and platform are required",
      });
    }

    const result = await Meetings.addMeeting(
      title,
      meeting_time,
      platform,
      meeting_link || null
    );

    reply.send({
      status: 1,
      message: "Meeting added successfully",
      data: result,
    });
  } catch (err) {
    console.log("Error addMeeting:", err);

    reply.status(500).send({
      status: 0,
      message: "Server Error",
    });
  }
};

// Delete meeting
const deleteMeeting = async (req, reply) => {
  try {
    const { id } = req.body;

    if (!id) {
      return reply.send({
        status: 0,
        message: "Meeting ID is required",
      });
    }

    await Meetings.deleteMeeting(id);

    reply.send({
      status: 1,
      message: "Meeting deleted successfully",
    });
  } catch (err) {
    console.log("Error deleteMeeting:", err);

    reply.status(500).send({
      status: 0,
      message: "Server Error",
    });
  }
};

module.exports = {
  getMeetings,
  addMeeting,
  deleteMeeting,
};
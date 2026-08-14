const Notes = require("../models/adminNotes");

// Get All Notes
const getNotes = async (req, reply) => {
  try {
    const notes = await Notes.getAllNotes();

    reply.send({
      status: 1,
      data: notes,
    });
  } catch (err) {
    console.log(err);

    reply.status(500).send({
      status: 0,
      message: "Server Error",
    });
  }
};

// Add Note
const addNote = async (req, reply) => {
  try {
    const { note } = req.body;

    if (!note) {
      return reply.send({
        status: 0,
        message: "Note is required",
      });
    }

    await Notes.addNote(note);

    reply.send({
      status: 1,
      message: "Note added successfully",
    });

  } catch (err) {
    console.log(err);

    reply.status(500).send({
      status: 0,
      message: "Server Error",
    });
  }
};

// Update Note
const updateNote = async (req, reply) => {
  try {
    const { id, note } = req.body;

    await Notes.updateNote(id, note);

    reply.send({
      status: 1,
      message: "Note updated successfully",
    });

  } catch (err) {
    console.log(err);

    reply.status(500).send({
      status: 0,
      message: "Server Error",
    });
  }
};

// Delete Note
const deleteNote = async (req, reply) => {
  try {
    const { id } = req.body;

    await Notes.deleteNote(id);

    reply.send({
      status: 1,
      message: "Note deleted successfully",
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
  getNotes,
  addNote,
  updateNote,
  deleteNote,
};
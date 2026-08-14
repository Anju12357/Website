const sequelize = require("../config/dbconnection");

const getAllNotes = async () => {
  try {
    const [result] = await sequelize.query(`
      SELECT *
      FROM admin_notes
      ORDER BY updated_at DESC
    `);

    return result;
  } catch (err) {
    console.log(err);
    return false;
  }
};

const addNote = async (note) => {
  try {
    const [result] = await sequelize.query(
      `INSERT INTO admin_notes (note) VALUES (:note)`,
      {
        replacements: { note },
      }
    );

    return result;
  } catch (err) {
    console.log(err);
    return false;
  }
};

const updateNote = async (id, note) => {
  try {
    const [result] = await sequelize.query(
      `UPDATE admin_notes
       SET note = :note
       WHERE id = :id`,
      {
        replacements: {
          id,
          note,
        },
      }
    );

    return result;
  } catch (err) {
    console.log(err);
    return false;
  }
};

const deleteNote = async (id) => {
  try {
    const [result] = await sequelize.query(
      `DELETE FROM admin_notes
       WHERE id = :id`,
      {
        replacements: { id },
      }
    );

    return result;
  } catch (err) {
    console.log(err);
    return false;
  }
};

module.exports = {
  getAllNotes,
  addNote,
  updateNote,
  deleteNote,
};
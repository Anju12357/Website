const sequelize = require("../config/dbconnection");

const getPerformance = async () => {
  try {
    const [results] = await sequelize.query(`
      SELECT *
      FROM performance
      ORDER BY id ASC
    `);

    return results;
  } catch (error) {
    console.log("Error getPerformance -", error);
    return [];
  }
};

module.exports = {
  getPerformance,
};
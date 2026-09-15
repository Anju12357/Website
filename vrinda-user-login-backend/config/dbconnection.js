const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE,
  process.env.MYSQL_USER,
  process.env.MYSQL_PASSWORD,
  {
    host: process.env.MYSQL_HOST,
    dialect: "mysql",
    port: process.env.MYSQL_PORT || 3306,
  }
);

console.log("DB CONFIG:", {
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  database: process.env.MYSQL_DATABASE,
  user: process.env.MYSQL_USER,
  passwordSet: !!process.env.MYSQL_PASSWORD,
  passwordLength: process.env.MYSQL_PASSWORD?.length
});

module.exports = sequelize;

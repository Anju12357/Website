const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('login_app', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
  port: 3306,
});

module.exports = sequelize
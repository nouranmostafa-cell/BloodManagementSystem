const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Hospital = sequelize.define('Hospital', {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true }
});


module.exports = Hospital;
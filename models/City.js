const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const City = sequelize.define('City', {
  name: { type: DataTypes.STRING, allowNull: false, unique: true },
  latitude: { type: DataTypes.FLOAT, allowNull: false },
  longitude: { type: DataTypes.FLOAT, allowNull: false }
});

module.exports = City;
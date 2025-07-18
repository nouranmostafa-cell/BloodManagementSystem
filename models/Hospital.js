const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Hospital = sequelize.define('Hospital', {
  name: { type: DataTypes.STRING, allowNull: false },
  city: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false },
  latitude: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: true
  },
  longitude: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: true
  }
});

module.exports = Hospital;
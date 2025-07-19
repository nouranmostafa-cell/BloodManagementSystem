const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const BloodStock = sequelize.define('BloodStock', {
  donation_id: { type: DataTypes.INTEGER, allowNull: false },
  blood_type: { type: DataTypes.STRING, allowNull: false },
  expiration_date: { type: DataTypes.DATE, allowNull: false }
});

module.exports = BloodStock;

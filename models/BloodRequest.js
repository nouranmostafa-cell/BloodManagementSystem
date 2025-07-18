const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const BloodRequest = sequelize.define('BloodRequest', {
  hospital_id: { type: DataTypes.INTEGER, allowNull: false },
  blood_type: { type: DataTypes.STRING, allowNull: false },
  quantity: { type: DataTypes.INTEGER, allowNull: false },
  patient_status: { type: DataTypes.ENUM('Immediate', 'Urgent', 'Normal'), allowNull: false },
  fulfilled: { type: DataTypes.BOOLEAN, defaultValue: false }
});

module.exports = BloodRequest;

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Donor = sequelize.define('Donor', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  national_id: { type: DataTypes.STRING, unique: true, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  city: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false }
});

module.exports = Donor;
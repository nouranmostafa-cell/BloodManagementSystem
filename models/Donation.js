const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Donation = sequelize.define('Donation', {
    donor_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Donors',
            key: 'id'
        },
        validate: {
            notEmpty: true
        }
    },
  blood_type: { type: DataTypes.STRING, allowNull: false },
  city_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Cities', // table name, case-sensitive in some DBs
      key: 'id'
    }
  },
   quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 0
    }
  },
  virus_test_result: {
    type: DataTypes.ENUM('positive', 'negative', 'pending'),
    defaultValue: 'pending'
  },
  status: {
    type: DataTypes.ENUM('pending_test', 'rejected', 'accepted'),
    defaultValue: 'pending_test'
  }
});

module.exports = Donation;
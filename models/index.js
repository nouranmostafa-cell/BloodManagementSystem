const { sequelize } = require('../config/db');
const Donor = require('./Donor');
const Donation = require('./Donation');
const BloodStock = require('./BloodStock');
const Hospital = require('./Hospital');
const BloodRequest = require('./BloodRequest');
const User = require('./User');

// Define associations

Donor.hasMany(Donation, {
    foreignKey: 'donor_id',
    as: 'Donations'
});

Donation.belongsTo(Donor, {
    foreignKey: 'donor_id',
    as: 'Donor'
});

Donation.hasOne(BloodStock, { foreignKey: 'donation_id' });
BloodStock.belongsTo(Donation, { foreignKey: 'donation_id' });

Hospital.hasMany(BloodRequest, { foreignKey: 'hospital_id' });
BloodRequest.belongsTo(Hospital, { foreignKey: 'hospital_id' });

module.exports = {
  sequelize,
  User,
  Donor,
  Donation,
  BloodStock,
  Hospital,
  BloodRequest
};

const { sequelize } = require('../config/db');
const Donor = require('./Donor');
const Donation = require('./Donation');
const BloodStock = require('./BloodStock');
const Hospital = require('./Hospital');
const BloodRequest = require('./BloodRequest');
const User = require('./User');
const City = require('./City');

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

// City <--> Hospital
City.hasMany(Hospital, { foreignKey: 'city_id' });
Hospital.belongsTo(City, { foreignKey: 'city_id' });


City.hasMany(Donation, { foreignKey: 'city_id' });
Donation.belongsTo(City, { foreignKey: 'city_id' });


module.exports = {
  sequelize,
  User,
  Donor,
  Donation,
  BloodStock,
  Hospital,
  BloodRequest,
  City
};

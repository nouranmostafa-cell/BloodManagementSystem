const { BloodStock, Donation, Donor, BloodRequest, Hospital, City, sequelize } = require('../models');
const { sendEmail } = require('../utils/mailer.js');
const { Op } = require('sequelize');

// Dashboard
exports.dashboard = async (req, res) => {
  try {
    // Use proper error handling and default values
    const totalStock = await BloodStock.sum('quantity') || 0;
    const totalDonations = await Donation.count() || 0;
    const pendingRequests = await BloodRequest.count({ 
      where: { fulfilled: false } 
    }) || 0;

    const stockByType = await BloodStock.findAll({
      attributes: [
        'blood_type',
        [sequelize.fn('SUM', sequelize.col('quantity')), 'total']
      ],
      group: ['blood_type']
    });

    res.render('stockManager/dashboard', {
      title: 'Stock Manager Dashboard',
      totalStock,
      totalDonations,
      pendingRequests,
      stockByType
    });
    
  } catch (error) {
    console.error('Dashboard error:', error);
    res.render('error', {
      title: 'Error',
      message: 'Failed to load dashboard data'
    });
  }
};

// View all blood stock
exports.viewStock = async (req, res) => {
  try {

    const cities = await City.findAll({
      attributes: ['id', 'name'],
      order: [['name', 'ASC']]
    });

    const stock = await BloodStock.findAll({
      include: [{
        model: Donation,
        include: [{
          model: City,
          attributes: ['name']
        }]
      }],
      order: [['expiration_date', 'ASC']]
    });

    res.render('stockManager/stockList', {
      title: 'Stock List',
      stock,
      cities
    });
  } catch (error) {
    console.error('View stock error:', error);
    res.render('error', {
      title: 'Error',
      message: 'Failed to load stock data'
    });
  }
};

// Update searchStock function as well
exports.searchStock = async (req, res) => {
  try {
    const { blood_type, city_id, status } = req.query;

    const whereClause = {};
    if (blood_type) whereClause.blood_type = blood_type;
    if (status === 'expired') whereClause.expiration_date = { [sequelize.Op.lt]: new Date() };
    if (status === 'valid') whereClause.expiration_date = { [sequelize.Op.gt]: new Date() };

    const stock = await BloodStock.findAll({
      where: whereClause,
      include: [
        {
          model: Donation,
          include: [
            {
              model: City,
              attributes: ['id', 'name'],
              ...(city_id && { where: { id: city_id } })
            }
          ]
        }
      ],
      order: [['expiration_date', 'ASC']]
    });

    const cities = await City.findAll({
      attributes: ['id', 'name'],
      order: [['name', 'ASC']]
    });

    res.render('stockManager/stockList', {
      title: 'Filtered Stock',
      stock,
      cities
    });
  } catch (error) {
    console.error('Search stock error:', error);
    res.render('error', {
      title: 'Error',
      message: 'Failed to search stock'
    });
  }
};


// Remove expired blood
exports.removeExpiredUnits = async (req, res) => {
  const removed = await BloodStock.destroy({
    where: { expiration_date: { [Op.lt]: new Date() } }
  });

  res.redirect('/manager/stock');
};

// View donation logs
exports.viewDonations = async (req, res) => {
  try {
    const donations = await Donation.findAll({
      include: [
        {
          model: Donor,
          as: 'Donor',
          attributes: ['name', 'national_id']
        },
        {
          model: City,
          attributes: ['name']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.render('stockManager/donationLogs', {
      title: 'Donation Records',
      donations
    });
  } catch (error) {
    console.error('View donations error:', error);
    res.render('error', {
      title: 'Error',
      message: 'Failed to load donation records'
    });
  }
};


// View hospital requests
exports.viewRequests = async (req, res) => {
  const requests = await BloodRequest.findAll({
    include: [{ model: Hospital, include: [City] }]
  });

  res.render('stockManager/allRequests', {
    title: 'All Requests',
    requests
  });
};

// Accept request
exports.acceptRequest = async (req, res) => {
  const requestId = req.params.id;
  const request = await BloodRequest.findByPk(requestId, { include: [Hospital] });

  const available = await BloodStock.findOne({
    where: {
      blood_type: request.blood_type,
      city_id: request.hospital.city_id,
      quantity: { [sequelize.Op.gte]: request.quantity }
    }
  });

  if (!available) {
    return res.redirect(`/stock-manager/requests?error=Not enough stock`);
  }

  await available.decrement('quantity', { by: request.quantity });
  await request.update({ fulfilled: true });

  // notify hospital
  await sendEmail(request.hospital.email, 'Request Approved', 'Your blood request has been approved.');

  res.redirect('/stock-manager/requests');
};

// Reject request
exports.rejectRequest = async (req, res) => {
  const requestId = req.params.id;
  const { reason } = req.body;

  const request = await BloodRequest.findByPk(requestId, { include: [Hospital] });
  await request.update({ fulfilled: false, rejection_reason: reason });

  await sendEmail(request.hospital.email, 'Request Rejected', `Your request was rejected: ${reason}`);

  res.redirect('/stock-manager/requests');
};



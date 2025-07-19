const { BloodStock, Donation, Donor, BloodRequest, Hospital, City, sequelize } = require('../models');
const { sendEmail } = require('../utils/mailer.js');
const { Op } = require('sequelize');
const bloodRequestService = require('../services/bloodRequestService');
const matchRequestService = require('../services/matchRequestService');

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Dashboard
exports.dashboard = async (req, res) => {
  try {
    // Get total stock by summing donation quantities
    const totalStock = await BloodStock.sum('quantity', {
      include: [{
        model: Donation,
        attributes: ['quantity']
      }]
    }) || 0;

    const totalDonations = await Donation.count() || 0;
    
    const pendingRequests = await BloodRequest.count({ 
      where: { fulfilled: false } 
    }) || 0;

    // Get stock by blood type including donation quantities
    const stockByType = await BloodStock.findAll({
      attributes: [
        'blood_type',
        [sequelize.fn('SUM', sequelize.col('Donation.quantity')), 'total']
      ],
      include: [{
        model: Donation,
        attributes: []  // Include for join but don't select fields
      }],
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
// exports.viewDonations = async (req, res) => {
//   try {
//     const donations = await Donation.findAll({
//       include: [
//         {
//           model: Donor,
//           as: 'Donor',
//           attributes: ['name', 'national_id']
//         },
//         {
//           model: City,
//           attributes: ['name']
//         }
//       ],
//       order: [['createdAt', 'DESC']]
//     });

//     res.render('stockManager/donationLogs', {
//       title: 'Donation Records',
//       donations
//     });
//   } catch (error) {
//     console.error('View donations error:', error);
//     res.render('error', {
//       title: 'Error',
//       message: 'Failed to load donation records'
//     });
//   }
// };


// ...existing code...

exports.viewDonations = async (req, res) => {
  try {
    const cities = await City.findAll({
      attributes: ['id', 'name'],
      order: [['name', 'ASC']]
    });

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
      donations,
      cities
    });
  } catch (error) {
    console.error('View donations error:', error);
    res.render('error', {
      title: 'Error',
      message: 'Failed to load donation records'
    });
  }
};

exports.searchDonations = async (req, res) => {
  try {
    const { blood_type, donor_name, city_id } = req.query;

    const cities = await City.findAll({
      attributes: ['id', 'name'],
      order: [['name', 'ASC']]
    });

    let whereClause = {};
    if (blood_type) whereClause.blood_type = blood_type;
    if (city_id) whereClause.city_id = city_id;

    const donations = await Donation.findAll({
      where: whereClause,
      include: [
        {
          model: Donor,
          as: 'Donor',
          attributes: ['name', 'national_id'],
          ...(donor_name && {
            where: {
              name: {
                [Op.like]: `%${donor_name}%`
              }
            }
          })
        },
        {
          model: City,
          attributes: ['name']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.render('stockManager/donationLogs', {
      title: 'Filtered Donations',
      donations,
      cities,
      searchParams: req.query
    });
  } catch (error) {
    console.error('Search donations error:', error);
    res.render('error', {
      title: 'Error',
      message: 'Failed to search donations'
    });
  }
};

// View hospital requests


exports.viewRequests = async (req, res) => {
  try {
    const cities = await City.findAll({
      attributes: ['id', 'name'],
      order: [['name', 'ASC']]
    });

    const requests = await bloodRequestService.getAllRequests();
    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    res.render('stockManager/allRequests', {
      title: 'Blood Requests',
      requests,
      cities,
      bloodTypes,
      selected: {
        blood_type: '',
        city: '',
        patient_status: ''
      }
    });
  } catch (error) {
    console.error('View requests error:', error);
    res.render('error', {
      title: 'Error',
      message: 'Failed to load requests'
    });
  }
};

exports.searchRequests = async (req, res) => {
  try {
    const { blood_type, city_id, patient_status } = req.query;
    const cities = await City.findAll({
      attributes: ['id', 'name'],
      order: [['name', 'ASC']]
    });

    const requests = await bloodRequestService.searchRequests({
      blood_type,
      city_id,
      patient_status
    });

    res.render('stockManager/allRequests', {
      title: 'Filtered Requests',
      requests,
      cities,
      bloodTypes,
      selected: { blood_type, city: city_id, status: patient_status }
    });
  } catch (error) {
    console.error('Search requests error:', error);
    res.render('error', {
      title: 'Error',
      message: 'Failed to search requests'
    });
  }
};

exports.processMatches = async (req, res) => {
  try {
    const fulfilled = await matchRequestService();
    const requests = await bloodRequestService.getAllRequests();
    const cities = await City.findAll({
      attributes: ['id', 'name'],
      order: [['name', 'ASC']]
    });

    res.render('stockManager/allRequests', {
      title: 'Matched Requests',
      requests,
      cities,
      bloodTypes,
      fulfilled,
      success: 'Requests have been processed successfully.'
    });
  } catch (error) {
    console.error('Matching error:', error);
    res.render('error', {
      title: 'Error',
      message: 'Failed to match requests automatically'
    });
  }
};

exports.acceptRequest = async (req, res) => {
  try {
    await bloodRequestService.acceptRequest(req.params.id);
    res.redirect('/manager/requests');
  } catch (error) {
    console.error('Accept request error:', error);
    res.redirect('/manager/requests?error=' + encodeURIComponent(error.message));
  }
};

exports.rejectRequest = async (req, res) => {
  try {
    await bloodRequestService.rejectRequest(req.params.id, req.body.reason);
    res.redirect('/manager/requests');
  } catch (error) {
    console.error('Reject request error:', error);
    res.redirect('/manager/requests?error=' + encodeURIComponent(error.message));
  }
};



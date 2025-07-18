
const { Donation, Donor } = require('../models');

const {Op} = require('sequelize');
const DonationService = require('../services/donationService');


exports.staffDashboard = (req, res) => {
  res.render('staff/dashboard', { 
    title: 'Staff Dashboard',
    user: req.user 
  });
};

exports.getRegisterDonor = (req, res) => {
  res.render('staff/register-donor', { message: null , title: "Register Donor" });
};

exports.postRegisterDonor = async (req, res) => {
  const { national_id, name, city, email } = req.body;

  try {
    const existing = await Donor.findOne({
      where: { [Op.or]: [{ national_id }, { email }] }
    });

    if (existing) {
      return res.render('staff/register-donor', {
        message: 'Donor with this ID or email already exists.',
        title: "Register Donor"
      });
    }

    await Donor.create({ national_id, name, city, email });

    res.render('staff/register-donor', {
      message: '✅ Donor registered successfully!',
      title: "Register Donor" 
    });
  } catch (err) {
    console.error(err);
    res.render('staff/register-donor', {
      message: '❌ An error occurred while registering.',
      title: "Register Donor"
    });
  }
};



// GET: Show Add Donation Form
exports.getAddDonation = async (req, res) => {
  try {
    const donors = await Donor.findAll({ attributes: ['id', 'national_id', 'name'] });
    console.log(donors);
    res.render('staff/add-donation', { donors, message: null, title: 'Add Donation' });
  } catch (err) {
    console.error(err);
    res.render('staff/add-donation', { donors: [], message: '❌ Error fetching donors.', title: 'Add Donation' });
  }
};

// POST: Submit Donation
// exports.postAddDonation = async (req, res) => {
//   const { donor_id, blood_type, virus_test_result, donation_city } = req.body;

//   console.log(req.body)
//   try {
//     await Donation.create({
//       donor_id,
//       blood_type,
//       virus_test_result: virus_test_result === 'true',
//       donation_city
//     });

//     const donors = await Donor.findAll({ attributes: ['id', 'name'] });

//     console.log("add suucess")
//     res.render('staff/add-donation', {
//       donors,
//       message: '✅ Donation added successfully!',
//       title: 'Add Donation'
//     });
//   } catch (err) {
//     console.error(err);
//     const donors = await Donor.findAll({ attributes: ['id', 'name'] });
//     res.render('staff/add-donation', {
//       donors,
//       message: '❌ Error while saving donation.',
//       title: 'Add Donation'
//     });
//   }
// };


exports.postAddDonation = async (req, res) => {
  const { donor_id, blood_type, donation_city } = req.body;

  try {
    const result = await DonationService.createDonation({ donor_id, blood_type, donation_city });

    if (!result.success) {
      return res.render('staff/add-donation', {
        donors: await Donor.findAll({ attributes: ['id', 'national_id', 'name'] }),
        message: `❌ ${result.reason}`,
        title: 'Add Donation'
      });
    }

    return res.render('staff/add-donation', {
      donors: await Donor.findAll({ attributes: ['id', 'national_id', 'name'] }),
      message: '✅ Donation submitted successfully!',
      title: 'Add Donation'
    });
  } catch (err) {
    console.error(err);
    res.render('staff/add-donation', {
      donors: await Donor.findAll({ attributes: ['id', 'national_id', 'name'] }),
      message: '❌ Error creating donation.',
      title: 'Add Donation'
    });
  }
};

exports.postUpdateTestResult = async (req, res) => {
  const { donation_id, virus_test_result } = req.body;

  try {
    await DonationService.updateTestResult(donation_id, virus_test_result);
    res.redirect('/staff/donation-list'); // or wherever you show the list
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating test result');
  }
};

exports.getDonationList = async (req, res) => {
  try {
    console.log('Fetching donations...');
    
    const donations = await Donation.findAll({
      include: [{
        model: Donor,
        as: 'Donor',  // Must match the alias in the association
        attributes: ['name', 'national_id', 'city']
      }],
      order: [['createdAt', 'DESC']]
    });

    console.log('Donations found:', donations.length);

    res.render('staff/donation-list', { 
      title: 'Donation List',
      donations,
      message: null
    });

  } catch (err) {
    console.error('Donation list error:', err);
    res.render('staff/donation-list', {
      title: 'Donation List',
      donations: [],
      message: '❌ Error loading donations: ' + err.message
    });
  }
};
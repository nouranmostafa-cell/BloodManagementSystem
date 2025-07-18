// const Donor = require('../models/Donor');
// const Donation = require("../models/Donation")
// const BloodStock = require('../models/BloodStock');

// const { sendRejectionEmail } = require('./emailService'); 

// exports.createDonation = async (data) => {
//   const { donor_id, blood_type, donation_city } = data;

//   const lastDonation = await Donation.findOne({
//     where: {
//       donor_id,
//       status: 'accepted'
//     },
//     order: [['createdAt', 'DESC']]
//   });

//   if (lastDonation) {
//     const lastDate = new Date(lastDonation.createdAt);
//     const now = new Date();
//     const diffMonths = (now - lastDate) / (1000 * 60 * 60 * 24 * 30);

//     if (diffMonths < 3) {
//       return {
//         success: false,
//         reason: 'Donation must be at least 3 months after the last donation.'
//       };
//     }
//   }

//   const donation = await Donation.create({
//     donor_id,
//     blood_type,
//     donation_city,
//     status: 'pending_test'
//   });

//   return { success: true, donation };
// };
// exports.updateTestResult = async (donationId, virus_test_result) => {
//   const donation = await Donation.findByPk(donationId, {
//     include: ['Donor']
//   });

//   if (!donation) throw new Error('Donation not found');

//   const status = virus_test_result === 'negative' ? 'accepted' : 'rejected';

//   await donation.update({ virus_test_result, status });

//   // Email logic
//   if (status === 'rejected') {
//     await sendRejectionEmail({
//       to: donation.Donor.email,
//       subject: 'Donation Rejected',
//       text: `Sorry, your recent donation was rejected due to a ${virus_test_result} virus test.`
//     });
//   } else {
//     await BloodStock.create({
//       donation_id: donation.id,
//       blood_type: donation.blood_type,
//       city: donation.donation_city,
//       expiration_date: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000) // +42 days
//     });
//   }

//   return { success: true };
// };





const Donor = require('../models/Donor');
const Donation = require('../models/Donation');
const BloodStock = require('../models/BloodStock');
const City = require('../models/City');

const { sendRejectionEmail } = require('./emailService');

exports.createDonation = async (data) => {
  const { donor_id, blood_type, city_id } = data;

  const donor = await Donor.findByPk(donor_id);
  if (!donor) {
    return { success: false, reason: 'Donor not found.' };
  }

  // 1. Prevent multiple pending donations
  const pendingDonation = await Donation.findOne({
    where: { donor_id, status: 'pending_test' }
  });

  if (pendingDonation) {
    return {
      success: false,
      reason: `A donation is already pending for ${donor.name} until test results are completed.`
    };
  }

  // 2. Check last accepted donation (must be ≥ 3 months ago)
  const lastDonation = await Donation.findOne({
    where: { donor_id, status: 'accepted' },
    order: [['createdAt', 'DESC']]
  });

  if (lastDonation) {
    const lastDate = new Date(lastDonation.createdAt);
    const now = new Date();
    const diffMonths = (now - lastDate) / (1000 * 60 * 60 * 24 * 30);

    if (diffMonths < 3) {
      // Optional: Email donor
      await sendRejectionEmail({
        to: donor.email,
        reason: 'Donation must be at least 3 months after the last accepted donation.'
      });

      return {
        success: false,
        reason: 'Donation must be at least 3 months after the last accepted donation.'
      };
    }
  }

  // 3. Create donation
  const donation = await Donation.create({
    donor_id,
    blood_type,
    city_id,
    status: 'pending_test'
  });

  return { success: true, donation };
};


exports.updateTestResult = async (donationId, virus_test_result) => {
  const donation = await Donation.findByPk(donationId, {
    include: ['Donor']
  });

  if (!donation) throw new Error('Donation not found');

  const status = virus_test_result === 'negative' ? 'accepted' : 'rejected';
  await donation.update({ virus_test_result, status });

  if (status === 'rejected') {
    if (donation.Donor && donation.Donor.email) {
      await sendRejectionEmail({
        to: donation.Donor.email,
        reason: `Your recent donation was rejected due to a ${virus_test_result} virus test.`
      });
    } else {
      console.error("No email found for donor.");
    }
  } else {
    await BloodStock.create({
      donation_id: donation.id,
      blood_type: donation.blood_type,
      city: donation.city_id,  // use city_id here instead of string!
      expiration_date: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000)
    });
  }

  return { success: true };
};

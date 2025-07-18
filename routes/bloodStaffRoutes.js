const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const staffController = require('../controllers/staffController');

router.use(verifyToken, authorizeRoles('blood_staff'));

// Dashboard
router.get('/dashboard', staffController.staffDashboard);

// Register donor
router.get('/register-donor', staffController.getRegisterDonor);
router.post('/register-donor', staffController.postRegisterDonor);

// Add donation
router.get('/add-donation', staffController.getAddDonation);
router.post('/add-donation', staffController.postAddDonation);

router.post('/update-donation-result', staffController.postUpdateTestResult);
router.get('/donation-list', staffController.getDonationList);

module.exports = router;
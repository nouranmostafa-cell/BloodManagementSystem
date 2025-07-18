const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const { adminDashboard } = require('../controllers/adminController');


router.use(verifyToken);
router.use(authorizeRoles('admin'));


// Admin dashboard
router.get('/dashboard', adminDashboard);


// // Show blood stock
// router.get('/stock', (req, res) => {
//   res.render('admin/stockList', {
//     title: 'Blood Stock',
//     stock: [
//       { blood_type: 'A+', city: 'Cairo', expiration_date: new Date() },
//       { blood_type: 'O-', city: 'Giza', expiration_date: new Date() }
//     ]
//   });
// });

// // Handle hospital requests (view all)
// router.get('/requests', (req, res) => {
//   res.render('admin/allRequests', {
//     title: 'All Requests',
//     requests: [
//       { hospital_name: 'General Hospital', blood_type: 'B+', request_city: 'Alexandria', patient_status: 'Urgent', handled: true },
//       { hospital_name: 'Clinic A', blood_type: 'O-', request_city: 'Cairo', patient_status: 'Immediate', handled: false }
//     ]
//   });
// });

module.exports = router;
